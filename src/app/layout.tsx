import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MotionProvider from "@/components/motion/MotionProvider";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Makes canonical and share-image links absolute.
  metadataBase: new URL(siteUrl()),
  title: "Programming and Tech Skills Club",
  description:
    "A student community for learning to code, building projects together, and growing as developers. Workshops, hackathons, and peer mentoring for all skill levels.",
  openGraph: { siteName: "Programming and Tech Skills Club", type: "website" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-white selection:bg-white selection:text-black">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
