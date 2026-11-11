import { NextResponse, connection, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import {
  escapeRegex,
  noStore,
  pageSizeFrom,
  pagedRows,
  parseBody,
  searchText,
} from "@/lib/server/query";
import {
  PROJECTS_TAG,
  inputToDoc,
  projectInputSchema,
  toAdminProject,
} from "@/lib/server/projects";
import { Project } from "@/models/Project";

// GET /api/admin/projects?page=1&pageSize=20&q=react
// One page of projects, featured first then newest, with an optional search in the
// title, description and technologies.
export async function GET(request: NextRequest) {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const params = request.nextUrl.searchParams;
    const q = searchText(params);
    const rx = { $regex: escapeRegex(q), $options: "i" };
    const filter = q ? { $or: [{ title: rx }, { summary: rx }, { tags: rx }] } : {};

    await connectDB();
    // The count and the page are asked for at the same time.
    const { paging, rows } = await pagedRows(
      params,
      pageSizeFrom(params),
      Project.countDocuments(filter),
      (skip, limit) =>
        Project.find(filter).sort({ featured: -1, createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean()
    );
    return NextResponse.json(
      {
        success: true,
        projects: rows.map(toAdminProject),
        page: paging.page,
        pageSize: paging.pageSize,
        total: paging.total,
        totalPages: paging.totalPages,
      },
      noStore
    );
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
