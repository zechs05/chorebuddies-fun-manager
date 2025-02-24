
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface RewardRedemption {
  id: string;
  created_at: string;
  status: string;
  points_spent: number;
  rewards: {
    title: string;
    points_cost: number;
    type: string;
  };
}

interface RedemptionHistoryProps {
  redemptions: RewardRedemption[];
}

export function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>Track your reward requests</CardDescription>
          </div>
          <Clock className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {redemptions?.map((redemption) => (
            <div key={redemption.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{redemption.rewards.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(redemption.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={redemption.status === 'approved' ? 'default' : 'secondary'}>
                  {redemption.status}
                </Badge>
                <span className="text-sm font-medium">
                  -{redemption.points_spent} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
