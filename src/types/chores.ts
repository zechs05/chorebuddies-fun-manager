
export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  points_balance?: number;
  avatar_url?: string | null;
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
