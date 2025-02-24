
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { FamilyMember } from "@/types/chores";

export default function Family() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [newMember, setNewMember] = useState({ name: "", role: "child" });

  const { data: familyMembers, isLoading } = useQuery({
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

  const addMemberMutation = useMutation({
    mutationFn: async (memberData: typeof newMember) => {
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
      setNewMember({ name: "", role: "child" });
      setIsAddMemberOpen(false);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (member: FamilyMember) => {
      const { error } = await supabase
        .from("family_members")
        .update({
          name: member.name,
          role: member.role,
        })
        .eq("id", member.id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member updated successfully!");
      setEditingMember(null);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member removed successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    if (editingMember) {
      updateMemberMutation.mutate({
        ...editingMember,
        name: newMember.name,
        role: newMember.role,
      });
    } else {
      addMemberMutation.mutate(newMember);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Family Members</h1>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  {editingMember ? "Update" : "Add"} Family Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p>Loading family members...</p>
        ) : !familyMembers?.length ? (
          <div className="text-center py-8">
            <p className="text-neutral-600 mb-4">No family members added yet.</p>
            <Button
              variant="outline"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Family Member
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{member.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewMember({
                          name: member.name,
                          role: member.role || "child",
                        });
                        setEditingMember(member);
                        setIsAddMemberOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to remove this family member?")) {
                          deleteMemberMutation.mutate(member.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 capitalize">
                  Role: {member.role || "Child"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
