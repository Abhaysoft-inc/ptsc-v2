import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Featured from "@/components/Featured";
import Footer from "@/components/Footer";
import LatestPosts from "@/components/LatestPosts";
import { getPublicEventCardsSafe } from "@/lib/server/public-events";
import { getLatestBlogs } from "@/lib/server/public-blogs";

export default async function Home() {
  // Only the first few events are shown here, so only those are fetched.
  const [{ events, total }, latestPosts] = await Promise.all([
    getPublicEventCardsSafe(1, 3),
    // A blog failure shouldn't take the home page down: the strip just doesn't show.
    getLatestBlogs(3).catch((error) => {
      console.error("Loading latest blog posts failed:", error);
      return [];
    }),
  ]);

  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-x-clip">
      <Navbar />
      <Hero />
      <Events events={events} total={total} />
      <Featured />
      <LatestPosts posts={latestPosts} />
      <Footer />
    </main>
  );
}
