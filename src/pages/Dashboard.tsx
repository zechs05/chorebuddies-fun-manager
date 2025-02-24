
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ChoresList } from "@/components/dashboard/ChoresList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, Filter, BarChart3, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

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

  // Filter chores based on selected filters
  const filteredChores = chores?.filter(chore => {
    if (filterStatus !== "all" && chore.status !== filterStatus) return false;
    if (filterAssignee !== "all" && chore.assigned_to !== filterAssignee) return false;
    return true;
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

  // Prepare performance data for the chart
  const performanceData = familyMembers?.map(member => {
    const memberChores = chores?.filter(chore => chore.assigned_to === member.id) || [];
    const completed = memberChores.filter(chore => chore.status === 'completed').length;
    const total = memberChores.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      name: member.name,
      completed,
      total,
      completionRate: Math.round(completionRate),
      points: memberChores.reduce((sum, chore) => 
        chore.status === 'completed' ? sum + (chore.points || 0) : sum, 0
      ),
    };
  }) || [];

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

        {/* Chore Overview Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Chore Overview</CardTitle>
                <CardDescription>Manage and track all family chores</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Assignee</Label>
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {familyMembers?.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChoresList
              chores={filteredChores || []}
              isLoading={isChoresLoading}
            />
          </CardContent>
        </Card>

        {/* Performance Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Track completion rates and points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completionRate" name="Completion Rate %" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
              <CardDescription>
                Family members ranked by points earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...performanceData]
                  .sort((a, b) => b.points - a.points)
                  .map((member, index) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-neutral-600">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-neutral-500">
                            {member.completed} of {member.total} chores completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {member.points} points
                        </p>
                        <p className="text-sm text-neutral-500">
                          {member.completionRate}% completion rate
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
