
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimeFieldProps {
  date: Date | null;
  time: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimeField({ date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
  return (
    <div className="space-y-2">
      <Label>Due Date & Time</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  console.log("Selected date:", date);
                  if (date) {
                    // Ensure we're working with a new Date object
                    const newDate = new Date(date);
                    // Set the time to noon to avoid timezone issues
                    newDate.setHours(12, 0, 0, 0);
                    onDateChange(newDate);
                  } else {
                    onDateChange(null);
                  }
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
}
