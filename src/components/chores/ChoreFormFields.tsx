
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FamilyMember } from "@/types/chores";

interface ChoreFormFieldsProps {
  title: string;
  description: string;
  points: number;
  assignedTo: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  familyMembers?: FamilyMember[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPointsChange: (value: number) => void;
  onAssignedToChange: (value: string) => void;
  onRecurringChange?: (value: "none" | "daily" | "weekly" | "monthly") => void;
}

export function ChoreFormFields({
  title,
  description,
  points,
  assignedTo,
  recurring = "none",
  familyMembers,
  onTitleChange,
  onDescriptionChange,
  onPointsChange,
  onAssignedToChange,
  onRecurringChange,
}: ChoreFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter chore title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter chore description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min={0}
            value={points}
            onChange={(e) => onPointsChange(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Recurring</Label>
          <Select
            value={recurring}
            onValueChange={(value: "none" | "daily" | "weekly" | "monthly") =>
              onRecurringChange?.(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not recurring</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assign To</Label>
        <Select value={assignedTo} onValueChange={onAssignedToChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select family member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {familyMembers?.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
