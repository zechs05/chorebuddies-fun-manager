
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { FamilyMember } from "@/types/chores";

type AddChoreFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  familyMembers?: FamilyMember[];
};

export function AddChoreForm({ isOpen, onOpenChange, familyMembers }: AddChoreFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    points: 0,
    assigned_to: "",
    due_date: null as Date | null,
  });

  const addChoreMutation = useMutation({
    mutationFn: async (choreData: typeof newChore) => {
      const { data, error } = await supabase
        .from("chores")
        .insert({
          title: choreData.title.trim(),
          description: choreData.description.trim(),
          points: choreData.points,
          assigned_to: choreData.assigned_to,
          due_date: choreData.due_date?.toISOString(),
          user_id: user?.id,
          status: "pending",
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore added successfully!");
      setNewChore({
        title: "",
        description: "",
        points: 0,
        assigned_to: "",
        due_date: null,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChore.title.trim() || !user) return;
    addChoreMutation.mutate(newChore);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Chore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>
            Create a new chore with details and assignments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddChore} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newChore.title}
              onChange={(e) => setNewChore(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter chore title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newChore.description}
              onChange={(e) => setNewChore(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              value={newChore.points}
              onChange={(e) => setNewChore(prev => ({ ...prev, points: parseInt(e.target.value) }))}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned">Assign To</Label>
            <select
              id="assigned"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={newChore.assigned_to}
              onChange={(e) => setNewChore(prev => ({ ...prev, assigned_to: e.target.value }))}
            >
              <option value="">Select family member</option>
              {familyMembers?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!newChore.due_date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newChore.due_date ? format(newChore.due_date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newChore.due_date}
                  onSelect={(date: Date | null) => 
                    setNewChore(prev => ({ ...prev, due_date: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full" disabled={addChoreMutation.isPending}>
            {addChoreMutation.isPending ? "Adding..." : "Add Chore"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
