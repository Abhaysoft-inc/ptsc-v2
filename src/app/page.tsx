import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Featured from "@/components/Featured";
import Footer from "@/components/Footer";
import { getPublicEventsSafe } from "@/lib/server/public-events";

export default async function Home() {
  const events = await getPublicEventsSafe();

  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-x-clip">
      <Navbar />
      <Hero />
      <Events events={events} />
      <Featured />
      <Footer />
    </main>
  );
}
