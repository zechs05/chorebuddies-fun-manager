import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { ChoreList } from "@/components/chores/ChoreList";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Star, 
  Gift, 
  CheckCircle, 
  Medal,
  Trophy,
  Award
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Chore, FamilyMember } from "@/types/chores";

export default function Chores() {
  const { user } = useAuth();
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [isAddFamilyMemberOpen, setIsAddFamilyMemberOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [newFamilyMember, setNewFamilyMember] = useState({ name: "", role: "child" });
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
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

  const calculateAchievements = (memberId: string) => {
    const memberChores = chores?.filter(chore => chore.assigned_to === memberId) || [];
    const completedChores = memberChores.filter(chore => chore.status === 'completed');
    const totalPoints = completedChores.reduce((sum, chore) => sum + (chore.points || 0), 0);
    
    return {
      totalCompleted: completedChores.length,
      totalPoints,
      badges: [
        { name: "Quick Finisher", earned: completedChores.some(chore => {
          if (!chore.created_at || !chore.updated_at) return false;
          const completionTime = new Date(chore.updated_at).getTime() - new Date(chore.created_at).getTime();
          return completionTime < 3600000; // 1 hour
        })},
        { name: "Point Master", earned: totalPoints >= 100 },
        { name: "Consistent Achiever", earned: completedChores.length >= 10 },
      ]
    };
  };

  const reviewChoreMutation = useMutation({
    mutationFn: async ({ choreId, approved }: { choreId: string; approved: boolean }) => {
      const { data, error } = await supabase
        .from("chores")
        .update({
          status: approved ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', choreId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore review submitted!");
      setIsReviewModalOpen(false);
      setSelectedChore(null);
    },
    onError: (error) => {
      toast.error("Failed to review chore");
    }
  });

  const handleReviewChore = async (approved: boolean) => {
    if (!selectedChore) return;
    await reviewChoreMutation.mutate({ choreId: selectedChore.id, approved });
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rewards & Achievements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Rewards & Achievements
              </CardTitle>
              <CardDescription>Track progress and unlock rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Select Family Member</Label>
                  <Select value={selectedMember || ''} onValueChange={setSelectedMember}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Choose member" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyMembers?.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedMember && (
                  <div className="space-y-4 mt-4">
                    {(() => {
                      const achievements = calculateAchievements(selectedMember);
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <p className="text-sm text-neutral-600">Completed Chores</p>
                              <p className="text-2xl font-semibold text-neutral-900">
                                {achievements.totalCompleted}
                              </p>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-lg">
                              <p className="text-sm text-neutral-600">Total Points</p>
                              <p className="text-2xl font-semibold text-green-600">
                                {achievements.totalPoints}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium">Badges Earned</p>
                            <div className="grid grid-cols-3 gap-2">
                              {achievements.badges.map(badge => (
                                <div 
                                  key={badge.name}
                                  className={`p-2 rounded-lg text-center ${
                                    badge.earned 
                                      ? 'bg-yellow-100 text-yellow-700' 
                                      : 'bg-neutral-100 text-neutral-400'
                                  }`}
                                >
                                  <Medal className={`h-5 w-5 mx-auto mb-1 ${
                                    badge.earned ? 'text-yellow-500' : 'text-neutral-400'
                                  }`} />
                                  <p className="text-xs font-medium">{badge.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chore Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Pending Verifications
              </CardTitle>
              <CardDescription>Review and approve completed chores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chores
                  ?.filter(chore => chore.status === 'completed')
                  .slice(0, 3)
                  .map(chore => (
                    <div key={chore.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium">{chore.title}</p>
                        <p className="text-sm text-neutral-500">
                          By {chore.family_members?.name || 'Unassigned'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedChore(chore);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Reward Store Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Reward Store
              </CardTitle>
              <CardDescription>Redeem points for rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "30min Extra Screen Time", points: 50 },
                  { name: "Choose Dinner Menu", points: 100 },
                  { name: "Weekend Activity Pick", points: 200 },
                ].map(reward => (
                  <div key={reward.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium">{reward.name}</p>
                      <p className="text-sm text-green-600">{reward.points} points</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Chore List */}
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

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Review Chore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedChore && (
              <>
                <div>
                  <h3 className="font-medium">{selectedChore.title}</h3>
                  <p className="text-sm text-neutral-500">
                    By {selectedChore.family_members?.name || 'Unassigned'}
                  </p>
                  {selectedChore.description && (
                    <p className="mt-2 text-sm">{selectedChore.description}</p>
                  )}
                </div>
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleReviewChore(false)}
                    disabled={reviewChoreMutation.isPending}
                  >
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => handleReviewChore(true)}
                    disabled={reviewChoreMutation.isPending}
                  >
                    Approve
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
