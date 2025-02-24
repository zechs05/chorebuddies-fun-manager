
import { Button } from "@/components/ui/button";
import { Gift, MonitorPlay, PartyPopper, Crown } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const rewardCategories = [
  { id: 'screen_time', title: 'Screen Time', icon: <MonitorPlay className="h-5 w-5" /> },
  { id: 'activity', title: 'Activities', icon: <PartyPopper className="h-5 w-5" /> },
  { id: 'privilege', title: 'Privileges', icon: <Crown className="h-5 w-5" /> },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      <Button
        variant={selectedCategory === 'all' ? "default" : "outline"}
        onClick={() => onCategoryChange('all')}
      >
        <Gift className="h-4 w-4 mr-2" />
        All Rewards
      </Button>
      {rewardCategories.map(category => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.icon}
          <span className="ml-2">{category.title}</span>
        </Button>
      ))}
    </div>
  );
}
