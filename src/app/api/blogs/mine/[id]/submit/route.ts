import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { badRequest } from "@/lib/server/query";
import { loadForUser } from "@/lib/server/blog-access";
import { fieldsOf, loadBlog, toBlogDetail } from "@/lib/server/blogs";
import { submitProblems, submitTarget } from "@/lib/blog-rules";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };

// POST /api/blogs/mine/:id/submit — send the post (or, for a published post, the
// edit in progress) to the reviewers. Only its author can do this.
export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;

  try {
    const auth = await requireRole(["admin", "member", "normal"]);
    if ("response" in auth) return auth.response;

    await connectDB();
    const found = await loadForUser(id, auth.user);
    if ("response" in found) return found.response;
    const { blog, mine } = found;
    if (!mine) {
      return NextResponse.json(
        { success: false, message: "Only the author can submit this post." },
        { status: 403 }
      );
    }

    const target = submitTarget({
      status: blog.status as "draft",
      revision: (blog.revision?.state as "draft" | undefined) ?? null,
    });
    if (!target) {
      return NextResponse.json(
        { success: false, message: "This post can't be submitted right now." },
        { status: 409 }
      );
    }

    const problems = submitProblems(fieldsOf(target === "post" ? blog : blog.revision!));
    if (problems.length > 0) return badRequest(problems[0], { form: problems.join(" ") });

    const now = new Date();
    await Blog.updateOne(
      { _id: id },
      target === "post"
        ? { $set: { status: "pending", submittedAt: now, reviewNote: "" } }
        : {
            $set: {
              "revision.state": "pending",
              "revision.submittedAt": now,
              "revision.reviewNote": "",
            },
          }
    );

    const saved = await loadBlog(id);
    return NextResponse.json({
      success: true,
      message: "Sent for review.",
      blog: toBlogDetail(saved!),
    });
  } catch (error) {
    return serverError("Submitting the post failed", error);
  }
}
