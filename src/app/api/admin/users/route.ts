import { NextResponse, connection, type NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import { escapeRegex, noStore, pageSizeFrom, pagedRows, searchText } from "@/lib/server/query";
import type { AdminUser } from "@/lib/types/admin";
import { User, type UserDoc } from "@/models/User";

const STATUSES = ["pending", "approved", "denied"] as const;

// GET /api/admin/users?page=1&pageSize=20&q=abhay&status=pending
export async function GET(request: NextRequest) {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    const params = request.nextUrl.searchParams;
    const statusParam = params.get("status");
    const status = STATUSES.find((s) => s === statusParam);
    const q = searchText(params);

    const filter: QueryFilter<UserDoc> = {};
    if (status) filter.status = status;
    if (q) {
      const pattern = escapeRegex(q);
      filter.$or = [
        { firstName: { $regex: pattern, $options: "i" } },
        { lastName: { $regex: pattern, $options: "i" } },
        { email: { $regex: pattern, $options: "i" } },
        { username: { $regex: pattern, $options: "i" } },
        // mobile is stored as a number; match its digits as text.
        {
          $expr: {
            $regexMatch: { input: { $toString: "$mobile" }, regex: pattern },
          },
        },
      ];
    }

    await connectDB();
    // The count, the pending count and the page itself are asked for at the same
    // time. A page past the end is clamped, so deleting the last user on the last
    // page doesn't strand you on an empty one.
    const [pendingCount, { paging, rows: docs }] = await Promise.all([
      User.countDocuments({ status: "pending" }),
      pagedRows(params, pageSizeFrom(params), User.countDocuments(filter), (skip, limit) =>
        User.find(filter, "firstName lastName email username mobile status role batch post")
          // "pending" sorts after "approved"/"denied", so descending puts
          // requests awaiting review first. _id keeps paging stable on ties.
          .sort({ status: -1, firstName: 1, lastName: 1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),
    ]);
    const { page, pageSize, total, totalPages } = paging;

    const users: AdminUser[] = docs.map((u) => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      username: u.username,
      mobile: u.mobile != null ? String(u.mobile) : "",
      status: u.status as AdminUser["status"],
      role: u.role as AdminUser["role"],
      batch: u.batch ?? null,
      post: u.post ?? "",
    }));

    return NextResponse.json(
      {
        success: true,
        users,
        page,
        pageSize,
        total,
        totalPages,
        pendingCount,
        currentUserId: auth.user.id,
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing users failed", error);
  }
}
