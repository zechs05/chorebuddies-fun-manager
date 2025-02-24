
import { Button } from "@/components/ui/button";

type FamilyHeaderProps = {
  onAddMember: () => void;
};

export function FamilyHeader({ onAddMember }: FamilyHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-neutral-900">Family Members</h1>
      <Button onClick={onAddMember}>
        Add Family Member
      </Button>
    </div>
  );
}
