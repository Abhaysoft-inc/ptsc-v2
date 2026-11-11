import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireStaff, serverError } from "@/lib/auth/require-admin";
import { isObjectId, notFound, parseBody } from "@/lib/server/query";
import {
  PROJECTS_TAG,
  inputToDoc,
  projectInputSchema,
  toAdminProject,
} from "@/lib/server/projects";
import { Project } from "@/models/Project";

type Context = { params: Promise<{ id: string }> };

// PATCH /api/admin/projects/:id — save the edit form (same body as create).
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Project not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, projectInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    // A link the form left empty is removed rather than stored as undefined.
    const doc = inputToDoc(body.data);
    const set = Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined));
    const unset = Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v === undefined).map(([k]) => [k, ""])
    );

    await connectDB();
    const project = await Project.findByIdAndUpdate(
      id,
      Object.keys(unset).length
        ? { $set: { ...set, updatedBy: auth.user.id }, $unset: unset }
        : { $set: { ...set, updatedBy: auth.user.id } },
      { returnDocument: "after", runValidators: true }
    ).lean();
    if (!project) return notFound("Project not found.");

    revalidateTag(PROJECTS_TAG, { expire: 0 });
    return NextResponse.json({
      success: true,
      message: "Project saved.",
      project: toAdminProject(project),
    });
  } catch (error) {
    return serverError("Saving project failed", error);
  }
}

// DELETE /api/admin/projects/:id — admins only.
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Project not found.");

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const result = await Project.deleteOne({ _id: id });
    if (result.deletedCount === 0) return notFound("Project not found.");

    revalidateTag(PROJECTS_TAG, { expire: 0 });
    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (error) {
    return serverError("Deleting project failed", error);
  }
}
