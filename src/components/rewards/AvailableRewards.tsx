
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  type: string;
}

interface AvailableRewardsProps {
  rewards: Reward[];
  currentPoints: number;
  onRedeem: (rewardId: string, pointsCost: number) => void;
}

export function AvailableRewards({ rewards, currentPoints, onRedeem }: AvailableRewardsProps) {
  return (
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
          {rewards?.map((reward) => (
            <div key={reward.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{reward.title}</h4>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>
                <Badge>{reward.points_cost} points</Badge>
              </div>
              <Progress 
                value={(currentPoints || 0) / reward.points_cost * 100} 
                className="mb-2"
              />
              <Button
                className="w-full mt-2"
                variant="outline"
                disabled={currentPoints < reward.points_cost}
                onClick={() => onRedeem(reward.id, reward.points_cost)}
              >
                Redeem Reward
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
