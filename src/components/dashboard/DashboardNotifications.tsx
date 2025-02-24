
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";

export function DashboardNotifications() {
  return (
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
  );
}
