
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FamilyMember, Permission } from "@/types/chores";

type Difficulty = 'easy' | 'medium' | 'hard';

type AddFamilyMemberDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    email: string;
    role: string;
    permissions: Permission;
    age?: number;
    preferredDifficulty?: string;
    maxWeeklyChores?: number;
    fullName?: string;
    avatarUrl?: string;
  }) => void;
  editingMember: FamilyMember | null;
  defaultPermissions: Permission;
};

export function AddFamilyMemberDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingMember,
  defaultPermissions,
}: AddFamilyMemberDialogProps) {
  const [email, setEmail] = useState(editingMember?.email || "");
  const [fullName, setFullName] = useState(editingMember?.name || "");
  const [selectedRole, setSelectedRole] = useState(editingMember?.role || "child");
  const [permissions, setPermissions] = useState<Permission>(editingMember?.permissions || defaultPermissions);
  const [age, setAge] = useState<number | undefined>(editingMember?.age);
  const [preferredDifficulty, setPreferredDifficulty] = useState<Difficulty>(
    (editingMember?.preferred_difficulty as Difficulty) || "medium"
  );
  const [maxWeeklyChores, setMaxWeeklyChores] = useState(editingMember?.max_weekly_chores || 10);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(editingMember?.avatar_url);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email,
      fullName,
      role: selectedRole,
      permissions,
      age,
      preferredDifficulty,
      maxWeeklyChores,
      avatarUrl,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingMember ? "Edit Family Member" : "Add Family Member"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{fullName ? fullName[0] : "?"}</AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          {!editingMember && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={3}
                max={19}
                value={age || ''}
                onChange={(e) => setAge(Number(e.target.value))}
                placeholder="Enter age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWeeklyChores">Max Weekly Chores</Label>
              <Input
                id="maxWeeklyChores"
                type="number"
                min={1}
                max={20}
                value={maxWeeklyChores}
                onChange={(e) => setMaxWeeklyChores(Number(e.target.value))}
                placeholder="Max Chores"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Difficulty</Label>
            <Select
              value={preferredDifficulty}
              onValueChange={(value: Difficulty) => setPreferredDifficulty(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedRole === 'parent' || editingMember?.role === 'parent') && (
            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manage_rewards">Manage Rewards</Label>
                  <Switch
                    id="manage_rewards"
                    checked={permissions.manage_rewards}
                    onCheckedChange={(checked) =>
                      setPermissions(prev => ({ ...prev, manage_rewards: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="assign_chores">Assign Chores</Label>
                  <Switch
                    id="assign_chores"
                    checked={permissions.assign_chores}
                    onCheckedChange={(checked) =>
                      setPermissions(prev => ({ ...prev, assign_chores: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="approve_chores">Approve Chores</Label>
                  <Switch
                    id="approve_chores"
                    checked={permissions.approve_chores}
                    onCheckedChange={(checked) =>
                      setPermissions(prev => ({ ...prev, approve_chores: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="manage_points">Manage Points</Label>
                  <Switch
                    id="manage_points"
                    checked={permissions.manage_points}
                    onCheckedChange={(checked) =>
                      setPermissions(prev => ({ ...prev, manage_points: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={uploading}>
            {editingMember ? "Update" : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
