
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DateTimeFieldProps {
  date: Date | null;
  time: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimeField({ date, time, onDateChange, onTimeChange }: DateTimeFieldProps) {
  const [tempDate, setTempDate] = useState<Date | null>(date);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    if (tempDate) {
      const newDate = new Date(tempDate);
      newDate.setHours(12, 0, 0, 0);
      onDateChange(newDate);
    } else {
      onDateChange(null);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Due Date & Time</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                selected={tempDate}
                onSelect={setTempDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
              />
              <div className="flex justify-end gap-2 p-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTempDate(date);
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              </div>
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
