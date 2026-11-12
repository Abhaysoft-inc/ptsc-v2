import { NextResponse, connection } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { noStore } from "@/lib/server/query";
import {
  adminListPipeline,
  toAdminEventListItem,
  todayStart,
  type EventListRow,
} from "@/lib/server/events";
import { toRegistrationRow } from "@/lib/server/registrations";
import type { OverviewData } from "@/lib/types/admin";
import { Blog } from "@/models/Blog";
import { EmailLog } from "@/models/EmailLog";
import { Event } from "@/models/Event";
import { EventRegistration, type EventRegistrationDoc } from "@/models/EventRegistration";
import { User } from "@/models/User";

// GET /api/admin/overview — the numbers on the dashboard's Overview tab.
//
// Everything that doesn't depend on anything else is asked for at the same time,
// then the spotlight event is loaded, so this takes two trips to the database
// rather than a long chain of them.
export async function GET() {
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const active = { deleted: { $ne: true } };
    const live = { published: { $ne: false } };
    const today = todayStart();

    const [
      soonest,
      latestLive,
      latestAny,
      eventTotal,
      eventsOpen,
      registered,
      checkedIn,
      recent,
      approved,
      pending,
      mailRows,
      blogsAwaitingReview,
    ] = await Promise.all([
      // Spotlight: today's event, else the soonest one still ahead...
      Event.findOne({ ...live, date: { $gte: today } }, "_id").sort({ date: 1 }).lean(),
      // ...else the latest one that has passed...
      Event.findOne(live, "_id").sort({ date: -1 }).lean(),
      // ...and if nothing is published, the latest of any.
      Event.findOne({}, "_id").sort({ date: -1 }).lean(),
      Event.estimatedDocumentCount(),
      Event.countDocuments({ ...live, date: { $gte: today } }),
      EventRegistration.countDocuments(active),
      EventRegistration.countDocuments({ ...active, attended: true }),
      // The latest check-ins, with each event's title joined in the same query.
      EventRegistration.aggregate<EventRegistrationDoc & { _id: never; event: { title: string }[] }>([
        { $match: { ...active, attended: true } },
        { $sort: { attendedAt: -1 } },
        { $limit: 4 },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            pipeline: [{ $project: { title: 1 } }],
            as: "event",
          },
        },
      ]),
      User.countDocuments({ status: "approved" }),
      User.countDocuments({ status: "pending" }),
      EmailLog.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Blog.countDocuments({
        $or: [{ status: "pending" }, { status: "published", "revision.state": "pending" }],
      }),
    ]);

    const focusId = (soonest ?? latestLive ?? latestAny)?._id;
    const [focusRow] = focusId
      ? await Event.aggregate<EventListRow>(adminListPipeline({ _id: focusId }, 0, 1))
      : [];

    const mail = { sent: 0, failed: 0, pending: 0 };
    for (const row of mailRows) {
      if (row._id === "sent" || row._id === "failed" || row._id === "pending") {
        mail[row._id] = row.count;
      }
    }

    const data: OverviewData = {
      events: {
        total: eventTotal,
        open: eventsOpen,
        focus: focusRow ? toAdminEventListItem(focusRow) : null,
      },
      members: { approved, pending },
      blogs: { awaitingReview: blogsAwaitingReview },
      attendance: { registered, checkedIn },
      recentCheckIns: recent.map((r) => {
        const row = toRegistrationRow(r);
        return {
          id: row.id,
          name: row.teamName ?? row.lead.name,
          registrationId: row.registrationId,
          eventTitle: r.event[0]?.title ?? "",
          attendedAt: row.attendedAt,
        };
      }),
      mail,
    };

    return NextResponse.json({ success: true, ...data }, noStore);
  } catch (error) {
    return serverError("Loading overview failed", error);
  }
}
