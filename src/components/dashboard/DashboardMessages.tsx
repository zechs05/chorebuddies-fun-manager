
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function DashboardMessages() {
  return (
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
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="text-sm">Great job on cleaning your room!</p>
            <p className="text-xs text-neutral-500 mt-1">Mom - 2 hours ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
