import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronsUpDown, PlusCircle, RefreshCw, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Chore } from '@/types/chores';

export default function ChildDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const { toast } = useToast();

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';

  const { data: rawChores, refetch } = useQuery({
    queryKey: ['chores', formattedDate, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('chores')
        .select('*, family_members(name)')
        .eq('status', selectedStatus)
        .order('due_date', { ascending: true });

      if (formattedDate) {
        query = query.eq('due_date', formattedDate);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error fetching chores',
          description: error.message,
        });
      }

      return data;
    },
  });

  const chores: Chore[] = (rawChores || []).map(chore => ({
    ...chore,
    priority: (chore.priority as 'low' | 'medium' | 'high') || 'medium',
    points: chore.points || 0,
    verification_required: chore.verification_required || false,
    auto_approve: chore.auto_approve || false,
    reminders_enabled: false,
    recurring: 'none',
    images: [],
    messages: [],
    reminders: []
  }));

  const choreStatuses = [
    'pending',
    'in_progress',
    'completed',
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Child Dashboard</h1>
        <div className="space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date('2023-01-01')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {choreStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {chores.map((chore) => (
          <Card key={chore.id}>
            <CardHeader>
              <CardTitle>{chore.title}</CardTitle>
              <CardDescription>{chore.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Due Date: {chore.due_date}</p>
              <p>Points: {chore.points}</p>
              <p>Status: {chore.status}</p>
              {chore.family_members && (
                <p>Assigned To: {chore.family_members.name}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button>View Details</Button>
              <Button>Mark as Complete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
