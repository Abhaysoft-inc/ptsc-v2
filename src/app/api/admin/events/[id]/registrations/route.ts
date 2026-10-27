import { NextResponse, connection, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import {
  isObjectId,
  noStore,
  notFound,
  pageSizeFrom,
  paginate,
  searchText,
} from "@/lib/server/query";
import { registrationFilter, toRegistrationRow } from "@/lib/server/registrations";
import type { AttendanceCounts } from "@/lib/types/admin";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

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
    const filter = registrationFilter(id, {
      q: searchText(search),
      deleted: search.get("trash") === "1",
      attended:
        attendedParam === "present"
          ? true
          : attendedParam === "absent"
            ? false
            : undefined,
    });

    await connectDB();
    const active = registrationFilter(id, {});
    const [total, all, present, trashCount] = await Promise.all([
      EventRegistration.countDocuments(filter),
      EventRegistration.countDocuments(active),
      EventRegistration.countDocuments({ ...active, attended: true }),
      EventRegistration.countDocuments(registrationFilter(id, { deleted: true })),
    ]);
    const paging = paginate(search, total, pageSizeFrom(search));

    const docs = await EventRegistration.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip(paging.skip)
      .limit(paging.pageSize)
      .lean();

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
