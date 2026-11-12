import { Suspense } from "react";
import BlogReview from "@/components/dashboard/blog/BlogReview";

async function ReviewContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogReview postId={id} />;
}

// The id comes from the URL at request time, so it's read behind Suspense.
export default function ReviewBlogPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <ReviewContent params={params} />
    </Suspense>
  );
}
