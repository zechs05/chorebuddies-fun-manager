
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, AlertCircle } from "lucide-react";

export function NotificationsCard() {
  return (
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
  );
}
