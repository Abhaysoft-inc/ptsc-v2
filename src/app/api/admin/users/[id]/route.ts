import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import { badRequest, isObjectId, notFound, parseBody } from "@/lib/server/query";
import { TEAM_TAG } from "@/lib/server/public-team";
import { USER_POSTS, USER_ROLES, User } from "@/models/User";

type Context = { params: Promise<{ id: string }> };

// Either approve a pending request, or edit the fields admins control.
const patchSchema = z.union([
  z.object({ action: z.literal("approve") }),
  z.object({
    role: z.enum(USER_ROLES),
    batch: z.number().int().min(2000).max(2100).nullable(),
    post: z.enum(USER_POSTS),
  }),
]);

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("User not found.");

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, patchSchema, "Invalid values.");
    if ("response" in body) return body.response;
    const data = body.data;

    await connectDB();

    if ("action" in data) {
      const result = await User.updateOne(
        { _id: id, status: "pending" },
        { $set: { status: "approved" } }
      );
      if (result.matchedCount === 0) return notFound("No pending request for this user.");
      revalidateTag(TEAM_TAG, { expire: 0 }); // the public Team page lists approved members
      return NextResponse.json({ success: true, message: "User approved." });
    }

    // An admin changing their own role could leave the site with no admin.
    if (id === auth.user.id && data.role !== auth.user.role) {
      return badRequest("You can't change your own role.");
    }

    // The old schema has no null batch: "no batch" is a missing field.
    const update =
      data.batch === null
        ? { $set: { role: data.role, post: data.post }, $unset: { batch: "" } }
        : { $set: { role: data.role, post: data.post, batch: data.batch } };
    const result = await User.updateOne({ _id: id }, update, {
      runValidators: true,
    });
    if (result.matchedCount === 0) return notFound("User not found.");

    revalidateTag(TEAM_TAG, { expire: 0 }); // role, batch and post show on the Team page
    return NextResponse.json({ success: true, message: "User updated." });
  } catch (error) {
    return serverError("Updating user failed", error);
  }
}

// Deletes an account, or denies a pending request (the old site deleted those
// too).
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("User not found.");

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    if (id === auth.user.id) return badRequest("You can't delete your own account.");

    await connectDB();
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) return notFound("User not found.");

    revalidateTag(TEAM_TAG, { expire: 0 });
    return NextResponse.json({ success: true, message: "User deleted." });
  } catch (error) {
    return serverError("Deleting user failed", error);
  }
}
