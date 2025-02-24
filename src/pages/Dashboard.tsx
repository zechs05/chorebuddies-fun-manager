
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { 
  ChevronDown, 
  Filter, 
  BarChart3, 
  Award,
  Bell,
  Star,
  Gift,
  CheckCircle,
  Medal,
  Trophy,
  Settings,
  Users
} from "lucide-react";
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
  const [filterDueDate, setFilterDueDate] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

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
    if (filterDueDate !== "all") {
      const today = new Date();
      const dueDate = new Date(chore.due_date);
      if (filterDueDate === "today" && dueDate.toDateString() !== today.toDateString()) return false;
      if (filterDueDate === "week" && dueDate > new Date(today.setDate(today.getDate() + 7))) return false;
    }
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

  // Calculate trend data
  const getTrendData = (memberId: string) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const memberChores = chores?.filter(chore => 
      chore.assigned_to === memberId && 
      new Date(chore.created_at) >= lastMonth
    ) || [];

    const weeklyCompletion = Array.from({ length: 4 }, (_, weekIndex) => {
      const weekStart = new Date(lastMonth);
      weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekChores = memberChores.filter(chore => {
        const choreDate = new Date(chore.created_at);
        return choreDate >= weekStart && choreDate < weekEnd;
      });

      return {
        week: `Week ${weekIndex + 1}`,
        completed: weekChores.filter(chore => chore.status === 'completed').length,
        total: weekChores.length,
      };
    });

    return weeklyCompletion;
  };

  const calculateAchievements = (memberId: string) => {
    const memberChores = chores?.filter(chore => chore.assigned_to === memberId) || [];
    const completedChores = memberChores.filter(chore => chore.status === 'completed');
    const totalPoints = completedChores.reduce((sum, chore) => sum + (chore.points || 0), 0);
    
    return {
      totalCompleted: completedChores.length,
      totalPoints,
      badges: [
        { name: "Quick Finisher", earned: completedChores.some(chore => {
          if (!chore.created_at || !chore.updated_at) return false;
          const completionTime = new Date(chore.updated_at).getTime() - new Date(chore.created_at).getTime();
          return completionTime < 3600000; // 1 hour
        })},
        { name: "Point Master", earned: totalPoints >= 100 },
        { name: "Consistent Achiever", earned: completedChores.length >= 10 },
      ]
    };
  };

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
          <div className="flex gap-4">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        <QuickStats
          activeChores={activeChores}
          familyMembersCount={familyMembers?.length || 0}
          completedToday={completedToday}
          totalPoints={totalPoints}
        />

        {/* Enhanced Filters */}
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
                <div className="flex items-center gap-2">
                  <Label>Due Date</Label>
                  <Select value={filterDueDate} onValueChange={setFilterDueDate}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by due date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Due Today</SelectItem>
                      <SelectItem value="week">Due This Week</SelectItem>
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

        {/* Performance Tracking and Rewards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>Track completion rates and points</CardDescription>
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

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>Latest milestones and badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers?.map(member => {
                  const achievements = calculateAchievements(member.id);
                  return (
                    <div key={member.id} className="space-y-2">
                      <h3 className="font-medium">{member.name}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {achievements.badges.map(badge => (
                          <div
                            key={badge.name}
                            className={`p-2 rounded-lg text-center ${
                              badge.earned
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-neutral-100 text-neutral-400'
                            }`}
                          >
                            <Medal
                              className={`h-5 w-5 mx-auto mb-1 ${
                                badge.earned ? 'text-yellow-500' : 'text-neutral-400'
                              }`}
                            />
                            <p className="text-xs font-medium">{badge.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reward Store */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Reward Store
              </CardTitle>
              <CardDescription>Redeem points for rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "30min Extra Screen Time", points: 50 },
                  { name: "Choose Dinner Menu", points: 100 },
                  { name: "Weekend Activity Pick", points: 200 },
                ].map(reward => (
                  <div key={reward.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-green-600">{reward.points} points</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Family Leaderboard
            </CardTitle>
            <CardDescription>See who's leading in points and completed chores</CardDescription>
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
    </DashboardLayout>
  );
};

export default Dashboard;
