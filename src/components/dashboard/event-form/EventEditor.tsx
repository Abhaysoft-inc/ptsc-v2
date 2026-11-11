"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventForm from "@/components/dashboard/event-form/EventForm";
import { clearDraft } from "@/components/dashboard/event-form/formModel";
import { ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { api, detailedErrorMessage, errorMessage } from "@/lib/api-client";
import type { AdminEvent, EventInput } from "@/lib/types/admin";

const BACK = "/dashboard/events";

const noopSubscribe = () => () => {};

/** False while rendering on the server, true in the browser. */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** The create / edit event screen. Pass `eventId` to edit. */
export default function EventEditor({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const editing = Boolean(eventId);
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // The form restores a saved draft from this browser, so it only renders here.
  const isClient = useIsClient();
  // Changing the key rebuilds the form from scratch ("Start over").
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    api<{ event: AdminEvent }>(`/api/admin/events/${eventId}`)
      .then((data) => !cancelled && setEvent(data.event))
      .catch((e) => !cancelled && setLoadError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const save = async (data: EventInput) => {
    try {
      await api(editing ? `/api/admin/events/${eventId}` : "/api/admin/events", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(data),
      });
      setDone(true);
      setTimeout(() => router.push(BACK), 700);
      return null;
    } catch (e) {
      return detailedErrorMessage(e);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      <Navbar />

      <main className="pt-28 pb-20 px-6 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href={BACK}
              className="group inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Events</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {editing ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {editing
                ? "Update the event details and how attendees register."
                : "Configure the event details and how attendees register."}
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center text-center py-16 rounded-2xl bg-[#111113] border border-white/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
              <p className="text-sm font-semibold text-white">
                {editing ? "Event saved" : "Event created"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Taking you back to the events…</p>
            </div>
          ) : loadError ? (
            <ErrorBlock title="Couldn't load this event" message={loadError} />
          ) : !isClient || (editing && !event) ? (
            <LoadingBlock label={editing ? "Loading event…" : "Loading form…"} />
          ) : (
            <EventForm
              key={formKey}
              cancelHref={BACK}
              initial={event ?? undefined}
              submitLabel={editing ? "Save Changes" : "Create Event"}
              onSubmit={save}
              onStartOver={
                editing
                  ? undefined
                  : () => {
                      clearDraft();
                      setFormKey((k) => k + 1);
                    }
              }
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
