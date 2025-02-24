
import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoreChat } from "./ChoreChat";
import { Chore } from "@/types/chores";

type ChoreListProps = {
  chores: Chore[];
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>, choreId: string, type: 'before' | 'after' | 'reference') => void;
};

export function ChoreList({ chores, onUploadImage }: ChoreListProps) {
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);

  return (
    <div className="space-y-4">
      {chores.map((chore) => (
        <div
          key={chore.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-neutral-900">{chore.title}</h3>
              {chore.description && (
                <p className="text-sm text-neutral-600">{chore.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-neutral-600">
                {chore.points} points
              </div>
              {chore.due_date && (
                <div className="text-sm text-neutral-600">
                  Due: {format(new Date(chore.due_date), "PP")}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={chore.status}
              onChange={(e) => {
                const newStatus = e.target.value as Chore["status"];
                // Update status mutation would go here
              }}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChore(chore)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>

            <div className="flex items-center gap-2">
              <input
                type="file"
                id={`image-upload-${chore.id}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => onUploadImage(e, chore.id, 'reference')}
              />
              <label
                htmlFor={`image-upload-${chore.id}`}
                className="cursor-pointer"
              >
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </label>
            </div>
          </div>
        </div>
      ))}
      <ChoreChat chore={selectedChore} onClose={() => setSelectedChore(null)} />
    </div>
  );
}
