
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Chore } from "@/types/chores";

export function useAssignedChores(userId?: string) {
  return useQuery({
    queryKey: ["assignedChores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending");

      if (error) throw error;
      return data as Chore[];
    },
    enabled: !!userId,
  });
}
