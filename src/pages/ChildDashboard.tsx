
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsTab } from "@/components/rewards/RewardsTab";
import { AchievementsTab } from "@/components/achievements/AchievementsTab";
import { LeaderboardTab } from "@/components/leaderboard/LeaderboardTab";
import { MessagesTab } from "@/components/messages/MessagesTab";
import { SettingsTab } from "@/components/settings/SettingsTab";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { DashboardRewards } from "@/components/dashboard/DashboardRewards";
import { DashboardAchievements } from "@/components/dashboard/DashboardAchievements";
import { DashboardMessages } from "@/components/dashboard/DashboardMessages";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import {
  Gift,
  Trophy,
  Award,
  MessageSquare,
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
          <StatusCards stats={stats} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardRewards />
            <DashboardAchievements />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardMessages />
            <DashboardNotifications />
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
