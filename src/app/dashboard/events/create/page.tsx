"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventForm from "@/components/dashboard/event-form/EventForm";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function CreateEventPage() {
  const router = useRouter();
  const { handleCreateEvent } = useAdminDashboard();
  const [done, setDone] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      <Navbar />

      <main className="pt-28 pb-20 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
            
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create New Event
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Configure the event details and how attendees register.
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center text-center py-16 rounded-2xl bg-[#111113] border border-white/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-sm font-semibold text-white">Event created</p>
              <p className="text-xs text-neutral-400 mt-1">
                Taking you back to the dashboard…
              </p>
            </div>
          ) : (
            <EventForm
              cancelHref="/dashboard"
              onSubmit={(data) => {
                handleCreateEvent(data);
                setDone(true);
                setTimeout(() => router.push("/dashboard"), 700);
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
