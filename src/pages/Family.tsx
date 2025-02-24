
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddFamilyMemberDialog } from "@/components/family/AddFamilyMemberDialog";
import { ChoreSwapRequest } from "@/components/chores/ChoreSwapRequest";
import { ChoreChat } from "@/components/chores/ChoreChat";
import { EmptyFamilyState } from "@/components/family/EmptyFamilyState";
import { FamilyMembersList } from "@/components/family/FamilyMembersList";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAssignedChores } from "@/hooks/useAssignedChores";
import type { FamilyMember, Permission, Chore } from "@/types/chores";

const DEFAULT_PERMISSIONS: Permission = {
  manage_rewards: true,
  assign_chores: true,
  approve_chores: true,
  manage_points: true,
};

export default function Family() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [showSwapDialog, setShowSwapDialog] = useState(false);

  const { data: familyMembers, isLoading } = useFamilyMembers(user?.id);
  const { data: leaderboard } = useLeaderboard(user?.id);
  const { data: assignedChores } = useAssignedChores(user?.id);

  const addMemberMutation = useMutation({
    mutationFn: async (data: { 
      email: string; 
      role: string; 
      permissions: Permission;
      age?: number;
      preferredDifficulty?: string;
      maxWeeklyChores?: number;
    }) => {
      const { data: exists, error: checkError } = await supabase
        .rpc('check_family_member_email', {
          p_email: data.email,
          p_user_id: user?.id
        });

      if (checkError) throw checkError;
      if (exists) throw new Error("This email is already registered in your family");

      const { error } = await supabase
        .from("family_members")
        .insert({
          email: data.email.toLowerCase(),
          user_id: user?.id,
          name: data.email.split('@')[0],
          role: data.role,
          permissions: data.permissions,
          age: data.age,
          preferred_difficulty: data.preferredDifficulty,
          max_weekly_chores: data.maxWeeklyChores,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member invited successfully!");
      setIsAddMemberOpen(false);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member removed successfully!");
    },
  });

  const handleAddOrUpdateMember = (data: {
    email: string;
    role: string;
    permissions: Permission;
    age?: number;
    preferredDifficulty?: string;
    maxWeeklyChores?: number;
  }) => {
    addMemberMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Family Members</h1>
          <Button onClick={() => setIsAddMemberOpen(true)}>
            Add Family Member
          </Button>
        </div>

        <AddFamilyMemberDialog
          isOpen={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onSubmit={handleAddOrUpdateMember}
          editingMember={editingMember}
          defaultPermissions={DEFAULT_PERMISSIONS}
        />

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
            onDelete={(id) => deleteMemberMutation.mutate(id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
