import { NextResponse, connection } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { noStore, parseBody } from "@/lib/server/query";
import {
  PROJECTS_TAG,
  inputToDoc,
  projectInputSchema,
  toAdminProject,
} from "@/lib/server/projects";
import { Project } from "@/models/Project";

// GET /api/admin/projects — every project, featured first then newest.
export async function GET() {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const docs = await Project.find({}).sort({ featured: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, projects: docs.map(toAdminProject) }, noStore);
  } catch (error) {
    return serverError("Listing projects failed", error);
  }
}

// POST /api/admin/projects — add a project.
export async function POST(request: Request) {
  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, projectInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    await connectDB();
    const project = await Project.create({
      ...inputToDoc(body.data),
      createdBy: auth.user.id,
      updatedBy: auth.user.id,
    });

    revalidateTag(PROJECTS_TAG, { expire: 0 });
    return NextResponse.json(
      { success: true, message: "Project added.", project: toAdminProject(project.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    return serverError("Adding project failed", error);
  }
}
