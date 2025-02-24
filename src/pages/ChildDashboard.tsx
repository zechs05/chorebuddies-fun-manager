
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChoreList } from "@/components/chores/ChoreList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChoresList } from "@/components/dashboard/ChoresList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsTab } from "@/components/rewards/RewardsTab";
import { AchievementsTab } from "@/components/achievements/AchievementsTab";
import { LeaderboardTab } from "@/components/leaderboard/LeaderboardTab";
import { MessagesTab } from "@/components/messages/MessagesTab";
import { SettingsTab } from "@/components/settings/SettingsTab";
import {
  Clock,
  ListChecks,
  ClipboardCheck,
  AlertCircle,
  Gift,
  Trophy,
  Award,
  Target,
  MessageSquare,
  Bell,
  Settings2,
} from "lucide-react";

export default function ChildDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="mr-2 h-4 w-4" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="mr-2 h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings2 className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Pending</p>
                    <p className="text-2xl font-semibold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">In Progress</p>
                    <p className="text-2xl font-semibold">{stats.in_progress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Completed</p>
                    <p className="text-2xl font-semibold">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Overdue</p>
                    <p className="text-2xl font-semibold">{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rewards & Achievements Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Rewards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Rewards</CardTitle>
                    <CardDescription>Redeem your points for rewards</CardDescription>
                  </div>
                  <Gift className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-between" variant="outline">
                    <span>30 min Screen Time</span>
                    <Badge>50 points</Badge>
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    <span>Choose Dinner Menu</span>
                    <Badge>100 points</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Achievements</CardTitle>
                    <CardDescription>Your latest accomplishments</CardDescription>
                  </div>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">First Chore Completed!</p>
                      <p className="text-sm text-neutral-500">You're on your way!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">3-Day Streak</p>
                      <p className="text-sm text-neutral-500">Keep it up!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parent Messages</CardTitle>
                    <CardDescription>Recent messages from your parents</CardDescription>
                  </div>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm">Great job on cleaning your room!</p>
                    <p className="text-xs text-neutral-500 mt-1">Mom - 2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>Updates about your chores</CardDescription>
                  </div>
                  <Bell className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm">Your "Make Bed" chore was approved!</p>
                    <p className="text-xs text-neutral-500 mt-1">Just now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsTab />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTab />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
