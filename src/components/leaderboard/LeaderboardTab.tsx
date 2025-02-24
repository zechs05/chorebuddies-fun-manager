
import React from 'react';
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { FamilyLeaderboard } from "@/components/family/FamilyLeaderboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";

export function LeaderboardTab() {
  const { data: leaderboard } = useLeaderboard();

  return (
    <div className="space-y-6">
      <FamilyLeaderboard leaderboard={leaderboard || []} />
      
      {/* Current Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Challenges</CardTitle>
              <CardDescription>Special events and competitions</CardDescription>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Weekend Warrior</h3>
                <Badge>Active</Badge>
              </div>
              <p className="text-sm text-neutral-500">Complete all weekend chores to earn bonus points!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
