
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import type { FamilyMember } from "@/types/chores";

type FamilyChatProps = {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
};

type ChatMessage = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export function FamilyChat({ isOpen, onClose, member }: FamilyChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('family_chat_messages')
        .select('*')
        .or(`sender_id.eq.${member.id},receiver_id.eq.${member.id}`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('family-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'family_chat_messages',
          filter: `receiver_id=eq.${member.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, member.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('family_chat_messages')
      .insert({
        content: newMessage.trim(),
        sender_id: user?.id,
        receiver_id: member.id,
      });

    if (!error) {
      setNewMessage("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatar_url || ''} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            Chat with {member.name}
          </DialogTitle>
        </DialogHeader>

        <div className="h-[400px] overflow-y-auto space-y-4 p-4">
          {loading ? (
            <p className="text-center">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70">
                    {format(new Date(message.created_at), "PP p")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 p-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
