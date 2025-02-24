
import { FamilyMemberCard } from "./FamilyMemberCard";
import { FamilyLeaderboard } from "./FamilyLeaderboard";
import type { FamilyMember, LeaderboardEntry } from "@/types/chores";

type FamilyMembersListProps = {
  members: FamilyMember[];
  leaderboard: LeaderboardEntry[] | undefined;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onChat?: (member: FamilyMember) => void;
};

export function FamilyMembersList({
  members,
  leaderboard,
  onEdit,
  onDelete,
  onChat,
}: FamilyMembersListProps) {
  return (
    <div className="space-y-6">
      {leaderboard && <FamilyLeaderboard leaderboard={leaderboard} />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onEdit={onEdit}
            onDelete={onDelete}
            onChat={onChat}
          />
        ))}
      </div>
    </div>
  );
}
