export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Permission = {
  manage_rewards: boolean;
  assign_chores: boolean;
  approve_chores: boolean;
  manage_points: boolean;
};

export type ChoreCategory = {
  id: string;
  name: string;
  description?: string;
  user_id: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  status?: 'active' | 'inactive' | 'needs_approval';
  age?: number;
  points_balance?: number;
  avatar_url?: string | null;
  email?: string;
  invitation_status?: string;
  permissions?: Permission;
  achievements?: Achievement[];
  streak_days?: number;
  max_weekly_chores?: number;
  preferred_categories?: string[];
  preferred_difficulty?: 'easy' | 'medium' | 'hard';
};

export type ChoreImage = {
  id: string;
  image_url: string;
  type: 'before' | 'after' | 'reference';
  created_at: string;
  chore_id: string;
};

export type ChoreMessage = {
  id: string;
  message: string;
  user_id: string;
  chore_id: string;
  created_at: string;
};

export type ChoreReminder = {
  id: string;
  chore_id: string;
  scheduled_for: string;
  sent_at?: string;
  type: 'upcoming' | 'overdue';
};

export type Reward = {
  id: string;
  title: string;
  description?: string;
  points_cost: number;
  user_id: string;
  created_at: string;
  type: 'screen_time' | 'privilege' | 'allowance' | 'custom';
};

export type RewardRedemption = {
  id: string;
  reward_id: string;
  child_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type SubscriptionTier = 'free' | 'pro';

export type Chore = {
  id: string;
  title: string;
  description: string | null;
  points: number;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  due_date: string | null;
  assigned_to: string | null;
  priority: 'low' | 'medium' | 'high';
  verification_required: boolean;
  verified_at: string | null;
  verified_by: string | null;
  auto_approve: boolean;
  reminders_enabled: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  family_members?: {
    name: string;
  } | null;
  images?: ChoreImage[];
  messages?: ChoreMessage[];
  reminders?: ChoreReminder[];
  difficulty_level: 'easy' | 'medium' | 'hard';
  team_members: string[];
  rotation_schedule?: any;
  completion_window?: any;
  streak_count: number;
  behavior_note?: string;
  behavior_points: number;
  swap_request_id?: string;
  parent_notes?: string[];
};

export type LeaderboardEntry = {
  member_id: string;
  member_name: string;
  total_points: number;
  completed_chores: number;
  streak_days: number;
};

export type ChoreChallenge = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_points: number;
  participants: string[];
  status: 'active' | 'completed';
};

export type ChoreStats = {
  total_points: number;
  completed_chores: number;
  pending_chores: number;
  streak_days: number;
  completion_rate: number;
};

export type NotificationPreference = {
  chore_reminders: boolean;
  chore_updates: boolean;
  reward_notifications: boolean;
  challenge_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
};

export type ChoreSwap = {
  id: string;
  requester_id: string;
  requested_id: string;
  chore_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at?: string;
};

export type AchievementCategory = 
  | 'daily'
  | 'weekly'
  | 'milestone'
  | 'special'
  | 'bonus'
  | 'custom';

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  badge_type: AchievementCategory;
  created_at: string;
  family_member_id: string;
  progress?: number;
  total_required?: number;
  is_secret?: boolean;
  parent_created?: boolean;
  points_reward?: number;
  icon?: string;
};
