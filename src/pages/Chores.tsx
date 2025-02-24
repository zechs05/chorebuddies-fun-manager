
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { ChoreList } from "@/components/chores/ChoreList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Chore, FamilyMember } from "@/types/chores";

export default function Chores() {
  const { user } = useAuth();
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [isAddFamilyMemberOpen, setIsAddFamilyMemberOpen] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState({ name: "", role: "child" });
  const queryClient = useQueryClient();

  const { data: familyMembers, isLoading: isFamilyMembersLoading } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!user,
  });

  const addFamilyMemberMutation = useMutation({
    mutationFn: async (memberData: typeof newFamilyMember) => {
      const { data, error } = await supabase
        .from("family_members")
        .insert({
          name: memberData.name.trim(),
          role: memberData.role,
          user_id: user?.id,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member added successfully!");
      setNewFamilyMember({ name: "", role: "child" });
      setIsAddFamilyMemberOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { data: chores, isLoading: isChoresLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*, family_members(name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch chores");
        throw error;
      }

      return data as Chore[];
    },
    enabled: !!user,
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

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyMember.name.trim() || !user) return;
    addFamilyMemberMutation.mutate(newFamilyMember);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Chores</h1>
          <div className="flex gap-4">
            <Dialog open={isAddFamilyMemberOpen} onOpenChange={setIsAddFamilyMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFamilyMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newFamilyMember.name}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={newFamilyMember.role}
                      onChange={(e) => setNewFamilyMember(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={addFamilyMemberMutation.isPending}>
                    {addFamilyMemberMutation.isPending ? "Adding..." : "Add Family Member"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <AddChoreForm
              isOpen={isAddChoreOpen}
              onOpenChange={setIsAddChoreOpen}
              familyMembers={familyMembers}
            />
          </div>
        </div>

        {isFamilyMembersLoading || isChoresLoading ? (
          <p>Loading...</p>
        ) : !familyMembers?.length ? (
          <div className="text-center py-8">
            <p className="text-neutral-600 mb-4">Add family members to start assigning chores!</p>
            <Button 
              variant="outline" 
              onClick={() => setIsAddFamilyMemberOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Family Member
            </Button>
          </div>
        ) : chores?.length === 0 ? (
          <p className="text-neutral-600">No chores yet. Add your first chore above!</p>
        ) : (
          <ChoreList chores={chores} onUploadImage={handleImageUpload} />
        )}
      </div>
    </DashboardLayout>
  );
}
