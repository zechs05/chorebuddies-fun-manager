
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Settings, MessageSquare, Trophy } from "lucide-react";
import { FamilyMemberStatus } from "./FamilyMemberStatus";
import type { FamilyMember } from "@/types/chores";

type FamilyMemberCardProps = {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
};

export function FamilyMemberCard({ member, onEdit, onDelete }: FamilyMemberCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.avatar_url || ''} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
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
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to remove this family member?")) {
                  onDelete(member.id);
                }
              }}
            >
              <MessageSquare className="h-4 w-4" />
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
  );
}
