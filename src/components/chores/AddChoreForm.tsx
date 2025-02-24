
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FamilyMember } from "@/types/chores";
import { ChoreFormFields } from "./ChoreFormFields";
import { DateTimeField } from "./DateTimeField";
import { ImageUploadField } from "./ImageUploadField";

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
    assigned_to: "unassigned",  // Updated default value
    due_date: null as Date | null,
    due_time: "09:00",
    image: null as File | null,
    recurring: "none" as "none" | "daily" | "weekly" | "monthly",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const addChoreMutation = useMutation({
    mutationFn: async (formData: typeof newChore) => {
      let fullDueDate = null;
      if (formData.due_date) {
        const [hours, minutes] = formData.due_time.split(':');
        fullDueDate = new Date(formData.due_date);
        fullDueDate.setHours(parseInt(hours), parseInt(minutes));
      }

      const { data: newChoreData, error: choreError } = await supabase
        .from("chores")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          points: formData.points,
          assigned_to: formData.assigned_to === "unassigned" ? null : formData.assigned_to,
          due_date: fullDueDate?.toISOString() || null,
          user_id: user?.id,
          status: "pending",
          recurring: formData.recurring,
        })
        .select()
        .single();

      if (choreError) throw choreError;

      if (formData.image && newChoreData) {
        const fileExt = formData.image.name.split('.').pop();
        const filePath = `${newChoreData.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('chore-images')
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chore-images')
          .getPublicUrl(filePath);

        const { error: imageError } = await supabase
          .from('chore_images')
          .insert({
            chore_id: newChoreData.id,
            image_url: publicUrl,
            type: 'reference',
            user_id: user?.id,
          });

        if (imageError) throw imageError;
      }

      return newChoreData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore added successfully!");
      setNewChore({
        title: "",
        description: "",
        points: 0,
        assigned_to: "unassigned",
        due_date: null,
        due_time: "09:00",
        image: null,
        recurring: "none",
      });
      setPreviewUrl(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewChore(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

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
          <ChoreFormFields
            title={newChore.title}
            description={newChore.description}
            points={newChore.points}
            assignedTo={newChore.assigned_to}
            recurring={newChore.recurring}
            familyMembers={familyMembers}
            onTitleChange={(value) => setNewChore(prev => ({ ...prev, title: value }))}
            onDescriptionChange={(value) => setNewChore(prev => ({ ...prev, description: value }))}
            onPointsChange={(value) => setNewChore(prev => ({ ...prev, points: value }))}
            onAssignedToChange={(value) => setNewChore(prev => ({ ...prev, assigned_to: value }))}
            onRecurringChange={(value) => setNewChore(prev => ({ ...prev, recurring: value }))}
          />
          <DateTimeField
            date={newChore.due_date}
            time={newChore.due_time}
            onDateChange={(date) => setNewChore(prev => ({ ...prev, due_date: date }))}
            onTimeChange={(time) => setNewChore(prev => ({ ...prev, due_time: time }))}
          />
          <ImageUploadField
            previewUrl={previewUrl}
            onImageChange={handleImageChange}
            onRemoveImage={() => {
              setNewChore(prev => ({ ...prev, image: null }));
              setPreviewUrl(null);
            }}
          />
          <Button type="submit" className="w-full" disabled={addChoreMutation.isPending}>
            {addChoreMutation.isPending ? "Adding..." : "Add Chore"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
