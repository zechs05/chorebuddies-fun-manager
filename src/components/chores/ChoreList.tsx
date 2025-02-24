
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, ImageIcon, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoreChat } from "./ChoreChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { Chore } from "@/types/chores";

type ChoreListProps = {
  chores: Chore[];
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>, choreId: string, type: 'before' | 'after' | 'reference') => void;
};

export function ChoreList({ chores, onUploadImage }: ChoreListProps) {
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const queryClient = useQueryClient();

  const updateChoreMutation = useMutation({
    mutationFn: async ({ choreId, status, verificationData }: { 
      choreId: string; 
      status: Chore["status"];
      verificationData?: {
        verified_at: string;
        verified_by: string;
      };
    }) => {
      const { error } = await supabase
        .from("chores")
        .update({ 
          status,
          ...(verificationData && {
            verified_at: verificationData.verified_at,
            verified_by: verificationData.verified_by
          })
        })
        .eq("id", choreId);

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
    mutationFn: async (choreId: string) => {
      const { error } = await supabase
        .from("chores")
        .delete()
        .eq("id", choreId);

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

  const handleStatusChange = (choreId: string, status: Chore["status"]) => {
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    const verificationData = status === 'completed' ? {
      verified_at: new Date().toISOString(),
      verified_by: supabase.auth.getUser()?.data.user?.id
    } : undefined;

    updateChoreMutation.mutate({ choreId, status, verificationData });
  };

  const handleDeleteChore = (choreId: string) => {
    if (window.confirm("Are you sure you want to delete this chore?")) {
      deleteChoreMutation.mutate(choreId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-4">
      {chores.map((chore) => (
        <div
          key={chore.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-neutral-900">{chore.title}</h3>
                <Badge className={getPriorityColor(chore.priority || 'medium')}>
                  {chore.priority || 'medium'}
                </Badge>
              </div>
              {chore.description && (
                <p className="text-sm text-neutral-600 mt-1">{chore.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-600">
                {chore.points} points
              </div>
              {chore.due_date && (
                <div className="text-sm text-neutral-600">
                  Due: {format(new Date(chore.due_date), "PP")}
                </div>
              )}
              <div className="flex gap-2">
                {chore.verification_required && chore.status === 'completed' && !chore.verified_at && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(chore.id, 'completed')}
                      className="text-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(chore.id, 'in_progress')}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteChore(chore.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={chore.status}
              onChange={(e) => handleStatusChange(chore.id, e.target.value as Chore["status"])}
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
                onChange={(e) => onUploadImage(e, chore.id, 'reference')}
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
        </div>
      ))}
      <ChoreChat chore={selectedChore} onClose={() => setSelectedChore(null)} />
    </div>
  );
}
