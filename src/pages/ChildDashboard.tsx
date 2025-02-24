
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
} from "lucide-react";
import { Chore } from "@/types/chores";
import { useEffect, useState } from "react";

export default function ChildDashboard() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [childName, setChildName] = useState<string>("");

  // Fetch the current user's information
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      // Get the child's name from family_members table
      const { data: familyMember } = await supabase
        .from("family_members")
        .select("name")
        .eq("email", user.email)
        .single();
      
      if (familyMember) {
        setChildName(familyMember.name);
      }
      
      return user;
    },
  });

  // Fetch only the chores assigned to this child
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userData?.id,
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

  // Calculate statistics for the child's chores
  const stats = {
    pending: chores?.filter((chore) => chore.status === "pending").length || 0,
    inProgress: chores?.filter((chore) => chore.status === "in_progress").length || 0,
    completed: chores?.filter((chore) => chore.status === "completed").length || 0,
    overdue: chores?.filter((chore) => {
      if (!chore.due_date) return false;
      return new Date(chore.due_date) < new Date() && chore.status !== "completed";
    }).length || 0,
  };

  const filteredChores = chores?.filter((chore) => {
    if (filterStatus !== "all" && chore.status !== filterStatus) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Welcome, {childName}</h1>
            <p className="text-neutral-500">Here are your assigned chores</p>
          </div>
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

        {/* Chore List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Chores</CardTitle>
                <CardDescription>View and update your assigned chores</CardDescription>
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
    </DashboardLayout>
  );
}
