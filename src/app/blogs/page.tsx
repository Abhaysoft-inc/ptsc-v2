import BlogsClient from "./BlogsClient";

export const metadata = {
  title: "Blogs & Technical Writing | PTSC Club",
  description:
    "Deep-dives into systems engineering, shipping zero-to-one startups, product teardowns, and lessons from campus builders.",
};

export default function BlogsPage() {
  return <BlogsClient />;
}
