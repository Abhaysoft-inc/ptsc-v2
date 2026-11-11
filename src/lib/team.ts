// What the public Team page shows. Members are read from MongoDB by
// lib/server/public-team.ts: approved admins and members, grouped by batch.

export interface PublicTeamMember {
  id: string;
  name: string;
  /** Their position in the club, e.g. "Joint Secretary". Empty if none. */
  post: string;
  /** Graduation year, or null when the account has none. */
  batch: number | null;
  /** A photo link, or "" when they have none. */
  image: string;
}

/** Most senior first. Anything not listed sorts after these. */
export const POST_ORDER = [
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
];

/** "SECRATRY" is a misspelling the old backend accepted; show it correctly. */
export function displayPost(post: string | null | undefined) {
  return post === "SECRATRY" ? "Secretary" : (post ?? "");
}

export function postRank(post: string) {
  const i = POST_ORDER.indexOf(displayPost(post));
  return i === -1 ? POST_ORDER.length : i;
}
