import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, CalendarIcon, Image as ImageIcon, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

type FamilyMember = {
  id: string;
  name: string;
  role: string;
};

type Chore = {
  id: string;
  title: string;
  description: string | null;
  points: number | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  due_date: string | null;
  assigned_to: string | null;
};

type ChoreMessage = {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
};

type ChoreImage = {
  id: string;
  image_url: string;
  type: 'before' | 'after' | 'reference';
  created_at: string;
};

export default function Chores() {
  const { user } = useAuth();
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    points: 0,
    assigned_to: "",
    due_date: null as Date | null,
  });
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: familyMembers } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_members")
        .select("*");

      if (error) throw error;
      return data as FamilyMember[];
    },
  });

  const { data: chores, isLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*, family_members(name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch chores");
        throw error;
      }

      return data as Chore[];
    },
  });

  const { data: choreMessages } = useQuery({
    queryKey: ["choreMessages", selectedChore?.id],
    enabled: !!selectedChore,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chore_messages")
        .select("*")
        .eq("chore_id", selectedChore?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChoreMessage[];
    },
  });

  const { data: choreImages } = useQuery({
    queryKey: ["choreImages", selectedChore?.id],
    enabled: !!selectedChore,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chore_images")
        .select("*")
        .eq("chore_id", selectedChore?.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChoreImage[];
    },
  });

  const addChoreMutation = useMutation({
    mutationFn: async (choreData: typeof newChore) => {
      const { data, error } = await supabase
        .from("chores")
        .insert({
          title: choreData.title.trim(),
          description: choreData.description.trim(),
          points: choreData.points,
          assigned_to: choreData.assigned_to,
          due_date: choreData.due_date?.toISOString(),
          user_id: user?.id,
          status: "pending",
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore added successfully!");
      setNewChore({
        title: "",
        description: "",
        points: 0,
        assigned_to: "",
        due_date: null,
      });
      setIsAddChoreOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ choreId, message }: { choreId: string; message: string }) => {
      const { error } = await supabase
        .from("chore_messages")
        .insert({
          chore_id: choreId,
          message,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["choreMessages"] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ 
      choreId, 
      file, 
      type 
    }: { 
      choreId: string; 
      file: File; 
      type: 'before' | 'after' | 'reference' 
    }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${choreId}/${type}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase
        .storage
        .from('chore-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('chore-images')
        .getPublicUrl(filePath);

      // Save reference in database
      const { error: dbError } = await supabase
        .from('chore_images')
        .insert({
          chore_id: choreId,
          image_url: publicUrl,
          type,
          user_id: user?.id,
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["choreImages"] });
      toast.success("Image uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChore.title.trim() || !user) return;
    addChoreMutation.mutate(newChore);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, choreId: string, type: 'before' | 'after' | 'reference') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    uploadImageMutation.mutate({ choreId, file, type });
  };

  const handleSendMessage = (choreId: string) => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate({ choreId, message: newMessage.trim() });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Chores</h1>
          <Dialog open={isAddChoreOpen} onOpenChange={setIsAddChoreOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Chore
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Chore</DialogTitle>
                <DialogDescription>
                  Create a new chore with details and assignments.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddChore} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newChore.title}
                    onChange={(e) => setNewChore(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter chore title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newChore.description}
                    onChange={(e) => setNewChore(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={newChore.points}
                    onChange={(e) => setNewChore(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned">Assign To</Label>
                  <select
                    id="assigned"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newChore.assigned_to}
                    onChange={(e) => setNewChore(prev => ({ ...prev, assigned_to: e.target.value }))}
                  >
                    <option value="">Select family member</option>
                    {familyMembers?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!newChore.due_date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newChore.due_date ? format(newChore.due_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newChore.due_date}
                        onSelect={(date: Date | null) => 
                          setNewChore(prev => ({ ...prev, due_date: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="w-full" disabled={addChoreMutation.isPending}>
                  {addChoreMutation.isPending ? "Adding..." : "Add Chore"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chores List */}
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading chores...</p>
          ) : chores?.length === 0 ? (
            <p className="text-neutral-600">No chores yet. Add your first chore above!</p>
          ) : (
            chores?.map((chore) => (
              <div
                key={chore.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-neutral-900">{chore.title}</h3>
                    {chore.description && (
                      <p className="text-sm text-neutral-600">{chore.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-neutral-600">
                      {chore.points} points
                    </div>
                    {chore.due_date && (
                      <div className="text-sm text-neutral-600">
                        Due: {format(new Date(chore.due_date), "PP")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={chore.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Chore["status"];
                      // Update status mutation would go here
                    }}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChore(chore)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id={`image-upload-${chore.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, chore.id, 'reference')}
                    />
                    <label
                      htmlFor={`image-upload-${chore.id}`}
                      className="cursor-pointer"
                    >
                      <Button variant="outline" size="sm">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Chat Dialog */}
                {selectedChore?.id === chore.id && (
                  <Dialog open={!!selectedChore} onOpenChange={() => setSelectedChore(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chore Chat</DialogTitle>
                      </DialogHeader>
                      <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
                        {choreMessages?.map((message) => (
                          <div
                            key={message.id}
                            className={`p-2 rounded-lg ${
                              message.user_id === user?.id
                                ? "bg-blue-100 ml-auto"
                                : "bg-gray-100"
                            } max-w-[80%]`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.created_at), "PP p")}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage(chore.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleSendMessage(chore.id)}
                          disabled={!newMessage.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
