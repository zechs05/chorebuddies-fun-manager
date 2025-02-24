
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

export function DashboardRewards() {
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
  );
}
