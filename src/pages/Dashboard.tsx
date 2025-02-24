
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ChoresList } from "@/components/dashboard/ChoresList";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: chores, isLoading: isChoresLoading } = useQuery({
    queryKey: ["dashboard-chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: familyMembers } = useQuery({
    queryKey: ["dashboard-family"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Compute stats
  const activeChores = chores?.filter(chore => chore.status !== 'completed')?.length || 0;
  const completedToday = chores?.filter(chore => {
    if (chore.status !== 'completed') return false;
    const choreDate = new Date(chore.updated_at);
    const today = new Date();
    return choreDate.toDateString() === today.toDateString();
  })?.length || 0;

  const totalPoints = chores?.reduce((sum, chore) => {
    if (chore.status === 'completed') {
      return sum + (chore.points || 0);
    }
    return sum;
  }, 0) || 0;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        </div>
        
        <QuickStats
          activeChores={activeChores}
          familyMembersCount={familyMembers?.length || 0}
          completedToday={completedToday}
          totalPoints={totalPoints}
        />

        <ChoresList
          chores={chores || []}
          isLoading={isChoresLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
