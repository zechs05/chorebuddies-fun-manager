
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Chore, FamilyMember } from "@/types/chores";

type ChoreSwapRequestProps = {
  chore: Chore | null;
  familyMembers: FamilyMember[];
  onClose: () => void;
};

export function ChoreSwapRequest({ chore, familyMembers, onClose }: ChoreSwapRequestProps) {
  const [selectedMember, setSelectedMember] = useState<string>("");
  const queryClient = useQueryClient();

  const swapMutation = useMutation({
    mutationFn: async ({ choreId, requestedId }: { choreId: string; requestedId: string }) => {
      const { error } = await supabase
        .from("chore_swaps")
        .insert({
          chore_id: choreId,
          requested_id: requestedId,
          status: "pending",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Swap request sent successfully!");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSwapRequest = () => {
    if (!chore || !selectedMember) return;
    swapMutation.mutate({ choreId: chore.id, requestedId: selectedMember });
  };

  return (
    <Dialog open={!!chore} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Chore Swap</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Select family member" />
            </SelectTrigger>
            <SelectContent>
              {familyMembers?.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSwapRequest} 
            disabled={!selectedMember}
            className="w-full"
          >
            Send Swap Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
