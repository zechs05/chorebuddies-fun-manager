
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Award, Target } from "lucide-react";

export function DashboardAchievements() {
  return (
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
  );
}
