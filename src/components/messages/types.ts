
export type MessageCategory = 'all' | 'reminders' | 'encouragement' | 'requests';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  updated_at: string;
}
