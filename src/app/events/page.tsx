import EventsView from "./EventsView";

// Page 1 of the events. Reads nothing from the request, so it is built ahead of time
// and served from the CDN; ?page=N is another route (see EventsView.tsx).
export const metadata = {
  title: "Events | PTSC Club",
  description: "Workshops, hackathons, demo days and meetups run by the Programming and Tech Skills Club.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return <EventsView />;
}
