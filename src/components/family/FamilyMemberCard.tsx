
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, MessageSquare, Trophy, Upload, Trash2, Edit } from "lucide-react";
import { FamilyMemberStatus } from "./FamilyMemberStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { FamilyMember } from "@/types/chores";

type FamilyMemberCardProps = {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
  onChat?: (member: FamilyMember) => void;
};

export function FamilyMemberCard({ member, onEdit, onDelete, onChat }: FamilyMemberCardProps) {
  const [uploading, setUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${member.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update member profile with new avatar URL
      const { error: updateError } = await supabase
        .from('family_members')
        .update({ avatar_url: publicUrl })
        .eq('id', member.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    onDelete(member.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar_url || ''} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <label 
                  htmlFor={`avatar-${member.id}`}
                  className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-3 w-3" />
                  <input
                    type="file"
                    id={`avatar-${member.id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>
                  <FamilyMemberStatus status={member.status || 'active'} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(member)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChat?.(member)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              {member.email}
            </p>
            <p className="text-sm text-neutral-500 capitalize">
              Status: {member.invitation_status || 'pending'}
            </p>
            {member.streak_days && member.streak_days > 0 && (
              <Badge variant="outline" className="mt-2">
                🔥 {member.streak_days} day streak
              </Badge>
            )}
            {member.achievements?.map((achievement) => (
              <Badge key={achievement.id} variant="secondary" className="ml-2">
                <Trophy className="w-3 h-3 mr-1" />
                {achievement.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {member.name} from your family? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
