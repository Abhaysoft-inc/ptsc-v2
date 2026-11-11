import type { EventResource, RegistrationField } from "@/lib/types/admin";

// What the public pages (landing, /events, event detail, register) show. Events
// are read from MongoDB by lib/server/public-events.ts.

export interface EventData {
  /** The URL slug, e.g. "hack-the-web". */
  id: string;
  tag: string;
  month: string;
  day: string | number;
  year?: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  locationTitle: string;
  locationSubtitle: string;
  fullAddress?: string;
  time?: string;
  attendees?: number;
  spotsLeft?: number;
  price?: string;
  status?: "upcoming" | "past";
  whatsappLink?: string;
  rulebookUrl?: string;
  speakers?: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  agenda?: {
    time: string;
    activity: string;
    details: string;
  }[];
}

/** How people sign up for an event, as the register page needs it. */
export interface PublicRegistration {
  type: "individual" | "team";
  teamMinSize: number;
  teamMaxSize: number;
  useCustomForm: boolean;
  googleFormLink: string;
  forceGoogleForm: boolean;
  /** Per registrant, or per team when type is "team". */
  fields: RegistrationField[];
  /** Asked of every team member. */
  participantFields: RegistrationField[];
}

export interface PublicEvent extends EventData {
  registration: PublicRegistration;
  /** False once the event is over, completed, or unpublished. */
  registrationOpen: boolean;
  resources: EventResource[];
}

/** The event to feature at the top of /events: the next one, else the latest. */
export function getHeroFeaturedEvent<T extends EventData>(
  events: T[]
): { event: T; isUpcoming: boolean } | null {
  if (events.length === 0) return null;
  const upcoming = events.find((e) => e.status !== "past");
  if (upcoming) return { event: upcoming, isUpcoming: true };
  return { event: events[0], isUpcoming: false };
}
