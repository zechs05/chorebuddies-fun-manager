import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AddChoreForm } from "@/components/chores/AddChoreForm";
import { ChoreList } from "@/components/chores/ChoreList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import {
  Clock,
  Filter,
  ListChecks,
  PlusCircle,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Chore } from "@/types/chores";

export default function Chores() {
  const { user } = useAuth();
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Fetch chores data
  const { data: rawChores, isLoading: isChoresLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Transform the raw data to match our Chore type
  const chores: Chore[] = (rawChores || []).map(chore => {
    const typedChore = chore as any;
    return {
      ...typedChore,
      priority: (typedChore.priority as 'low' | 'medium' | 'high') || 'medium',
      points: typedChore.points || 0,
      verification_required: typedChore.verification_required || false,
      auto_approve: typedChore.auto_approve || false,
      reminders_enabled: typedChore.reminders_enabled || false,
      recurring: (typedChore.recurring as 'none' | 'daily' | 'weekly' | 'monthly') || 'none',
      status: typedChore.status || 'pending',
      images: [],
      messages: [],
      reminders: []
    };
  });

  // Fetch family members for assignment
  const { data: familyMembers } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredChores = chores?.filter((chore) => {
    if (filterStatus !== "all" && chore.status !== filterStatus) return false;
    if (filterAssignee !== "all" && chore.assigned_to !== filterAssignee) return false;
    if (filterPriority !== "all" && chore.priority !== filterPriority) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    pending: chores?.filter((chore) => chore.status === "pending").length || 0,
    inProgress: chores?.filter((chore) => chore.status === "in_progress").length || 0,
    completed: chores?.filter((chore) => chore.status === "completed").length || 0,
    overdue: chores?.filter((chore) => {
      if (!chore.due_date) return false;
      return new Date(chore.due_date) < new Date() && chore.status !== "completed";
    }).length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Chores Management</h1>
          <Button onClick={() => setIsAddChoreOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Chore
          </Button>
        </div>

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

        {/* Filters and Chore List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Chores</CardTitle>
                <CardDescription>Manage and track all chores</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Assignee</Label>
                  <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {familyMembers?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChoreList
              chores={filteredChores || []}
              onUploadImage={(e, choreId, type) => {
                // Handle image upload
                console.log("Upload image", { choreId, type });
              }}
            />
          </CardContent>
        </Card>
      </div>

      <AddChoreForm
        isOpen={isAddChoreOpen}
        onOpenChange={setIsAddChoreOpen}
        familyMembers={familyMembers}
      />
    </DashboardLayout>
  );
}
