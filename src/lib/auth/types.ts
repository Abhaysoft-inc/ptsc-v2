export type UserRole = "admin" | "member" | "normal";

/** The signed-in user as exposed to the browser. Never includes the password hash. */
export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  batch: number | null;
  post: string;
}
