
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PointsBalanceCardProps {
  points: number;
}

export function PointsBalanceCard({ points }: PointsBalanceCardProps) {
  return (
    <Card className="bg-gradient-to-r from-purple-500 to-pink-500">
      <CardHeader className="text-white">
        <CardTitle className="text-3xl">
          {points} Points
        </CardTitle>
        <CardDescription className="text-white/80">
          Available to spend on rewards
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
