
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages?.map((message) => (
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
  );
}
