
export type FamilyMember = {
  id: string;
  name: string;
  role: string;
};

export type Chore = {
  id: string;
  title: string;
  description: string | null;
  points: number | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  due_date: string | null;
  assigned_to: string | null;
};

export type ChoreMessage = {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
};

export type ChoreImage = {
  id: string;
  image_url: string;
  type: 'before' | 'after' | 'reference';
  created_at: string;
};
