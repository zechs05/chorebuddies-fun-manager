
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek, isSameMonth, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Activity,
  Calendar as CalendarIcon,
  Award
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Reports() {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [date, setDate] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: new Date()
  });

  const { data: familyMembers } = useQuery({
    queryKey: ["family-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: choreHistory } = useQuery({
    queryKey: ["chore-history", date.from, date.to, selectedMember],
    queryFn: async () => {
      let query = supabase
        .from("chores")
        .select(`
          *,
          family_members (
            name
          )
        `)
        .eq("user_id", user?.id)
        .order('created_at', { ascending: false });

      if (selectedMember !== "all") {
        query = query.eq("assigned_to", selectedMember);
      }

      if (date.from) {
        query = query.gte('created_at', date.from.toISOString());
      }
      
      if (date.to) {
        query = query.lte('created_at', date.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getTimeRangeData = () => {
    if (!choreHistory || !date.from) return [];
    
    const data = choreHistory.reduce((acc: any[], chore) => {
      const dateStr = format(new Date(chore.created_at), "MMM dd");
      const existing = acc.find(item => item.date === dateStr);
      
      if (existing) {
        existing.total += 1;
        if (chore.status === "completed") existing.completed += 1;
      } else {
        acc.push({
          date: dateStr,
          total: 1,
          completed: chore.status === "completed" ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    return data;
  };

  const getCompletionStats = () => {
    if (!choreHistory) return { total: 0, completed: 0, points: 0 };
    
    return choreHistory.reduce(
      (acc, chore) => ({
        total: acc.total + 1,
        completed: acc.completed + (chore.status === "completed" ? 1 : 0),
        points: acc.points + (chore.status === "completed" ? chore.points : 0)
      }),
      { total: 0, completed: 0, points: 0 }
    );
  };

  const stats = getCompletionStats();
  const timeRangeData = getTimeRangeData();

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Exporting PDF...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reports & Insights</h1>
            <p className="text-muted-foreground">
              Track chore completion and family engagement
            </p>
          </div>
          <Button onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completed} of {stats.total} chores completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.points}</div>
              <p className="text-xs text-muted-foreground">
                From completed chores
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Selected Period
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {date.from ? format(date.from, "MMM dd") : "Not set"} - {date.to ? format(date.to, "MMM dd") : "Not set"}
              </div>
              <p className="text-xs text-muted-foreground">
                Date range for analysis
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Completion Trends</CardTitle>
                <CardDescription>
                  Track chore completion patterns over time
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label>Time Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date.from}
                        selected={date}
                        onSelect={(range: DateRange | undefined) => setDate(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Family Member</Label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="border rounded p-2"
                  >
                    <option value="all">All Members</option>
                    {familyMembers?.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#22c55e" 
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#94a3b8" 
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
