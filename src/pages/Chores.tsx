
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { ChoreList } from "@/components/chores/ChoreList";
import type { Chore, FamilyMember } from "@/types/chores";

export default function Chores() {
  const { user } = useAuth();
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: familyMembers } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*");

      if (error) throw error;
      return data as FamilyMember[];
    },
  });

  const { data: chores, isLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*, family_members(name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch chores");
        throw error;
      }

      return data as Chore[];
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ 
      choreId, 
      file, 
      type 
    }: { 
      choreId: string; 
      file: File; 
      type: 'before' | 'after' | 'reference' 
    }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${choreId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from('chore-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('chore-images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('chore_images')
        .insert({
          chore_id: choreId,
          image_url: publicUrl,
          type,
          user_id: user?.id,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["choreImages"] });
      toast.success("Image uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, choreId: string, type: 'before' | 'after' | 'reference') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    uploadImageMutation.mutate({ choreId, file, type });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Chores</h1>
          <AddChoreForm
            isOpen={isAddChoreOpen}
            onOpenChange={setIsAddChoreOpen}
            familyMembers={familyMembers}
          />
        </div>

        {isLoading ? (
          <p>Loading chores...</p>
        ) : chores?.length === 0 ? (
          <p className="text-neutral-600">No chores yet. Add your first chore above!</p>
        ) : (
          <ChoreList chores={chores} onUploadImage={handleImageUpload} />
        )}
      </div>
    </DashboardLayout>
  );
}
