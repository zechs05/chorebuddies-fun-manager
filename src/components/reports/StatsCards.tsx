
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Award, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface StatsCardsProps {
  stats: {
    total: number;
    completed: number;
    points: number;
  };
  date: DateRange;
}

export function StatsCards({ stats, date }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completion Rate
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completed} of {stats.total} chores completed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Points Earned
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.points}</div>
          <p className="text-xs text-muted-foreground">
            From completed chores
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Selected Period
          </CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {date.from ? format(date.from, "MMM dd") : "Not set"} - {date.to ? format(date.to, "MMM dd") : "Not set"}
          </div>
          <p className="text-xs text-muted-foreground">
            Date range for analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
