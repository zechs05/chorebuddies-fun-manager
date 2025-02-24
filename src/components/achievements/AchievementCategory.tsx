
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, Milestone, Star } from "lucide-react";
import type { Achievement, AchievementCategory } from "@/types/chores";

const categoryIcons = {
  daily: Calendar,
  weekly: Award,
  milestone: Milestone,
  special: Star,
  bonus: Award,
  custom: Star,
};

const categoryTitles = {
  daily: "Daily Achievements",
  weekly: "Weekly Achievements",
  milestone: "Milestone Achievements",
  special: "Special Achievements",
  bonus: "Bonus Achievements",
  custom: "Custom Achievements",
};

interface AchievementCategoryProps {
  category: AchievementCategory;
  achievements: Achievement[];
}

export function AchievementCategorySection({ category, achievements }: AchievementCategoryProps) {
  const Icon = categoryIcons[category];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{categoryTitles[category]}</CardTitle>
            <CardDescription>
              {category === 'daily' && 'Complete daily challenges'}
              {category === 'weekly' && 'Complete weekly goals'}
              {category === 'milestone' && 'Reach important milestones'}
              {category === 'special' && 'Special accomplishments'}
              {category === 'bonus' && 'Bonus achievements'}
              {category === 'custom' && 'Custom achievements'}
            </CardDescription>
          </div>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium">{achievement.title}</p>
                <p className="text-sm text-neutral-500">{achievement.description}</p>
                {achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 bg-neutral-200 rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(achievement.progress / (achievement.total_required || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {achievement.progress} / {achievement.total_required}
                    </p>
                  </div>
                )}
              </div>
              {achievement.is_secret && (
                <Badge variant="secondary" className="ml-auto">Secret</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
