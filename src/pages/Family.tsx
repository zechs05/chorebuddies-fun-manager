
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
  const [email, setEmail] = useState("");

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
    mutationFn: async (email: string) => {
      // First check if email is already used
      const { data: exists, error: checkError } = await supabase
        .rpc('check_family_member_email', {
          p_email: email,
          p_user_id: user?.id
        });

      if (checkError) throw checkError;
      if (exists) throw new Error("This email is already registered in your family");

      const { data, error } = await supabase
        .from("family_members")
        .insert({
          email: email.toLowerCase(),
          user_id: user?.id,
          name: email.split('@')[0], // Use email username as temporary name
          role: "pending",
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member invited successfully!");
      setEmail("");
      setIsAddMemberOpen(false);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const { error } = await supabase
        .from("family_members")
        .update({
          email: email.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member updated successfully!");
      setEditingMember(null);
      setIsAddMemberOpen(false);
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
    if (!email) return;

    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember.id, email });
    } else {
      addMemberMutation.mutate(email);
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
                <DialogTitle>
                  {editingMember ? "Edit Family Member" : "Add Family Member"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingMember ? "Update" : "Send Invitation"}
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
                        setEmail(member.email || "");
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
                <p className="text-sm text-neutral-600">
                  {member.email}
                </p>
                <p className="text-sm text-neutral-500 capitalize mt-1">
                  Status: {member.invitation_status || 'pending'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
