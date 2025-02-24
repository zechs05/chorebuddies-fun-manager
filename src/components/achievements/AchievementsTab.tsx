
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AchievementsTab() {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Earned Achievements</CardTitle>
              <CardDescription>Your collection of badges</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements?.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-neutral-500">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Challenges */}
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
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Weekly Streak</p>
                <p className="text-sm text-neutral-500">3/5 days</p>
              </div>
              <Progress value={60} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Task Master</p>
                <p className="text-sm text-neutral-500">8/10 chores</p>
              </div>
              <Progress value={80} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
