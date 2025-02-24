
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Bell } from "lucide-react";
import { format } from "date-fns";

export function MessagesTab() {
  const { data: messages } = useQuery({
    queryKey: ["family-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parent Messages</CardTitle>
              <CardDescription>Recent messages from your parents</CardDescription>
            </div>
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages?.map((message) => (
              <div key={message.id} className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {format(new Date(message.created_at), "PPp")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Updates about your chores</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-sm">Your "Make Bed" chore was approved!</p>
              <p className="text-xs text-neutral-500 mt-1">Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
