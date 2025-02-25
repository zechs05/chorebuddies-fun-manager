
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
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Bell,
  Send,
  Smile,
  Clock,
  Search,
  Filter,
  CheckCheck,
  Star,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

type MessageCategory = 'all' | 'reminders' | 'encouragement' | 'requests';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  updated_at: string;
}

export function MessagesTab() {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Query family members for the chat
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

  // Query messages with real-time updates
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

  // Set up real-time subscription
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
        receiver_id: user.id, // For now, sending to self. This should be updated based on selected recipient
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
      {/* Message Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="all">
            <span className="flex items-center">All</span>
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Reminders
            </span>
          </TabsTrigger>
          <TabsTrigger value="encouragement">
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Encouragement
            </span>
          </TabsTrigger>
          <TabsTrigger value="requests">
            <span className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Requests
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

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
              <div className="space-y-4">
                {filteredMessages?.map((message) => (
                  <div key={message.id} className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt="Avatar" />
                      <AvatarFallback>FM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Family Member</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">
                            {format(new Date(message.created_at), "PPp")}
                          </span>
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <p className="text-sm mt-1">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm">
                          👍
                        </Button>
                        <Button variant="ghost" size="sm">
                          ❤️
                        </Button>
                        <Button variant="ghost" size="sm">
                          😊
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Updates about chores and messages</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <p className="text-sm">New chore assigned: "Clean your room"</p>
              </div>
              <p className="text-xs text-neutral-500 mt-1">Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
