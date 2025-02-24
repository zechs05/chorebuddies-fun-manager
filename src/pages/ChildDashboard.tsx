
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChoreList } from "@/components/chores/ChoreList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  ListChecks,
  ClipboardCheck,
  AlertCircle,
  Gift,
  Trophy,
  Award,
  Target,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Chore } from "@/types/chores";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ChildDashboard() {
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch the current user's information and family member details
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  // Fetch family member details
  const { data: familyMember } = useQuery({
    queryKey: ["family-member", userData?.email],
    queryFn: async () => {
      if (!userData?.email) return null;
      
      const { data } = await supabase
        .from("family_members")
        .select("*")
        .eq("email", userData.email)
        .single();
      
      return data;
    },
    enabled: !!userData?.email,
  });

  // Fetch chores
  const { data: rawChores, isLoading: isChoresLoading } = useQuery({
    queryKey: ["child-chores", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("assigned_to", userData.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userData?.id,
  });

  // Transform chores data
  const chores: Chore[] = (rawChores || []).map(chore => ({
    ...chore,
    priority: (chore.priority as 'low' | 'medium' | 'high') || 'medium',
    points: chore.points || 0,
    verification_required: chore.verification_required || false,
    auto_approve: chore.auto_approve || false,
    reminders_enabled: chore.reminders_enabled || false,
    recurring: (chore.recurring as 'none' | 'daily' | 'weekly' | 'monthly') || 'none',
    status: chore.status || 'pending',
    difficulty_level: (chore.difficulty_level as 'easy' | 'medium' | 'hard') || 'medium',
    team_members: chore.team_members || [],
    images: [],
    messages: [],
    reminders: []
  }));

  // Calculate statistics
  const stats = {
    pending: chores?.filter((chore) => chore.status === "pending").length || 0,
    inProgress: chores?.filter((chore) => chore.status === "in_progress").length || 0,
    completed: chores?.filter((chore) => chore.status === "completed").length || 0,
    overdue: chores?.filter((chore) => {
      if (!chore.due_date) return false;
      return new Date(chore.due_date) < new Date() && chore.status !== "completed";
    }).length || 0,
    totalPoints: chores?.reduce((sum, chore) => 
      chore.status === "completed" ? sum + (chore.points || 0) : sum, 0) || 0,
  };

  // Filter chores based on status
  const filteredChores = chores?.filter((chore) => {
    if (filterStatus !== "all" && chore.status !== filterStatus) return false;
    return true;
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, choreId: string, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${choreId}/${type}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chore-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success(`${type} image uploaded successfully!`);
    } catch (error) {
      toast.error('Error uploading image');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={familyMember?.avatar_url} />
                <AvatarFallback>{familyMember?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">
                  Welcome back, {familyMember?.name}!
                </h1>
                <p className="text-neutral-500">Let's tackle today's tasks!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Current Points</p>
              <p className="text-3xl font-bold text-primary">{stats.totalPoints}</p>
            </div>
          </div>
          
          {/* Progress to Next Reward */}
          <Card className="bg-neutral-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next Reward Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Screen Time (50 points)</span>
                  <span className="font-medium">{stats.totalPoints}/50 points</span>
                </div>
                <Progress value={(stats.totalPoints / 50) * 100} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending</p>
                  <p className="text-2xl font-semibold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">In Progress</p>
                  <p className="text-2xl font-semibold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Completed</p>
                  <p className="text-2xl font-semibold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Overdue</p>
                  <p className="text-2xl font-semibold">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Rewards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Rewards</CardTitle>
                  <CardDescription>Redeem your points for rewards</CardDescription>
                </div>
                <Gift className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-between" variant="outline">
                  <span>30 min Screen Time</span>
                  <Badge>50 points</Badge>
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span>Choose Dinner Menu</span>
                  <Badge>100 points</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Achievements</CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium">First Chore Completed!</p>
                    <p className="text-sm text-neutral-500">You're on your way!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">3-Day Streak</p>
                    <p className="text-sm text-neutral-500">Keep it up!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Chores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Chores</CardTitle>
                <CardDescription>View and update your assigned chores</CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Chores</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChoreList
              chores={filteredChores || []}
              onUploadImage={handleImageUpload}
            />
          </CardContent>
        </Card>

        {/* Messages & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parent Messages</CardTitle>
                  <CardDescription>Recent messages from your parents</CardDescription>
                </div>
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm">Great job on cleaning your room!</p>
                  <p className="text-xs text-neutral-500 mt-1">Mom - 2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Updates about your chores</CardDescription>
                </div>
                <Bell className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm">Your "Make Bed" chore was approved!</p>
                  <p className="text-xs text-neutral-500 mt-1">Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
