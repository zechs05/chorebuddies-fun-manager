
import { Card } from "@/components/ui/card";
import { ChoreItem } from "./ChoreItem";

interface Chore {
  id: string;
  title: string;
  points?: number;
  due_date?: string;
  status: string;
  family_members?: {
    name: string;
  };
}

interface ChoresListProps {
  chores: Chore[];
  isLoading: boolean;
}

export function ChoresList({ chores, isLoading }: ChoresListProps) {
  return (
    <Card className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Chores</h2>
      {isLoading ? (
        <div className="text-sm text-neutral-600">Loading...</div>
      ) : chores && chores.length > 0 ? (
        <div className="space-y-4">
          {chores.map((chore) => (
            <ChoreItem
              key={chore.id}
              title={chore.title}
              assignedTo={chore.family_members?.name}
              points={chore.points}
              dueDate={chore.due_date}
              status={chore.status}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-600">
          No recent chores to show.
        </div>
      )}
    </Card>
  );
}
