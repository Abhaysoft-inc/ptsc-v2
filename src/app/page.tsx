import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import Featured from "@/components/Featured";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#050505] overflow-x-clip">
      <Navbar />
      <Hero />
      <Events />
      <Featured />
      <Footer />
    </main>
  );
}
