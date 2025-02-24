
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Permission } from "@/types/chores";

type AddMemberData = {
  email: string;
  role: string;
  permissions: Permission;
  age?: number;
  preferredDifficulty?: string;
  maxWeeklyChores?: number;
  fullName?: string;
  avatarUrl?: string;
  status?: string;
};

export function useFamilyMutations(userId?: string) {
  const queryClient = useQueryClient();

  const addMember = useMutation({
    mutationFn: async (data: AddMemberData) => {
      const { data: exists, error: checkError } = await supabase
        .rpc('check_family_member_email', {
          p_email: data.email,
          p_user_id: userId
        });

      if (checkError) throw checkError;
      if (exists) throw new Error("This email is already registered in your family");

      const { error } = await supabase
        .from("family_members")
        .insert({
          email: data.email.toLowerCase(),
          user_id: userId,
          name: data.fullName || data.email.split('@')[0],
          role: data.role,
          permissions: data.permissions,
          preferred_difficulty: data.preferredDifficulty,
          max_weekly_chores: data.maxWeeklyChores,
          avatar_url: data.avatarUrl,
          age: data.age,
          status: data.status || 'active',
          invitation_status: 'pending',
          invited_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error adding family member:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member invited successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add family member");
    }
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member removed successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to remove family member");
    }
  });

  return {
    addMember,
    deleteMember,
  };
}
