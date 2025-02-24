import { Database as DatabaseGenerated } from "@/integrations/supabase/types";

export interface Database extends DatabaseGenerated {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string | null
          family_member_id: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string | null
          description?: string | null
          family_member_id: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          family_member_id?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      child_accounts: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      chore_images: {
        Row: {
          chore_id: string | null
          created_at: string | null
          id: string
          image_url: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_images_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_messages: {
        Row: {
          chore_id: string | null
          created_at: string | null
          id: string
          message: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_messages_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_swaps: {
        Row: {
          chore_id: string | null
          created_at: string | null
          id: string
          requested_id: string | null
          requester_id: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          requested_id?: string | null
          requester_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          requested_id?: string | null
          requester_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chore_swaps_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_swaps_requested_id_fkey"
            columns: ["requested_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_swaps_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          assigned_to: string | null
          auto_approve: boolean | null
          behavior_note: string | null
          behavior_points: number | null
          completion_window: Json | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          due_date: string | null
          id: string
          parent_notes: string[] | null
          points: number | null
          priority: string | null
          recurring: string | null
          reminders_enabled: boolean | null
          rotation_schedule: Json | null
          status: Database["public"]["Enums"]["chore_status"] | null
          streak_count: number | null
          swap_request_id: string | null
          team_members: string[] | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
          verification_required: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_approve?: boolean | null
          behavior_note?: string | null
          behavior_points?: number | null
          completion_window?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          due_date?: string | null
          id?: string
          parent_notes?: string[] | null
          points?: number | null
          priority?: string | null
          recurring?: string | null
          reminders_enabled?: boolean | null
          rotation_schedule?: Json | null
          status?: Database["public"]["Enums"]["chore_status"] | null
          streak_count?: number | null
          swap_request_id?: string | null
          team_members?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
          verification_required?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_approve?: boolean | null
          behavior_note?: string | null
          behavior_points?: number | null
          completion_window?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          due_date?: string | null
          id?: string
          parent_notes?: string[] | null
          points?: number | null
          priority?: string | null
          recurring?: string | null
          reminders_enabled?: boolean | null
          rotation_schedule?: Json | null
          status?: Database["public"]["Enums"]["chore_status"] | null
          streak_count?: number | null
          swap_request_id?: string | null
          team_members?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
          verification_required?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chores_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_chat_messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string;
          receiver_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      }
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          invitation_status: string | null
          invited_at: string | null
          name: string
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_status?: string | null
          invited_at?: string | null
          name: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_status?: string | null
          invited_at?: string | null
          name?: string
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          chore_id: string | null
          created_at: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          chore_id?: string | null
          created_at?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          points_spent: number
          reward_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          points_spent: number
          reward_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points_cost: number
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_cost: number
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_cost?: number
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_child_credentials: {
        Args: {
          p_username: string
          p_password: string
        }
        Returns: {
          id: string
          parent_id: string
          username: string
        }[]
      }
      check_family_member_email: {
        Args: {
          p_email: string
          p_user_id: string
        }
        Returns: boolean
      }
      get_chore_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      chore_status: "pending" | "in_progress" | "completed"
      subscription_tier: "free" | "pro" | "ultimate"
      user_role: "parent" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
