
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  points_cost: number;
}

interface SuggestedRewardsProps {
  rewards: Reward[];
  onRedeem: (rewardId: string, pointsCost: number) => void;
}

export function SuggestedRewards({ rewards, onRedeem }: SuggestedRewardsProps) {
  if (!rewards || rewards.length === 0) return null;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Suggested Rewards</CardTitle>
            <CardDescription>Rewards you can redeem with your current points</CardDescription>
          </div>
          <Trophy className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="border rounded-lg p-4">
              <h4 className="font-medium">{reward.title}</h4>
              <Badge className="mt-2">{reward.points_cost} points</Badge>
              <Button
                className="w-full mt-4"
                size="sm"
                onClick={() => onRedeem(reward.id, reward.points_cost)}
              >
                Quick Redeem
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
