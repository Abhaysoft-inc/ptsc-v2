import BlogList, { blogListMetadata } from "./BlogList";

// Page 1 of every post. Reads nothing from the request, so it is built ahead of time
// and served from the CDN; a post change rebuilds it (the "blogs" cache tag).
// Filtered and later pages are other routes: see BlogList.tsx.
export const metadata = blogListMetadata({});

export default function BlogsPage() {
  return <BlogList />;
}
