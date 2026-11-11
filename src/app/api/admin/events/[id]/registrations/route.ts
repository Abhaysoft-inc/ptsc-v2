import { NextResponse, connection, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import {
  isObjectId,
  noStore,
  notFound,
  pageSizeFrom,
  pagedRows,
  searchText,
} from "@/lib/server/query";
import { registrationFilter, toRegistrationRow } from "@/lib/server/registrations";
import type { AttendanceCounts } from "@/lib/types/admin";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

interface Group {
  _id: { trash: boolean; present: boolean };
  n: number;
}

/** Active, present and trashed counts from the grouped totals. */
function totalsFrom(groups: Group[]) {
  let all = 0;
  let present = 0;
  let trash = 0;
  for (const g of groups) {
    if (g._id.trash) trash += g.n;
    else {
      all += g.n;
      if (g._id.present) present += g.n;
    }
  }
  return { all, present, trash };
}

// GET /api/admin/events/:id/registrations
//   ?page=1&pageSize=20&q=...   paging and search
//   &trash=1                    soft-deleted registrations instead
//   &attended=present|absent    attendance filter
// Also returns attendance counts for the whole event, across all pages.
export async function GET(request: NextRequest, { params }: Context) {
  await connection();
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const search = request.nextUrl.searchParams;
    const attendedParam = search.get("attended");
    const q = searchText(search);
    const trash = search.get("trash") === "1";
    const filter = registrationFilter(id, {
      q,
      deleted: trash,
      attended:
        attendedParam === "present" ? true : attendedParam === "absent" ? false : undefined,
    });

    await connectDB();
    // One grouped count gives the event's totals (active, present, trashed). It runs
    // at the same time as the page of rows, so the whole list costs one round trip
    // to the database instead of three or four in a row.
    const grouped = EventRegistration.aggregate<Group>([
      { $match: { eventId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: { trash: { $eq: ["$deleted", true] }, present: { $eq: ["$attended", true] } },
          n: { $sum: 1 },
        },
      },
    ]).exec();

    // With no search or filter the list's total is the event's active count, which
    // the grouped count already gives, so that case needs no extra count query.
    const isWholeList = !q && !trash && attendedParam === null;
    const total = isWholeList
      ? grouped.then((g) => totalsFrom(g).all)
      : EventRegistration.countDocuments(filter);

    const [groups, { paging, rows: docs }] = await Promise.all([
      grouped,
      pagedRows(search, pageSizeFrom(search), total, (skip, limit) =>
        EventRegistration.find(filter).sort({ createdAt: 1, _id: 1 }).skip(skip).limit(limit).lean()
      ),
    ]);

    const { all, present, trash: trashCount } = totalsFrom(groups);
    const counts: AttendanceCounts = { total: all, present, absent: all - present };

    return NextResponse.json(
      {
        success: true,
        rows: docs.map(toRegistrationRow),
        page: paging.page,
        pageSize: paging.pageSize,
        total: paging.total,
        totalPages: paging.totalPages,
        counts,
        trashCount,
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing registrations failed", error);
  }
}
