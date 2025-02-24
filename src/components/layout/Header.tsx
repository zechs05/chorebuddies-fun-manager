
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/components/AuthProvider";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-neutral-600">
            Welcome, {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
};
