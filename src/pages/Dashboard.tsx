
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Active Chores</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">{activeChores}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Family Members</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">{familyMembers?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Completed Today</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">{completedToday}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Total Points Earned</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">{totalPoints}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Chores</h2>
          {isChoresLoading ? (
            <div className="text-sm text-neutral-600">Loading...</div>
          ) : chores && chores.length > 0 ? (
            <div className="space-y-4">
              {chores.map((chore) => (
                <div
                  key={chore.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{chore.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      {chore.family_members?.name && (
                        <span>Assigned to: {chore.family_members.name}</span>
                      )}
                      {chore.points && (
                        <span className="font-medium text-green-600">
                          {chore.points} points
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {chore.due_date && (
                      <span className="text-sm text-neutral-600">
                        Due: {format(new Date(chore.due_date), "MMM d")}
                      </span>
                    )}
                    <Badge className={getStatusColor(chore.status)}>
                      {chore.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-600">
              No recent chores to show.
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
