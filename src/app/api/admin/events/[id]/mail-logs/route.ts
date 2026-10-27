import { NextResponse, connection, type NextRequest } from "next/server";
import mongoose, { type QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import {
  escapeRegex,
  isObjectId,
  noStore,
  notFound,
  pageSizeFrom,
  paginate,
  searchText,
} from "@/lib/server/query";
import type { MailLogRow, MailSummary } from "@/lib/types/admin";
import { EMAIL_STATUSES, EMAIL_TYPES, EmailLog, type EmailLogDoc } from "@/models/EmailLog";

type Context = { params: Promise<{ id: string }> };

// GET /api/admin/events/:id/mail-logs?page=1&q=...&type=participation&status=failed
// Returns one page of logs plus counts per type and status for the whole event.
export async function GET(request: NextRequest, { params }: Context) {
  await connection();
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const search = request.nextUrl.searchParams;
    const type = EMAIL_TYPES.find((t) => t === search.get("type"));
    const status = EMAIL_STATUSES.find((s) => s === search.get("status"));
    const q = searchText(search);

    const filter: QueryFilter<EmailLogDoc> = { eventId: id };
    if (type) filter.emailType = type;
    if (status) filter.status = status;
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      filter.$or = [{ recipientEmail: rx }, { recipientName: rx }];
    }

    await connectDB();
    const [total, grouped] = await Promise.all([
      EmailLog.countDocuments(filter),
      EmailLog.aggregate<{ _id: { type: string; status: string }; n: number }>([
        { $match: { eventId: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: { type: "$emailType", status: "$status" }, n: { $sum: 1 } } },
      ]),
    ]);
    const paging = paginate(search, total, pageSizeFrom(search));

    const docs = await EmailLog.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(paging.skip)
      .limit(paging.pageSize)
      .lean();

    const summary = Object.fromEntries(
      EMAIL_TYPES.map((t) => [t, { pending: 0, sent: 0, failed: 0, total: 0 }])
    ) as MailSummary;
    for (const g of grouped) {
      const bucket = summary[g._id.type as keyof MailSummary];
      if (!bucket) continue;
      const s = g._id.status as keyof typeof bucket;
      if (s in bucket) bucket[s] += g.n;
      bucket.total += g.n;
    }

    const logs: MailLogRow[] = docs.map((l) => ({
      id: l._id.toString(),
      recipientName: l.recipientName ?? "",
      recipientEmail: l.recipientEmail,
      emailType: l.emailType as MailLogRow["emailType"],
      status: l.status as MailLogRow["status"],
      errorMessage: l.errorMessage ?? null,
      retryCount: l.retryCount ?? 0,
      createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      sentAt: l.sentAt ? new Date(l.sentAt).toISOString() : null,
    }));

    return NextResponse.json(
      {
        success: true,
        logs,
        page: paging.page,
        pageSize: paging.pageSize,
        total: paging.total,
        totalPages: paging.totalPages,
        summary,
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing email logs failed", error);
  }
}
