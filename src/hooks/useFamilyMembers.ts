
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FamilyMember, Permission } from "@/types/chores";

const DEFAULT_PERMISSIONS: Permission = {
  manage_rewards: true,
  assign_chores: true,
  approve_chores: true,
  manage_points: true,
};

export function useFamilyMembers(userId?: string) {
  return useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select(`
          *,
          achievements (*)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data?.map(member => ({
        ...member,
        permissions: member.permissions as Permission || DEFAULT_PERMISSIONS
      })) as FamilyMember[];
    },
    enabled: !!userId,
  });
}
