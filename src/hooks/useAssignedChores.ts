
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Chore } from "@/types/chores";

export function useAssignedChores(userId?: string) {
  return useQuery({
    queryKey: ["assignedChores", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: userChores, error: userChoresError } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name,
            email
          )
        `)
        .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
        .eq("status", "pending");

      if (userChoresError) throw userChoresError;
      return userChores as Chore[];
    },
    enabled: !!userId,
  });
}
