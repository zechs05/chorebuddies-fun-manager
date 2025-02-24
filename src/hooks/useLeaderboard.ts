
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeaderboardEntry } from "@/types/chores";

export function useLeaderboard(userId?: string) {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
    enabled: !!userId,
  });
}
