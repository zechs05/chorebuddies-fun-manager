
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { DashboardRewards } from "@/components/dashboard/DashboardRewards";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { DashboardMessages } from "@/components/dashboard/DashboardMessages";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { useAuth } from "@/components/AuthProvider";
import { useAssignedChores } from "@/hooks/useAssignedChores";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChildDashboard() {
  const { user } = useAuth();

  // Fetch user's profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First try to get family member profile
      const { data: familyMember, error: familyError } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (familyError) {
        console.error("Error fetching family member:", familyError);
      }

      if (familyMember) {
        return familyMember;
      }

      // Fallback to general profile if no family member found
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }

      return profile;
    },
    enabled: !!user?.id,
  });

  // Use the updated useAssignedChores hook
  const { data: chores, isLoading: isChoresLoading } = useAssignedChores(user?.id);

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

  if (isProfileLoading || isChoresLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.name || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              {profile?.email || user?.email}
            </p>
          </div>
        </div>

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
