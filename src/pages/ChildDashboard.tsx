
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Camera, Calendar, Check, Gift, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import type { Chore } from "@/types/chores";

export default function ChildDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Fetch assigned chores
  const { data: chores = [], isLoading: isLoadingChores } = useQuery({
    queryKey: ["child-chores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (name)
        `)
        .eq("assigned_to", user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Chore[];
    },
    enabled: !!user,
  });

  // Complete chore mutation
  const completeChoreMutation = useMutation({
    mutationFn: async (choreId: string) => {
      const { error } = await supabase
        .from("chores")
        .update({ status: "completed" })
        .eq("id", choreId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["child-chores"] });
      toast.success("Yay! Chore completed! 🎉");
    },
  });

  // Calculate progress
  const totalChores = chores.length;
  const completedChores = chores.filter(chore => chore.status === "completed").length;
  const progress = totalChores > 0 ? (completedChores / totalChores) * 100 : 0;
  const totalPoints = chores.reduce((sum, chore) => sum + (chore.points || 0), 0);

  // Calculate streak
  const streak = 5; // This would normally be calculated from the database

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-accent-yellow to-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Star className="h-8 w-8" />
              Welcome back, {user?.email?.split("@")[0]}!
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-4" />
              <p className="mt-2 text-sm text-neutral-600">
                {completedChores} of {totalChores} chores done
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalPoints}</div>
              <p className="text-sm text-neutral-600">Total points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{streak}</div>
              <p className="text-sm text-neutral-600">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Chores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Chores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingChores ? (
                <p>Loading your chores...</p>
              ) : chores.length === 0 ? (
                <p>No chores assigned yet! 🎉</p>
              ) : (
                chores.map((chore) => (
                  <div
                    key={chore.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{chore.title}</h3>
                      <p className="text-sm text-neutral-600">
                        {chore.points} points
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          // TODO: Implement photo upload
                          toast.info("Photo upload coming soon!");
                        }}
                      >
                        <Camera className="h-4 w-4" />
                        Add Photo
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => completeChoreMutation.mutate(chore.id)}
                        disabled={chore.status === "completed"}
                      >
                        {chore.status === "completed" ? (
                          "Done! 🎉"
                        ) : (
                          "Mark Done"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                5 Day Streak 🔥
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Early Bird 🌅
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Super Helper ⭐
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Task Master 👑
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
