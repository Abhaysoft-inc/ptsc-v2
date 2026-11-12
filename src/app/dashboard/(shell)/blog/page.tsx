"use client";

import { Suspense } from "react";
import PillTabs from "@/components/dashboard/PillTabs";
import { LoadingBlock } from "@/components/dashboard/ListStates";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { useApi } from "@/lib/use-api";
import type { BlogCounts } from "@/lib/types/blog";
import MyPostsView from "@/components/dashboard/blog/MyPostsView";
import ReviewView from "@/components/dashboard/blog/ReviewView";
import CategoriesView from "@/components/dashboard/blog/CategoriesView";

const VIEWS = ["My posts", "Review", "Categories"] as const;
type ViewName = (typeof VIEWS)[number];
const KEY: Record<ViewName, string | null> = { "My posts": null, Review: "review", Categories: "categories" };

/** The review tab's label carries how many posts are waiting, for reviewers. */
function ReviewCount({ children }: { children: (count: number | null) => React.ReactNode }) {
  const { data } = useApi<{ counts: BlogCounts }>("/api/admin/blogs?status=queue&pageSize=1");
  return <>{children(data?.counts.queue ?? null)}</>;
}

function BlogRoute() {
  const { role } = useAdminDashboard();
  const { params, setQuery } = useUrlQuery();
  const reviewer = role !== "normal";

  const options: ViewName[] = reviewer ? [...VIEWS] : ["My posts", "Categories"];
  const view: ViewName = options.find((v) => KEY[v] === params.get("view")) ?? "My posts";

  const tabs = (count: number | null) => {
    const label = (v: ViewName) => (v === "Review" && count ? `Review (${count})` : v);
    const labels = options.map(label);
    return (
      <PillTabs
        label="Blog sections"
        options={labels}
        value={label(view)}
        onChange={(next) => setQuery({ view: KEY[options[labels.indexOf(next)]], status: null, q: null, page: null })}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Only reviewers may ask for the queue size. */}
      {reviewer ? <ReviewCount>{tabs}</ReviewCount> : tabs(null)}

      {view === "My posts" && <MyPostsView />}
      {view === "Review" && reviewer && <ReviewView />}
      {view === "Categories" && <CategoriesView />}
    </div>
  );
}

// useSearchParams needs a Suspense boundary above it.
export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading…" />}>
      <BlogRoute />
    </Suspense>
  );
}
