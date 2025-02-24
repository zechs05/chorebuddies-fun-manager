
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ChoreItemProps {
  title: string;
  assignedTo?: string;
  points?: number;
  dueDate?: string;
  status: string;
}

export function ChoreItem({ title, assignedTo, points, dueDate, status }: ChoreItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          {assignedTo && <span>Assigned to: {assignedTo}</span>}
          {points && (
            <span className="font-medium text-green-600">{points} points</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {dueDate && (
          <span className="text-sm text-neutral-600">
            Due: {format(new Date(dueDate), "MMM d")}
          </span>
        )}
        <Badge className={getStatusColor(status)}>
          {status?.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  );
}
