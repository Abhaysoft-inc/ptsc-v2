import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import { fieldErrors } from "@/lib/auth/validation";
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

function badId() {
  return NextResponse.json(
    { success: false, message: "User not found." },
    { status: 404 }
  );
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid values.",
        errors: fieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const data = parsed.data;

    if ("action" in data) {
      const result = await User.updateOne(
        { _id: id, status: "pending" },
        { $set: { status: "approved" } }
      );
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, message: "No pending request for this user." },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: "User approved." });
    }

    // An admin changing their own role could leave the site with no admin.
    if (id === auth.user.id && data.role !== auth.user.role) {
      return NextResponse.json(
        { success: false, message: "You can't change your own role." },
        { status: 400 }
      );
    }

    // The old schema has no null batch: "no batch" is a missing field.
    const update =
      data.batch === null
        ? { $set: { role: data.role, post: data.post }, $unset: { batch: "" } }
        : { $set: { role: data.role, post: data.post, batch: data.batch } };
    const result = await User.updateOne({ _id: id }, update, {
      runValidators: true,
    });
    if (result.matchedCount === 0) return badId();

    return NextResponse.json({ success: true, message: "User updated." });
  } catch (error) {
    return serverError("Updating user failed", error);
  }
}

// Deletes an account, or denies a pending request (the old site deleted those
// too).
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badId();

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    if (id === auth.user.id) {
      return NextResponse.json(
        { success: false, message: "You can't delete your own account." },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) return badId();

    return NextResponse.json({ success: true, message: "User deleted." });
  } catch (error) {
    return serverError("Deleting user failed", error);
  }
}
