import { NextResponse, connection, type NextRequest } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import type { AdminUser } from "@/lib/dashboard";
import { User, type UserDoc } from "@/models/User";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const STATUSES = ["pending", "approved", "denied"] as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function positiveInt(raw: string | null, fallback: number, max = Infinity) {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? Math.min(n, max) : fallback;
}

// GET /api/admin/users?page=1&pageSize=20&q=abhay&status=pending
export async function GET(request: NextRequest) {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    const params = request.nextUrl.searchParams;
    const pageSize = positiveInt(params.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const statusParam = params.get("status");
    const status = STATUSES.find((s) => s === statusParam);
    const q = (params.get("q") ?? "").trim().slice(0, 100);

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
    const [total, pendingCount] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments({ status: "pending" }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    // Clamp so deleting the last user on the last page doesn't strand you on
    // an empty page.
    const page = Math.min(positiveInt(params.get("page"), 1), totalPages);

    const docs = await User.find(
      filter,
      "firstName lastName email username mobile status role batch post"
    )
      // "pending" sorts after "approved"/"denied", so descending puts
      // requests awaiting review first. _id keeps paging stable on ties.
      .sort({ status: -1, firstName: 1, lastName: 1, _id: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

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
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return serverError("Listing users failed", error);
  }
}
