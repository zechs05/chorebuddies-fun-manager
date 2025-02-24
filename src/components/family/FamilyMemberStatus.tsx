
import { Badge } from "@/components/ui/badge";
import { Activity, Pause, Clock } from "lucide-react";

type StatusProps = {
  status: string;
};

export function FamilyMemberStatus({ status }: StatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: Activity,
          label: 'Active',
          variant: 'success' as const,
          className: 'bg-green-100 text-green-800'
        };
      case 'inactive':
        return {
          icon: Pause,
          label: 'Inactive',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800'
        };
      case 'needs_approval':
        return {
          icon: Clock,
          label: 'Needs Approval',
          variant: 'warning' as const,
          className: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          icon: Activity,
          label: status,
          variant: 'default' as const,
          className: ''
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
