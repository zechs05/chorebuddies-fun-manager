
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FamilyMember } from "@/types/chores";

interface ChoreFormFieldsProps {
  title: string;
  description: string;
  points: number;
  assignedTo: string;
  familyMembers?: FamilyMember[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPointsChange: (value: number) => void;
  onAssignedToChange: (value: string) => void;
}

export function ChoreFormFields({
  title,
  description,
  points,
  assignedTo,
  familyMembers,
  onTitleChange,
  onDescriptionChange,
  onPointsChange,
  onAssignedToChange,
}: ChoreFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter chore title"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="points">Points</Label>
        <Input
          id="points"
          type="number"
          value={points}
          onChange={(e) => onPointsChange(parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="assigned">Assign To</Label>
        <select
          id="assigned"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={assignedTo}
          onChange={(e) => onAssignedToChange(e.target.value)}
        >
          <option value="">Select family member</option>
          {familyMembers?.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
