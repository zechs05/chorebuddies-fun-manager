
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CompletionTrendsProps {
  timeRangeData: Array<{
    date: string;
    total: number;
    completed: number;
  }>;
  date: DateRange;
  setDate: (range: DateRange | undefined) => void;
  selectedMember: string;
  setSelectedMember: (member: string) => void;
  familyMembers: Array<{ id: string; name: string; }> | null;
}

export function CompletionTrends({
  timeRangeData,
  date,
  setDate,
  selectedMember,
  setSelectedMember,
  familyMembers
}: CompletionTrendsProps) {
  return (
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
  );
}
