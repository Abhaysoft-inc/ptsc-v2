// Shapes returned by the /api/admin/* routes. Shared by the route handlers and
// the dashboard pages. Dates are ISO strings.

export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
