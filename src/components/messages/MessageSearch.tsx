
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MessageSearch({ searchQuery, onSearchChange }: MessageSearchProps) {
  return (
    <div className="mt-4 flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Button variant="outline">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
    </div>
  );
}
