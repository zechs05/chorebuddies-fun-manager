
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Star } from "lucide-react";
import type { LeaderboardEntry } from "@/types/chores";

type FamilyLeaderboardProps = {
  leaderboard: LeaderboardEntry[];
};

export function FamilyLeaderboard({ leaderboard }: FamilyLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Leaderboard</CardTitle>
        <CardDescription>See who's leading in points and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((entry: LeaderboardEntry, index: number) => (
            <div key={entry.member_id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="font-bold text-lg">{index + 1}</div>
                <div>
                  <p className="font-medium">{entry.member_name}</p>
                  <p className="text-sm text-neutral-500">{entry.completed_chores} chores completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-bold">{entry.total_points} points</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
