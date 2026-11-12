import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { displayPost, postRank, type PublicTeamMember } from "@/lib/team";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

/** Cache tag for the Team page. Expire it whenever a user's account changes. */
export const TEAM_TAG = "team";

/** Only http(s) links and site-relative paths are used as photos. */
function safeImage(url: string | null | undefined) {
  const value = (url ?? "").trim();
  return /^https?:\/\/\S+$/i.test(value) || (value.startsWith("/") && !value.startsWith("//"))
    ? value
    : "";
}

/**
 * The club's team: approved admins and members. (Approved `normal` accounts are
 * students who signed up, not team members, so they're left out.) Sorted by
 * batch, then seniority of their post, then name.
 */
export async function getPublicTeam(): Promise<PublicTeamMember[]> {
  "use cache";
  cacheTag(TEAM_TAG);
  // Admin changes to members expire the "team" tag right away; the hourly refresh is a safety net.
  cacheLife("hours");

  await connectDB();
  const users = await User.find(
    { status: "approved", role: { $in: ["admin", "member"] } },
    "firstName lastName batch post imageSrc"
  ).lean();
  const profiles = await Profile.find(
    { userId: { $in: users.map((u) => u._id) } },
    "userId imageUrl"
  ).lean();
  const photoOf = new Map(profiles.map((p) => [p.userId.toString(), p.imageUrl]));

  return users
    .map((u): PublicTeamMember => ({
      id: u._id.toString(),
      name: `${u.firstName} ${u.lastName}`.replace(/\s+/g, " ").trim(),
      post: displayPost(u.post),
      batch: u.batch ?? null,
      image: safeImage(photoOf.get(u._id.toString())) || safeImage(u.imageSrc),
    }))
    .sort(
      (a, b) =>
        (a.batch ?? Infinity) - (b.batch ?? Infinity) ||
        postRank(a.post) - postRank(b.post) ||
        a.name.localeCompare(b.name)
    );
}

/** Like getPublicTeam, but a database failure gives an empty list instead of an error page. */
export async function getPublicTeamSafe(): Promise<PublicTeamMember[]> {
  try {
    return await getPublicTeam();
  } catch (error) {
    console.error("Loading the team failed:", error);
    return [];
  }
}
