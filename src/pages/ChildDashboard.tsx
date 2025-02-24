import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Chore } from "@/types/chores";

export default function ChildDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Fetch chores data
  const { data: rawChores, isLoading: isChoresLoading } = useQuery({
    queryKey: ["chores", selectedDate],
    queryFn: async () => {
      if (!selectedDate) return null;

      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("assigned_to", user?.id)
        .eq("due_date", formattedDate);

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!selectedDate,
  });

  const chores: Chore[] = (rawChores || []).map(chore => ({
    ...chore,
    priority: (chore.priority as 'low' | 'medium' | 'high') || 'medium',
    points: chore.points || 0,
    verification_required: chore.verification_required || false,
    auto_approve: chore.auto_approve || false,
    reminders_enabled: chore.reminders_enabled || false,
    recurring: (chore.recurring as 'none' | 'daily' | 'weekly' | 'monthly') || 'none',
    status: chore.status || 'pending',
    images: [],
    messages: [],
    reminders: []
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Child Dashboard
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose a date</CardTitle>
            <CardDescription>
              Select a date to view your chores for that day.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chores for {format(selectedDate || new Date(), "PPP")}</CardTitle>
            <CardDescription>Here are your chores for the selected date.</CardDescription>
          </CardHeader>
          <CardContent>
            {isChoresLoading ? (
              <p>Loading chores...</p>
            ) : chores?.length > 0 ? (
              <ul>
                {chores.map((chore) => (
                  <li key={chore.id} className="py-2">
                    {chore.title} - {chore.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No chores assigned for this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
