// Shapes returned by the /api/admin/* routes. Shared by the route handlers and
// the dashboard pages. Dates are ISO strings.

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type DashboardRole = "admin" | "member" | "normal";
export type UserStatus = "approved" | "pending" | "denied";

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

/** An event as the dashboard shows and edits it. */
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
  /** Derived: Draft (unpublished), Upcoming, Active (today) or Completed. */
  status: "Upcoming" | "Active" | "Completed" | "Draft";
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  description: string;
  /** Visible on the public website. */
  published?: boolean;
  coverImageUrl?: string;
  ruleBookUrl?: string;
  whatsappGroupLink?: string;
  resources?: EventResource[];
  registration?: EventRegistration;
}

/** What the create / edit form sends. The date is "YYYY-MM-DD". */
export type EventInput = Omit<
  AdminEvent,
  "id" | "date" | "status" | "registeredCount" | "attendedCount"
> & { date: string };

/** Numbers for the dashboard's Overview tab. */
export interface OverviewData {
  events: {
    total: number;
    /** Upcoming or happening today. */
    open: number;
    /** The event to spotlight: today's, else the next one, else the latest. */
    focus: AdminEvent | null;
  };
  members: { approved: number; pending: number };
  attendance: { registered: number; checkedIn: number };
  recentCheckIns: {
    id: string;
    name: string;
    registrationId: string;
    eventTitle: string;
    attendedAt: string | null;
  }[];
  mail: { sent: number; failed: number; pending: number };
}

export interface AdminEventSummary {
  id: string;
  title: string;
  date: string | null;
  /** "upcoming" | "past" in the existing data. */
  status: string;
  registrationType: "individual" | "team";
}

export interface RegistrationPerson {
  name: string;
  rollNo: string;
  email: string;
  contactNo: string;
  gender: string;
  branch: string;
  year: number | null;
  /** This person's own custom form answers (team member fields). */
  details: Record<string, string>;
}

export interface RegistrationRow {
  id: string;
  /** Human-facing ID, e.g. PTSC25E123. */
  registrationId: string;
  type: "individual" | "team";
  teamName: string | null;
  /** The registrant, or the team leader. */
  lead: RegistrationPerson;
  /** Every team member including the leader; empty for individuals. */
  participants: RegistrationPerson[];
  leaderIndex: number;
  attended: boolean;
  attendedAt: string | null;
  deleted: boolean;
  createdAt: string | null;
  /** Answers to the event's custom form fields, flattened to text. */
  details: Record<string, string>;
}

export interface AttendanceCounts {
  total: number;
  present: number;
  absent: number;
}

export type EmailType =
  | "registration"
  | "participation"
  | "certificate"
  | "result_selected_members";
export type EmailStatus = "pending" | "sent" | "failed";

export interface MailLogRow {
  id: string;
  recipientName: string;
  recipientEmail: string;
  emailType: EmailType;
  status: EmailStatus;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string | null;
  sentAt: string | null;
}

/** Counts per email type and status, for the whole event (all pages). */
export type MailSummary = Record<
  EmailType,
  Record<EmailStatus, number> & { total: number }
>;
