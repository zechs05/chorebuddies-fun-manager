
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target, Award, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AchievementCategorySection } from "./AchievementCategory";
import { toast } from "sonner";
import type { Achievement, AchievementCategory } from "@/types/chores";

interface LeaderboardEntry {
  member_id: string;
  member_name: string;
  completed_achievements: number;
  completed_chores: number;
  total_points: number;
}

export function AchievementsTab() {
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: upcomingAchievements } = useQuery({
    queryKey: ["upcoming-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .lt("progress", "total_required")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["achievement-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_leaderboard');

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  const { data: familyMember } = useQuery({
    queryKey: ["current-family-member", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      const { data, error } = await supabase
        .from("family_members")
        .select("id")
        .eq("user_id", userData.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userData?.id,
  });

  const shareAchievement = async (achievement: Achievement) => {
    if (!userData?.id || !familyMember?.id) {
      toast.error("Unable to share achievement");
      return;
    }

    try {
      const { error } = await supabase.from('family_chat_messages').insert({
        content: `🎉 Look! I just unlocked the "${achievement.title}" achievement!`,
        sender_id: familyMember.id,
        receiver_id: familyMember.id, // Sending to self for now, could be modified to send to specific family member
      });

      if (error) throw error;
      toast.success('Achievement shared with family!');
    } catch (error) {
      toast.error('Failed to share achievement');
    }
  };

  const categories: AchievementCategory[] = ['daily', 'weekly', 'milestone', 'special', 'bonus', 'custom'];

  return (
    <div className="space-y-6">
      {/* Trophy Cabinet */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trophy Cabinet</CardTitle>
              <CardDescription>Your collection of badges</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements?.filter(a => !a.is_secret).map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg text-center">
                <Award className="h-12 w-12 text-yellow-500 mb-2" />
                <p className="font-medium">{achievement.title}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => shareAchievement(achievement)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Challenges</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </div>
            <Target className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {upcomingAchievements?.map((achievement) => (
              <div key={achievement.id}>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-sm text-neutral-500">
                    {achievement.progress} / {achievement.total_required}
                  </p>
                </div>
                <Progress 
                  value={(achievement.progress || 0) / (achievement.total_required || 1) * 100} 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {categories.map((category) => (
        <AchievementCategorySection
          key={category}
          category={category}
          achievements={achievements?.filter(a => a.badge_type === category) || []}
        />
      ))}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Achievement Leaderboard</CardTitle>
              <CardDescription>See how you compare</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard?.map((entry, index) => (
              <div key={entry.member_id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">{index + 1}</span>
                  <div>
                    <p className="font-medium">{entry.member_name}</p>
                    <p className="text-sm text-neutral-500">{entry.completed_achievements} achievements</p>
                  </div>
                </div>
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
