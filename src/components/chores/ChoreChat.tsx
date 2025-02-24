
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Chore, ChoreMessage } from "@/types/chores";

type ChoreChatProps = {
  chore: Chore | null;
  onClose: () => void;
};

export function ChoreChat({ chore, onClose }: ChoreChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: choreMessages } = useQuery({
    queryKey: ["choreMessages", chore?.id],
    enabled: !!chore,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chore_messages")
        .select("*")
        .eq("chore_id", chore?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChoreMessage[];
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ choreId, message }: { choreId: string; message: string }) => {
      const { error } = await supabase
        .from("chore_messages")
        .insert({
          chore_id: choreId,
          message,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["choreMessages"] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!chore?.id) return;

    const channel = supabase
      .channel('chore-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chore_messages',
          filter: `chore_id=eq.${chore.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["choreMessages", chore.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chore?.id, queryClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chore) return;
    addMessageMutation.mutate({ choreId: chore.id, message: newMessage.trim() });
  };

  return (
    <Dialog open={!!chore} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chore Chat</DialogTitle>
        </DialogHeader>
        <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
          {choreMessages?.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.user_id === user?.id
                  ? "bg-blue-100 ml-auto"
                  : "bg-gray-100"
              } max-w-[80%]`}
            >
              <p className="text-sm">{message.message}</p>
              <span className="text-xs text-gray-500">
                {format(new Date(message.created_at), "PP p")}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
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
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
