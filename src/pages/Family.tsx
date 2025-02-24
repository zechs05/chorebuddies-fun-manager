import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Trophy,
  MessageSquare,
  UserPlus,
  Settings,
  Star
} from "lucide-react";
import { toast } from "sonner";
import type { FamilyMember, Permission, LeaderboardEntry, Json } from "@/types/chores";

const DEFAULT_PERMISSIONS: Permission = {
  manage_rewards: true,
  assign_chores: true,
  approve_chores: true,
  manage_points: true,
};

export default function Family() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("child");
  const [permissions, setPermissions] = useState<Permission>(DEFAULT_PERMISSIONS);

  const transformFamilyMember = (member: any): FamilyMember => {
    if (!member.permissions || typeof member.permissions !== 'object') {
      return { ...member, permissions: DEFAULT_PERMISSIONS };
    }

    const permissionsObj = member.permissions as Record<string, unknown>;
    
    return {
      ...member,
      permissions: {
        manage_rewards: Boolean(permissionsObj.manage_rewards),
        assign_chores: Boolean(permissionsObj.assign_chores),
        approve_chores: Boolean(permissionsObj.approve_chores),
        manage_points: Boolean(permissionsObj.manage_points),
      }
    };
  };

  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select(`
          *,
          achievements (*)
        `)
        .eq("user_id", user?.id);

      if (error) throw error;
      return (data || []).map(transformFamilyMember) as FamilyMember[];
    },
    enabled: !!user,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
    enabled: !!user,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string; permissions: Permission }) => {
      const { data: exists, error: checkError } = await supabase
        .rpc('check_family_member_email', {
          p_email: data.email,
          p_user_id: user?.id
        });

      if (checkError) throw checkError;
      if (exists) throw new Error("This email is already registered in your family");

      const { error } = await supabase
        .from("family_members")
        .insert({
          email: data.email.toLowerCase(),
          user_id: user?.id,
          name: data.email.split('@')[0],
          role: data.role,
          permissions: data.permissions,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member invited successfully!");
      setEmail("");
      setIsAddMemberOpen(false);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, email, permissions }: { id: string; email: string; permissions: Permission }) => {
      const { error } = await supabase
        .from("family_members")
        .update({
          email: email.toLowerCase(),
          permissions,
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
      updateMemberMutation.mutate({ 
        id: editingMember.id, 
        email,
        permissions 
      });
    } else {
      addMemberMutation.mutate({ 
        email,
        role: selectedRole,
        permissions
      });
    }
  };

  const renderAchievements = (member: FamilyMember) => {
    if (!member.achievements?.length) return null;

    return (
      <div className="flex gap-2 mt-2">
        {member.achievements.map((achievement) => (
          <Badge key={achievement.id} variant="secondary">
            <Trophy className="w-3 h-3 mr-1" />
            {achievement.title}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Family Members</h1>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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

                {!editingMember && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(selectedRole === 'parent' || editingMember?.role === 'parent') && (
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="manage_rewards">Manage Rewards</Label>
                        <Switch
                          id="manage_rewards"
                          checked={permissions.manage_rewards}
                          onCheckedChange={(checked) =>
                            setPermissions(prev => ({ ...prev, manage_rewards: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="assign_chores">Assign Chores</Label>
                        <Switch
                          id="assign_chores"
                          checked={permissions.assign_chores}
                          onCheckedChange={(checked) =>
                            setPermissions(prev => ({ ...prev, assign_chores: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="approve_chores">Approve Chores</Label>
                        <Switch
                          id="approve_chores"
                          checked={permissions.approve_chores}
                          onCheckedChange={(checked) =>
                            setPermissions(prev => ({ ...prev, approve_chores: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="manage_points">Manage Points</Label>
                        <Switch
                          id="manage_points"
                          checked={permissions.manage_points}
                          onCheckedChange={(checked) =>
                            setPermissions(prev => ({ ...prev, manage_points: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

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
          <div className="grid gap-6">
            
        {/* Leaderboard Section */}
        <Card>
          <CardHeader>
            <CardTitle>Family Leaderboard</CardTitle>
            <CardDescription>See who's leading in points and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard?.map((entry: LeaderboardEntry, index: number) => (
                <div key={entry.member_id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-lg">{index + 1}</div>
                    <Avatar>
                      <AvatarImage src={familyMembers?.find(m => m.id === entry.member_id)?.avatar_url || ''} />
                      <AvatarFallback>{entry.member_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entry.member_name}</p>
                      <p className="text-sm text-neutral-500">{entry.completed_chores} chores completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">{entry.total_points} points</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Members Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar_url || ''} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEmail(member.email || "");
                        setEditingMember(member);
                        setPermissions(member.permissions || DEFAULT_PERMISSIONS);
                        setIsAddMemberOpen(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
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

                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">
                    {member.email}
                  </p>
                  <p className="text-sm text-neutral-500 capitalize">
                    Status: {member.invitation_status || 'pending'}
                  </p>
                  {member.streak_days && member.streak_days > 0 && (
                    <Badge variant="outline" className="mt-2">
                      🔥 {member.streak_days} day streak
                    </Badge>
                  )}
                  {renderAchievements(member)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )}
  </div>
</DashboardLayout>
);
}
