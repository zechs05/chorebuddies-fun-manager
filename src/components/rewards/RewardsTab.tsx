
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PointsBalanceCard } from './PointsBalanceCard';
import { CategoryFilter } from './CategoryFilter';
import { AvailableRewards } from './AvailableRewards';
import { RedemptionHistory } from './RedemptionHistory';
import { SuggestedRewards } from './SuggestedRewards';

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

  const { data: familyMember } = useQuery({
    queryKey: ["family-member", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return null;
      
      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("id")
        .eq("user_id", userData.id)
        .single();

      if (memberError) throw memberError;

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

  const { data: redemptionHistory } = useQuery({
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
      <PointsBalanceCard points={familyMember?.total_points || 0} />
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AvailableRewards
          rewards={filteredRewards || []}
          currentPoints={familyMember?.total_points || 0}
          onRedeem={handleRedeemReward}
        />

        <RedemptionHistory
          redemptions={redemptionHistory || []}
        />

        <SuggestedRewards
          rewards={suggestedRewards || []}
          onRedeem={handleRedeemReward}
        />
      </div>
    </div>
  );
}
