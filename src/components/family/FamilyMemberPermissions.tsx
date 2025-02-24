
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Permission } from "@/types/chores";

interface FamilyMemberPermissionsProps {
  permissions: Permission;
  onPermissionChange: (permissions: Permission) => void;
}

export function FamilyMemberPermissions({ permissions, onPermissionChange }: FamilyMemberPermissionsProps) {
  return (
    <div className="space-y-4">
      <Label>Permissions</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="manage_rewards">Manage Rewards</Label>
          <Switch
            id="manage_rewards"
            checked={permissions.manage_rewards}
            onCheckedChange={(checked) =>
              onPermissionChange({ ...permissions, manage_rewards: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="assign_chores">Assign Chores</Label>
          <Switch
            id="assign_chores"
            checked={permissions.assign_chores}
            onCheckedChange={(checked) =>
              onPermissionChange({ ...permissions, assign_chores: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="approve_chores">Approve Chores</Label>
          <Switch
            id="approve_chores"
            checked={permissions.approve_chores}
            onCheckedChange={(checked) =>
              onPermissionChange({ ...permissions, approve_chores: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="manage_points">Manage Points</Label>
          <Switch
            id="manage_points"
            checked={permissions.manage_points}
            onCheckedChange={(checked) =>
              onPermissionChange({ ...permissions, manage_points: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
