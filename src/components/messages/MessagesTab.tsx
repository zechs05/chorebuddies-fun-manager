
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent, Tabs } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { MessageCategories } from "./MessageCategories";
import { MessageSearch } from "./MessageSearch";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { NotificationsCard } from "./NotificationsCard";
import { Message, MessageCategory } from "./types";

export function MessagesTab() {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: familyMembers } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["family-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_chat_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'family_chat_messages' },
        (payload) => {
          console.log('New message:', payload);
          toast.success('New message received!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase.from('family_chat_messages').insert({
        content: newMessage,
        sender_id: user.id,
        receiver_id: user.id,
      });

      if (error) throw error;
      
      setNewMessage("");
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredMessages = messages?.filter(message => {
    if (searchQuery && !message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <MessageCategories />
        <MessageSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Recent conversations with family</CardDescription>
                </div>
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <MessageList messages={filteredMessages || []} />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <NotificationsCard />
    </div>
  );
}
