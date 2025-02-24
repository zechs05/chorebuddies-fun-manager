
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { AddFamilyMemberDialog } from "@/components/family/AddFamilyMemberDialog";
import { ChoreSwapRequest } from "@/components/chores/ChoreSwapRequest";
import { ChoreChat } from "@/components/chores/ChoreChat";
import { EmptyFamilyState } from "@/components/family/EmptyFamilyState";
import { FamilyMembersList } from "@/components/family/FamilyMembersList";
import { FamilyHeader } from "@/components/family/FamilyHeader";
import { FamilyChat } from "@/components/family/FamilyChat";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAssignedChores } from "@/hooks/useAssignedChores";
import { useFamilyMutations } from "@/hooks/useFamilyMutations";
import type { FamilyMember, Permission, Chore } from "@/types/chores";

const DEFAULT_PERMISSIONS: Permission = {
  manage_rewards: true,
  assign_chores: true,
  approve_chores: true,
  manage_points: true,
};

export default function Family() {
  const { user } = useAuth();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [chatMember, setChatMember] = useState<FamilyMember | null>(null);

  const { data: familyMembers, isLoading } = useFamilyMembers(user?.id);
  const { data: leaderboard } = useLeaderboard(user?.id);
  const { data: assignedChores } = useAssignedChores(user?.id);
  const { addMember, deleteMember } = useFamilyMutations(user?.id);

  const handleAddOrUpdateMember = (data: {
    email: string;
    role: string;
    permissions: Permission;
    age?: number;
    preferredDifficulty?: string;
    maxWeeklyChores?: number;
    fullName?: string;
    avatarUrl?: string;
  }) => {
    addMember.mutate({
      ...data,
      status: 'active'  // Add status field
    }, {
      onSuccess: () => setIsAddMemberOpen(false),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <FamilyHeader onAddMember={() => setIsAddMemberOpen(true)} />

        <AddFamilyMemberDialog
          isOpen={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onSubmit={handleAddOrUpdateMember}
          editingMember={editingMember}
          defaultPermissions={DEFAULT_PERMISSIONS}
        />

        {chatMember && (
          <FamilyChat
            isOpen={!!chatMember}
            onClose={() => setChatMember(null)}
            member={chatMember}
          />
        )}

        {selectedChore && (
          <>
            <ChoreChat
              chore={selectedChore}
              onClose={() => setSelectedChore(null)}
            />
            {showSwapDialog && (
              <ChoreSwapRequest
                chore={selectedChore}
                familyMembers={familyMembers || []}
                onClose={() => setShowSwapDialog(false)}
              />
            )}
          </>
        )}

        {isLoading ? (
          <p>Loading family members...</p>
        ) : !familyMembers?.length ? (
          <EmptyFamilyState onAddMember={() => setIsAddMemberOpen(true)} />
        ) : (
          <FamilyMembersList
            members={familyMembers}
            leaderboard={leaderboard}
            onEdit={(member) => {
              setEditingMember(member);
              setIsAddMemberOpen(true);
            }}
            onDelete={(id) => deleteMember.mutate(id)}
            onChat={(member) => setChatMember(member)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
