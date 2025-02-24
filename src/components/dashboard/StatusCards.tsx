
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Clock,
  ListChecks,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

interface ChoreStats {
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export function StatusCards({ stats }: { stats: ChoreStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600">In Progress</p>
              <p className="text-2xl font-semibold">{stats.in_progress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Completed</p>
              <p className="text-2xl font-semibold">{stats.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-neutral-600">Overdue</p>
              <p className="text-2xl font-semibold">{stats.overdue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
