
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Chore = {
  id: string;
  title: string;
  description: string | null;
  points: number | null;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  due_date: string | null;
};

export default function Chores() {
  const { user } = useAuth();
  const [newChore, setNewChore] = useState("");
  const queryClient = useQueryClient();

  const { data: chores, isLoading } = useQuery({
    queryKey: ["chores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch chores");
        throw error;
      }

      return data as Chore[];
    },
  });

  const addChoreMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("chores")
        .insert({
          title: title.trim(),
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
      setNewChore("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "in_progress" | "completed" }) => {
      const { error } = await supabase
        .from("chores")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chores")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast.success("Chore deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChore.trim() || !user) return;
    addChoreMutation.mutate(newChore);
  };

  const handleStatusChange = (id: string, status: "pending" | "in_progress" | "completed") => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteChore = (id: string) => {
    deleteChoreMutation.mutate(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Chores</h1>
        </div>

        {/* Add Chore Form */}
        <form onSubmit={handleAddChore} className="flex gap-2">
          <Input
            value={newChore}
            onChange={(e) => setNewChore(e.target.value)}
            placeholder="Add a new chore..."
            className="flex-1"
            disabled={addChoreMutation.isPending}
          />
          <Button 
            type="submit"
            disabled={addChoreMutation.isPending}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {addChoreMutation.isPending ? 'Adding...' : 'Add Chore'}
          </Button>
        </form>

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
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-neutral-200"
              >
                <div>
                  <h3 className="font-medium text-neutral-900">{chore.title}</h3>
                  {chore.description && (
                    <p className="text-sm text-neutral-600">{chore.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={chore.status}
                    onChange={(e) => 
                      handleStatusChange(
                        chore.id,
                        e.target.value as "pending" | "in_progress" | "completed"
                      )
                    }
                    className="text-sm border rounded px-2 py-1"
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteChore(chore.id)}
                    disabled={deleteChoreMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
