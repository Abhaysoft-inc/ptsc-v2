import { Suspense } from "react";
import { getPublicTeamSafe } from "@/lib/server/public-team";
import TeamClient from "./TeamClient";

export const metadata = {
  title: "Team & Batch Members | PTSC Club",
  description:
    "Meet the students who run the Programming and Tech Skills Club, batch by batch.",
};

async function TeamContent() {
  const members = await getPublicTeamSafe();
  return <TeamClient members={members} />;
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080809] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
