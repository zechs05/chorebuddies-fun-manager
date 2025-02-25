
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Smile } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  return (
    <div className="flex gap-2 mt-6">
      <Textarea
        placeholder="Type your message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
        onKeyPress={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="icon">
          <Smile className="h-4 w-4" />
        </Button>
        <Button onClick={onSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
