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
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  batch: string;
  role: "Student Builder" | "Core Organizer" | "Admin";
  status: "Active" | "Suspended" | "Pending";
  projectsCount: number;
  eventsAttended: number;
  avatar: string;
  joinedDate: string;
}

export interface AttendanceRecord {
  id: string;
  ticketId: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
  checkInTime: string;
  status: "Checked In" | "Pending" | "Late";
  seat: string;
  batch: string;
}

export interface MailCampaign {
  id: string;
  subject: string;
  recipientGroup: string;
  recipientsCount: number;
  status: "Delivered" | "Queued" | "Draft";
  sentAt: string;
  openRate: string;
}

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
    name: "Alex Chen",
    email: "alex@campus.edu",
    batch: "Batch of 2027",
    role: "Core Organizer",
    status: "Active",
    projectsCount: 3,
    eventsAttended: 8,
    avatar: "/featured-saas.jpg",
    joinedDate: "Sep 2024",
  },
  {
    id: "usr-2",
    name: "Rohan Varma",
    email: "rohan@campus.edu",
    batch: "Batch of 2026",
    role: "Student Builder",
    status: "Active",
    projectsCount: 6,
    eventsAttended: 12,
    avatar: "/featured-collab.jpg",
    joinedDate: "Aug 2023",
  },
  {
    id: "usr-3",
    name: "Tanvi Saxena",
    email: "tanvi@campus.edu",
    batch: "Batch of 2027",
    role: "Core Organizer",
    status: "Active",
    projectsCount: 5,
    eventsAttended: 9,
    avatar: "/featured-launch.jpg",
    joinedDate: "Sep 2024",
  },
  {
    id: "usr-4",
    name: "Ishaan Mehta",
    email: "ishaan@campus.edu",
    batch: "Batch of 2026",
    role: "Student Builder",
    status: "Active",
    projectsCount: 4,
    eventsAttended: 7,
    avatar: "/featured-saas.jpg",
    joinedDate: "Nov 2023",
  },
  {
    id: "usr-5",
    name: "Aditya Nair",
    email: "aditya@campus.edu",
    batch: "Batch of 2028",
    role: "Student Builder",
    status: "Active",
    projectsCount: 3,
    eventsAttended: 4,
    avatar: "/featured-collab.jpg",
    joinedDate: "Oct 2025",
  },
  {
    id: "usr-6",
    name: "Maya Patel",
    email: "maya@campus.edu",
    batch: "Batch of 2027",
    role: "Admin",
    status: "Active",
    projectsCount: 2,
    eventsAttended: 11,
    avatar: "/featured-launch.jpg",
    joinedDate: "Jan 2024",
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    ticketId: "PTSC-7492",
    userName: "Alex Chen",
    userEmail: "alex@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "09:42 AM",
    status: "Checked In",
    seat: "Row B - 12",
    batch: "Batch 2027",
  },
  {
    id: "att-2",
    ticketId: "PTSC-8821",
    userName: "Rohan Varma",
    userEmail: "rohan@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "09:47 AM",
    status: "Checked In",
    seat: "Row A - 04",
    batch: "Batch 2026",
  },
  {
    id: "att-3",
    ticketId: "PTSC-6124",
    userName: "Tanvi Saxena",
    userEmail: "tanvi@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "09:55 AM",
    status: "Checked In",
    seat: "Row A - 05",
    batch: "Batch 2027",
  },
  {
    id: "att-4",
    ticketId: "PTSC-3921",
    userName: "Ishaan Mehta",
    userEmail: "ishaan@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "10:02 AM",
    status: "Checked In",
    seat: "Row C - 18",
    batch: "Batch 2026",
  },
  {
    id: "att-5",
    ticketId: "PTSC-9043",
    userName: "Aditya Nair",
    userEmail: "aditya@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "10:14 AM",
    status: "Late",
    seat: "Row D - 22",
    batch: "Batch 2028",
  },
  {
    id: "att-6",
    ticketId: "PTSC-5110",
    userName: "Sanya Roy",
    userEmail: "sanya@campus.edu",
    eventTitle: "PTSC HackFest '26",
    checkInTime: "—",
    status: "Pending",
    seat: "Row B - 08",
    batch: "Batch 2027",
  },
];

export const INITIAL_MAILS: MailCampaign[] = [
  {
    id: "mail-1",
    subject: "Final Confirmation: HackFest '26 Check-in Instructions & WiFi Passwords",
    recipientGroup: "HackFest Attendees (142)",
    recipientsCount: 142,
    status: "Delivered",
    sentAt: "Today at 08:00 AM",
    openRate: "94.2%",
  },
  {
    id: "mail-2",
    subject: "Reminder: Venue update to Campus Auditorium Hall A",
    recipientGroup: "All Registered HackFest Users",
    recipientsCount: 150,
    status: "Delivered",
    sentAt: "Yesterday at 04:30 PM",
    openRate: "88.7%",
  },
  {
    id: "mail-3",
    subject: "Call for Mentors: Systems & AI Tracks for Batch 2027",
    recipientGroup: "Core Organizers & Alumni (45)",
    recipientsCount: 45,
    status: "Delivered",
    sentAt: "Jan 21, 2026",
    openRate: "91.1%",
  },
  {
    id: "mail-4",
    subject: "Demo Day Guidelines & Submission Portal Instructions",
    recipientGroup: "All Community Builders (340)",
    recipientsCount: 340,
    status: "Queued",
    sentAt: "Scheduled for Feb 01",
    openRate: "—",
  },
];
