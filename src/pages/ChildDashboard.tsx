
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { DashboardRewards } from "@/components/dashboard/DashboardRewards";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { DashboardMessages } from "@/components/dashboard/DashboardMessages";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";

export default function ChildDashboard() {
  // Fetch user data and chores
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  const { data: chores } = useQuery({
    queryKey: ["child-chores", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];
      
      const { data, error } = await supabase
        .from("chores")
        .select("*")
        .eq("assigned_to", userData.id);

      if (error) throw error;
      return data;
    },
    enabled: !!userData?.id,
  });

  // Calculate statistics
  const stats = {
    pending: chores?.filter(c => c.status === 'pending').length || 0,
    in_progress: chores?.filter(c => c.status === 'in_progress').length || 0,
    completed: chores?.filter(c => c.status === 'completed').length || 0,
    overdue: chores?.filter(c => {
      if (!c.due_date) return false;
      return new Date(c.due_date) < new Date() && c.status !== 'completed';
    }).length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StatusCards stats={stats} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardRewards />
          <DashboardAchievements />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardMessages />
          <DashboardNotifications />
        </div>
      </div>
    </DashboardLayout>
  );
}
