
import { TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Clock, Star, HelpCircle } from "lucide-react";

export function MessageCategories() {
  return (
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
  );
}
