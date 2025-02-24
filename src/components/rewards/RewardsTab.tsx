
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Clock } from "lucide-react";
import { toast } from "sonner";

export function RewardsTab() {
  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ["available-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("points_cost", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleRedeemReward = async (rewardId: string, pointsCost: number) => {
    if (!userData?.id) {
      toast.error("You must be logged in to redeem rewards");
      return;
    }

    try {
      const { data: familyMember } = await supabase
        .from("family_members")
        .select("id")
        .eq("user_id", userData.id)
        .single();

      if (!familyMember) {
        toast.error("Family member not found");
        return;
      }

      const { error } = await supabase
        .from("reward_redemptions")
        .insert([
          {
            reward_id: rewardId,
            child_id: familyMember.id,
            user_id: userData.id,
            points_spent: pointsCost,
            status: "pending"
          },
        ]);

      if (error) throw error;
      toast.success("Reward redemption requested!");
    } catch (error) {
      toast.error("Failed to redeem reward");
    }
  };

  return (
    <div className="space-y-6">
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
              {rewards?.map((reward) => (
                <Button
                  key={reward.id}
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => handleRedeemReward(reward.id, reward.points_cost)}
                >
                  <span>{reward.title}</span>
                  <Badge>{reward.points_cost} points</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redemption History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>Track your reward requests</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add redemption history items here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
