import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Featured from "@/components/Featured";
import Footer from "@/components/Footer";
import { getPublicEventCardsSafe } from "@/lib/server/public-events";

export default async function Home() {
  // Only the first few events are shown here, so only those are fetched.
  const { events, total } = await getPublicEventCardsSafe(1, 3);

  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-x-clip">
      <Navbar />
      <Hero />
      <Events events={events} total={total} />
      <Featured />
      <Footer />
    </main>
  );
}
