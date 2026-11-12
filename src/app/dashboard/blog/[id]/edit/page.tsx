import { Suspense } from "react";
import BlogEditor from "@/components/dashboard/blog/BlogEditor";

async function EditBlogContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditor postId={id} />;
}

// The id comes from the URL at request time, so it's read behind Suspense.
export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <EditBlogContent params={params} />
    </Suspense>
  );
}
