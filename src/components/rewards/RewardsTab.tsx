
import React, { useState } from 'react';
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
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  Clock, 
  Trophy,
  MonitorPlay,
  PartyPopper,
  Crown,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface RewardCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface FamilyMember {
  id: string;
  total_points: number;
}

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  type: string;
}

interface RewardRedemption {
  id: string;
  created_at: string;
  status: string;
  points_spent: number;
  rewards: {
    title: string;
    points_cost: number;
    type: string;
  };
}

const rewardCategories: RewardCategory[] = [
  { id: 'screen_time', title: 'Screen Time', icon: <MonitorPlay className="h-5 w-5" /> },
  { id: 'activity', title: 'Activities', icon: <PartyPopper className="h-5 w-5" /> },
  { id: 'privilege', title: 'Privileges', icon: <Crown className="h-5 w-5" /> },
];

export function RewardsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      return user;
    },
  });

  const { data: familyMember } = useQuery<FamilyMember>({
    queryKey: ["family-member", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      
      // First get the family member id
      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("id")
        .eq("user_id", userData.id)
        .single();

      if (memberError) throw memberError;

      // Then get their total points from points_history
      const { data: pointsData, error: pointsError } = await supabase
        .from("points_history")
        .select("points")
        .eq("user_id", memberData.id);

      if (pointsError) throw pointsError;

      const totalPoints = pointsData.reduce((sum, record) => sum + record.points, 0);

      return {
        id: memberData.id,
        total_points: totalPoints
      };
    },
    enabled: !!userData?.id,
  });

  const { data: rewards } = useQuery<Reward[]>({
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

  const { data: redemptionHistory } = useQuery<RewardRedemption[]>({
    queryKey: ["redemption-history", familyMember?.id],
    queryFn: async () => {
      if (!familyMember?.id) return null;
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          rewards (
            title,
            points_cost,
            type
          )
        `)
        .eq("child_id", familyMember.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!familyMember?.id,
  });

  const handleRedeemReward = async (rewardId: string, pointsCost: number) => {
    if (!userData?.id) {
      toast.error("You must be logged in to redeem rewards");
      return;
    }

    if (!familyMember || familyMember.total_points < pointsCost) {
      toast.error("Not enough points to redeem this reward");
      return;
    }

    try {
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

  const filteredRewards = rewards?.filter(reward => 
    selectedCategory === 'all' ? true : reward.type === selectedCategory
  );

  const suggestedRewards = rewards?.filter(reward => 
    familyMember?.total_points && reward.points_cost <= familyMember.total_points
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader className="text-white">
          <CardTitle className="text-3xl">
            {familyMember?.total_points || 0} Points
          </CardTitle>
          <CardDescription className="text-white/80">
            Available to spend on rewards
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? "default" : "outline"}
          onClick={() => setSelectedCategory('all')}
        >
          <Gift className="h-4 w-4 mr-2" />
          All Rewards
        </Button>
        {rewardCategories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon}
            <span className="ml-2">{category.title}</span>
          </Button>
        ))}
      </div>

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
              {filteredRewards?.map((reward) => (
                <div key={reward.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{reward.title}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <Badge>{reward.points_cost} points</Badge>
                  </div>
                  <Progress 
                    value={(familyMember?.total_points || 0) / reward.points_cost * 100} 
                    className="mb-2"
                  />
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    disabled={!familyMember || familyMember.total_points < reward.points_cost}
                    onClick={() => handleRedeemReward(reward.id, reward.points_cost)}
                  >
                    Redeem Reward
                  </Button>
                </div>
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
              {redemptionHistory?.map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{redemption.rewards.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(redemption.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={redemption.status === 'approved' ? 'default' : 'secondary'}>
                      {redemption.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      -{redemption.points_spent} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Rewards */}
        {suggestedRewards && suggestedRewards.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Suggested Rewards</CardTitle>
                  <CardDescription>Rewards you can redeem with your current points</CardDescription>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedRewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4">
                    <h4 className="font-medium">{reward.title}</h4>
                    <Badge className="mt-2">{reward.points_cost} points</Badge>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => handleRedeemReward(reward.id, reward.points_cost)}
                    >
                      Quick Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
