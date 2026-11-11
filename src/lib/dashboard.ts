import type {
  AdminEvent,
  AdminUser,
  DashboardRole,
  EventRegistration,
  EventResource,
  FormFieldType,
  RegistrationField,
  UserStatus,
} from "@/lib/types/admin";

// These shapes live in lib/types/admin.ts so the API routes can share them.
// They are re-exported here so existing imports keep working.
export type {
  AdminEvent,
  AdminUser,
  DashboardRole,
  EventRegistration,
  EventResource,
  FormFieldType,
  RegistrationField,
  UserStatus,
};

export const POSTS = [
  "Secretary",
  "Joint Secretary",
  "Class Mentor",
  "Competitive Programming Head",
  "Web Development Head",
  "App Dev Head",
  "Data Science Head",
  "GenAI Head",
  "Media and Design Head",
  "Event Head",
  "Executive members",
] as const;
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  stars: number;
  githubUrl: string;
  liveUrl?: string;
}

export interface EventPass {
  ticketId: string;
  title: string;
  date: {
    month: string;
    day: string;
  };
  time: string;
  location: string;
  seatStatus: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeBatch: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  batch: string;
  points: number;
  isUser?: boolean;
}

export const CURRENT_USER = {
  name: "Alex Chen",
  batch: "Batch of 2027",
  builderScore: 0,
  rank: 0,
  sprintsCount: 0,
};

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  src: string;
  uploadedAt: string;
}

export interface FacultyAdvisor {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  profileUrl?: string;
  /** Lower numbers appear first on the public team page. */
  order: number;
}

export interface LeaderboardPlatform {
  id: string;
  name: string;
  tracked: number;
  lastSynced: string;
}

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: "med-1",
    title: "HackFest '25 Finale",
    description: "Final presentations in the main auditorium.",
    src: "/featured-launch.jpg",
    uploadedAt: "Jan 20, 2026",
  },
  {
    id: "med-2",
    title: "Core Team Meetup",
    description: "Organizers planning the spring event calendar.",
    src: "/team.jpg",
    uploadedAt: "Jan 11, 2026",
  },
  {
    id: "med-3",
    title: "Collab Sprint Highlights",
    description: "Pair-building session during the open source sprint.",
    src: "/featured-collab.jpg",
    uploadedAt: "Dec 16, 2025",
  },
  {
    id: "med-4",
    title: "Demo Day Collage",
    description: "A year of builders, demos and late-night shipping.",
    src: "/collage.png",
    uploadedAt: "Nov 30, 2025",
  },
];

export const INITIAL_ADVISORS: FacultyAdvisor[] = [
  { id: "adv-1", name: "Prof. Suresh Kulkarni", role: "Head of Department, CSE", order: 1 },
  { id: "adv-2", name: "Dr. Meera Iyer", role: "Faculty Coordinator, CSE", order: 2 },
  { id: "adv-3", name: "Dr. Anita Deshmukh", role: "Innovation Cell Mentor", order: 3 },
];

export const INITIAL_PLATFORMS: LeaderboardPlatform[] = [
  { id: "plat-1", name: "Codeforces", tracked: 84, lastSynced: "Today, 06:00 AM" },
  { id: "plat-2", name: "CodeChef", tracked: 71, lastSynced: "Today, 06:00 AM" },
  { id: "plat-3", name: "LeetCode", tracked: 96, lastSynced: "Yesterday, 06:00 AM" },
];
