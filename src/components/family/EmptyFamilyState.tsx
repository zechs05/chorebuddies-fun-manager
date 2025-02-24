
import { Button } from "@/components/ui/button";

type EmptyFamilyStateProps = {
  onAddMember: () => void;
};

export function EmptyFamilyState({ onAddMember }: EmptyFamilyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-neutral-600 mb-4">No family members added yet.</p>
      <Button
        variant="outline"
        onClick={onAddMember}
      >
        Add Your First Family Member
      </Button>
    </div>
  );
}
