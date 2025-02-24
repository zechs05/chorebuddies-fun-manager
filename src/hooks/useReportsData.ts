
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export function useReportsData(userId: string | undefined, date: DateRange, selectedMember: string) {
  const { data: familyMembers } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: choreHistory } = useQuery({
    queryKey: ["chore-history", date.from, date.to, selectedMember],
    queryFn: async () => {
      let query = supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("user_id", userId)
        .order('created_at', { ascending: false });

      if (selectedMember !== "all") {
        query = query.eq("assigned_to", selectedMember);
      }

      if (date.from) {
        query = query.gte('created_at', date.from.toISOString());
      }
      
      if (date.to) {
        query = query.lte('created_at', date.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const getTimeRangeData = () => {
    if (!choreHistory || !date.from) return [];
    
    const data = choreHistory.reduce((acc: any[], chore) => {
      const dateStr = format(new Date(chore.created_at), "MMM dd");
      const existing = acc.find(item => item.date === dateStr);
      
      if (existing) {
        existing.total += 1;
        if (chore.status === "completed") existing.completed += 1;
      } else {
        acc.push({
          date: dateStr,
          total: 1,
          completed: chore.status === "completed" ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    return data;
  };

  const getCompletionStats = () => {
    if (!choreHistory) return { total: 0, completed: 0, points: 0 };
    
    return choreHistory.reduce(
      (acc, chore) => ({
        total: acc.total + 1,
        completed: acc.completed + (chore.status === "completed" ? 1 : 0),
        points: acc.points + (chore.status === "completed" ? chore.points : 0)
      }),
      { total: 0, completed: 0, points: 0 }
    );
  };

  return {
    familyMembers,
    choreHistory,
    timeRangeData: getTimeRangeData(),
    stats: getCompletionStats()
  };
}
