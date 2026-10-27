export interface AdminEvent {
  id: string;
  title: string;
  date: {
    month: string;
    day: string;
    year: string;
  };
  time: string;
  venue: string;
  category: string;
  status: "Upcoming" | "Active" | "Completed" | "Draft";
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  description: string;
  coverImageUrl?: string;
  ruleBookUrl?: string;
  whatsappGroupLink?: string;
  resources?: EventResource[];
  registration?: EventRegistration;
}

export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "file";

export interface RegistrationField {
  id: string;
  /** Key the answer is stored under, e.g. "teamName". */
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder: string;
  description: string;
  /** Optional regex the answer must match. */
  validation: string;
  /** Choices for select / checkbox fields. */
  options: string[];
  /** File extensions accepted by file fields, e.g. ".pdf". */
  allowedTypes: string[];
  maxSizeMB: number;
}

export interface EventResource {
  label: string;
  url: string;
}

export interface EventRegistration {
  type: "individual" | "team";
  teamMinSize: number;
  teamMaxSize: number;
  useCustomForm: boolean;
  googleFormLink: string;
  forceGoogleForm: boolean;
  /** Per registrant, or per team when type is "team". */
  fields: RegistrationField[];
  /** Asked of the leader and every member; team events only. */
  participantFields: RegistrationField[];
}

export type UserStatus = "approved" | "pending";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobile: string;
  status: UserStatus;
  role: DashboardRole;
  /** Graduation year, e.g. 2027. */
  batch: number | null;
  /** Position in the club, one of POSTS, or "" for none. */
  post: string;
}

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
export type MailType = "Participation" | "Certificate";
export type MailStatus = "sent" | "pending" | "failed";

/** One email to one recipient for an event. */
export interface MailLog {
  id: string;
  eventId: string;
  recipientName: string;
  recipientEmail: string;
  emailType: MailType;
  status: MailStatus;
  error?: string;
  /** Preformatted so server and client render the same text. */
  createdAt: string;
}
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

export const ADMIN_USER = {
  name: "Abhay Sharma",
  email: "admin@ptsc.dev",
  role: "Campus Superadmin",
  badge: "SYSTEM ADMIN",
  avatar: "/featured-saas.jpg",
  lastActive: "Active Now",
  nodeId: "PTSC-CORE-01",
  securityLevel: "Tier 1 Root Access",
  twoFactorEnabled: true,
};

export const INITIAL_EVENTS: AdminEvent[] = [
  {
    id: "evt-1",
    title: "PTSC HackFest '26",
    date: { month: "JAN", day: "25", year: "2026" },
    time: "10:00 AM – 4:00 PM EST",
    venue: "Campus Auditorium Hall A",
    category: "Hackathon",
    status: "Active",
    capacity: 150,
    registeredCount: 142,
    attendedCount: 118,
    description: "Annual 24-hour campus hackathon focusing on AI agents and micro-SaaS builds.",
  },
  {
    id: "evt-2",
    title: "Rust Systems & Axum Deep-Dive",
    date: { month: "FEB", day: "08", year: "2026" },
    time: "2:00 PM – 5:30 PM EST",
    venue: "CS Lab 304",
    category: "Workshop",
    status: "Upcoming",
    capacity: 60,
    registeredCount: 58,
    attendedCount: 0,
    description: "Hands-on engineering workshop building low-latency asynchronous microservices.",
  },
  {
    id: "evt-3",
    title: "Founder Demo Day Batch '26",
    date: { month: "FEB", day: "20", year: "2026" },
    time: "6:00 PM – 9:00 PM EST",
    venue: "Student Innovation Center",
    category: "Demo Day",
    status: "Upcoming",
    capacity: 200,
    registeredCount: 184,
    attendedCount: 0,
    description: "Live pitch session to alumni angel investors and startup accelerator mentors.",
  },
  {
    id: "evt-4",
    title: "Winter Open Source Sprint",
    date: { month: "DEC", day: "15", year: "2025" },
    time: "11:00 AM – 3:00 PM EST",
    venue: "Virtual Meet Hall",
    category: "Sprint",
    status: "Completed",
    capacity: 100,
    registeredCount: 96,
    attendedCount: 91,
    description: "Collaborative bug-squashing and feature contributions across campus repos.",
  },
];

export const INITIAL_USERS: AdminUser[] = [
  {
    id: "usr-1",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex@campus.edu",
    username: "alexchen",
    mobile: "+91 98765 43210",
    status: "approved",
    role: "member",
    batch: 2027,
    post: "Web Development Head",
  },
  {
    id: "usr-2",
    firstName: "Rohan",
    lastName: "Varma",
    email: "rohan@campus.edu",
    username: "rohanvarma",
    mobile: "+91 91234 56780",
    status: "approved",
    role: "normal",
    batch: 2026,
    post: "",
  },
  {
    id: "usr-3",
    firstName: "Tanvi",
    lastName: "Saxena",
    email: "tanvi@campus.edu",
    username: "tanvisaxena",
    mobile: "+91 97654 32109",
    status: "approved",
    role: "member",
    batch: 2027,
    post: "Event Head",
  },
  {
    id: "usr-4",
    firstName: "Ishaan",
    lastName: "Mehta",
    email: "ishaan@campus.edu",
    username: "ishaanmehta",
    mobile: "+91 98123 45670",
    status: "approved",
    role: "normal",
    batch: 2026,
    post: "",
  },
  {
    id: "usr-5",
    firstName: "Aditya",
    lastName: "Nair",
    email: "aditya@campus.edu",
    username: "adityanair",
    mobile: "+91 96543 21098",
    status: "approved",
    role: "normal",
    batch: 2028,
    post: "",
  },
  {
    id: "usr-6",
    firstName: "Maya",
    lastName: "Patel",
    email: "maya@campus.edu",
    username: "mayapatel",
    mobile: "+91 90000 11122",
    status: "approved",
    role: "admin",
    batch: 2027,
    post: "Secretary",
  },
  {
    id: "usr-7",
    firstName: "Karan",
    lastName: "Joshi",
    email: "karan@campus.edu",
    username: "karanjoshi",
    mobile: "+91 99001 22334",
    status: "pending",
    role: "normal",
    batch: 2028,
    post: "",
  },
  {
    id: "usr-8",
    firstName: "Neha",
    lastName: "Rao",
    email: "neha@campus.edu",
    username: "neharao",
    mobile: "+91 98002 33445",
    status: "pending",
    role: "normal",
    batch: 2027,
    post: "",
  },
];
export const INITIAL_MAIL_LOGS: MailLog[] = [
  {
    id: "log-1",
    eventId: "evt-1",
    recipientName: "Alex Chen",
    recipientEmail: "alex@campus.edu",
    emailType: "Participation",
    status: "sent",
    createdAt: "Jan 25, 2026, 05:02 PM",
  },
  {
    id: "log-2",
    eventId: "evt-1",
    recipientName: "Tanvi Saxena",
    recipientEmail: "tanvi@campus.edu",
    emailType: "Participation",
    status: "sent",
    createdAt: "Jan 25, 2026, 05:02 PM",
  },
  {
    id: "log-3",
    eventId: "evt-1",
    recipientName: "Rohan Varma",
    recipientEmail: "rohan@campus.edu",
    emailType: "Participation",
    status: "sent",
    createdAt: "Jan 25, 2026, 05:02 PM",
  },
  {
    id: "log-4",
    eventId: "evt-1",
    recipientName: "Ishaan Mehta",
    recipientEmail: "ishaan@campus.edu",
    emailType: "Participation",
    status: "failed",
    error: "Mailbox full (452 4.2.2)",
    createdAt: "Jan 25, 2026, 05:02 PM",
  },
];
export type DashboardRole = "admin" | "member" | "normal";

export interface RegistrationParticipant {
  name: string;
  rollNo: string;
  email: string;
}

export interface Registration {
  id: string;
  eventId: string;
  type: "individual" | "team";
  /** Individual name, or the team leader for team registrations. */
  name: string;
  email: string;
  rollNo: string;
  contactNo: string;
  teamName?: string;
  participants?: RegistrationParticipant[];
  createdAt: string;
  deleted: boolean;
  /** Marked present at the event. Saved from the Attendance tab. */
  attended: boolean;
}

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

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg-1",
    eventId: "evt-1",
    type: "team",
    name: "Alex Chen",
    email: "alex@campus.edu",
    rollNo: "21CS104",
    contactNo: "+91 98765 43210",
    teamName: "Null Pointers",
    participants: [
      { name: "Alex Chen", rollNo: "21CS104", email: "alex@campus.edu" },
      { name: "Tanvi Saxena", rollNo: "21CS118", email: "tanvi@campus.edu" },
      { name: "Aditya Nair", rollNo: "22CS071", email: "aditya@campus.edu" },
    ],
    createdAt: "Jan 12, 2026, 06:42 PM",
    deleted: false,
    attended: true,
  },
  {
    id: "reg-2",
    eventId: "evt-1",
    type: "team",
    name: "Rohan Varma",
    email: "rohan@campus.edu",
    rollNo: "20CS032",
    contactNo: "+91 91234 56780",
    teamName: "Stack Overflowers",
    participants: [
      { name: "Rohan Varma", rollNo: "20CS032", email: "rohan@campus.edu" },
      { name: "Ishaan Mehta", rollNo: "20CS047", email: "ishaan@campus.edu" },
    ],
    createdAt: "Jan 13, 2026, 11:05 AM",
    deleted: false,
    attended: true,
  },
  {
    id: "reg-3",
    eventId: "evt-1",
    type: "individual",
    name: "Sanya Roy",
    email: "sanya@campus.edu",
    rollNo: "21CS140",
    contactNo: "+91 99887 76655",
    createdAt: "Jan 15, 2026, 09:20 PM",
    deleted: false,
    attended: false,
  },
  {
    id: "reg-4",
    eventId: "evt-2",
    type: "individual",
    name: "Maya Patel",
    email: "maya@campus.edu",
    rollNo: "21CS099",
    contactNo: "+91 90000 11122",
    createdAt: "Jan 28, 2026, 02:14 PM",
    deleted: false,
    attended: false,
  },
  {
    id: "reg-5",
    eventId: "evt-2",
    type: "individual",
    name: "Ishaan Mehta",
    email: "ishaan@campus.edu",
    rollNo: "20CS047",
    contactNo: "+91 98123 45670",
    createdAt: "Jan 29, 2026, 10:31 AM",
    deleted: false,
    attended: false,
  },
  {
    id: "reg-6",
    eventId: "evt-3",
    type: "team",
    name: "Tanvi Saxena",
    email: "tanvi@campus.edu",
    rollNo: "21CS118",
    contactNo: "+91 97654 32109",
    teamName: "Seed Round",
    participants: [
      { name: "Tanvi Saxena", rollNo: "21CS118", email: "tanvi@campus.edu" },
      { name: "Maya Patel", rollNo: "21CS099", email: "maya@campus.edu" },
    ],
    createdAt: "Feb 2, 2026, 05:48 PM",
    deleted: false,
    attended: false,
  },
  {
    id: "reg-7",
    eventId: "evt-4",
    type: "individual",
    name: "Aditya Nair",
    email: "aditya@campus.edu",
    rollNo: "22CS071",
    contactNo: "+91 96543 21098",
    createdAt: "Dec 8, 2025, 08:02 PM",
    deleted: true,
    attended: false,
  },
];

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

/** e.g. "Rust Systems & Axum Deep-Dive" + "reg-4" -> "RSA-REG4" */
export function formatRegistrationId(
  reg: Pick<Registration, "id" | "eventId">,
  events: Pick<AdminEvent, "id" | "title">[]
) {
  const title = events.find((e) => e.id === reg.eventId)?.title ?? "";
  const code =
    title
      .split(/\s+/)
      .map((w) => w[0])
      .filter((c) => c && /[a-z0-9]/i.test(c))
      .slice(0, 3)
      .join("")
      .toUpperCase() || "EVT";
  return `${code}-${reg.id.replace("-", "").toUpperCase()}`;
}
