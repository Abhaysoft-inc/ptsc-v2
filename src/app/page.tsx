import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Featured from "@/components/Featured";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Events />
      <Featured />
    </main>
  );
}
