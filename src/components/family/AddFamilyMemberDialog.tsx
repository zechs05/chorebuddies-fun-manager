
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
import { FamilyMemberAvatar } from "./FamilyMemberAvatar";
import { FamilyMemberPermissions } from "./FamilyMemberPermissions";
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
          <FamilyMemberAvatar
            avatarUrl={avatarUrl}
            fullName={fullName}
            onAvatarChange={setAvatarUrl}
          />

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
            <FamilyMemberPermissions
              permissions={permissions}
              onPermissionChange={setPermissions}
            />
          )}

          <Button type="submit" className="w-full">
            {editingMember ? "Update" : "Send Invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
