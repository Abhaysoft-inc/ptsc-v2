import { NextResponse, connection } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { noStore } from "@/lib/server/query";
import { eventDay, countsByEvent, toAdminEvent, todayIST } from "@/lib/server/events";
import { toRegistrationRow } from "@/lib/server/registrations";
import type { OverviewData } from "@/lib/types/admin";
import { EmailLog } from "@/models/EmailLog";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";
import { User } from "@/models/User";

// GET /api/admin/overview — the numbers on the dashboard's Overview tab.
export async function GET() {
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const active = { deleted: { $ne: true } };

    const [events, registered, checkedIn, recent, approved, pending, mailRows] =
      await Promise.all([
        Event.find({}).sort({ date: -1 }).lean(),
        EventRegistration.countDocuments(active),
        EventRegistration.countDocuments({ ...active, attended: true }),
        EventRegistration.find({ ...active, attended: true })
          .sort({ attendedAt: -1 })
          .limit(4)
          .lean(),
        User.countDocuments({ status: "approved" }),
        User.countDocuments({ status: "pending" }),
        EmailLog.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

    // Events are newest first. Spotlight today's event, else the soonest one
    // still ahead, else the latest one that has passed.
    const today = todayIST();
    const published = events.filter((e) => e.published !== false);
    const pool = published.length ? published : events;
    const ahead = pool.filter((e) => eventDay(e.date) >= today);
    const focusDoc =
      pool.find((e) => eventDay(e.date) === today) ??
      ahead[ahead.length - 1] ?? // list is newest first, so the last is soonest
      pool[0];

    const counts = focusDoc ? await countsByEvent([focusDoc._id]) : new Map();
    const titles = new Map(events.map((e) => [e._id.toString(), e.title]));
    const mail = { sent: 0, failed: 0, pending: 0 };
    for (const row of mailRows) {
      if (row._id === "sent" || row._id === "failed" || row._id === "pending") {
        mail[row._id] = row.count;
      }
    }

    const data: OverviewData = {
      events: {
        total: events.length,
        open: pool.filter((e) => eventDay(e.date) >= today).length,
        focus: focusDoc ? toAdminEvent(focusDoc, counts.get(focusDoc._id.toString())) : null,
      },
      members: { approved, pending },
      attendance: { registered, checkedIn },
      recentCheckIns: recent.map((r) => {
        const row = toRegistrationRow(r);
        return {
          id: row.id,
          name: row.teamName ?? row.lead.name,
          registrationId: row.registrationId,
          eventTitle: titles.get(r.eventId.toString()) ?? "",
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
