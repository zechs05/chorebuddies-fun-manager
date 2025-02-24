
import { NavLink } from "react-router-dom";
import { Home, Users, CheckSquare, Gift, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const navItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: CheckSquare, label: "Chores", to: "/chores" },
    { icon: Users, label: "Family", to: "/family" },
    { icon: Gift, label: "Rewards", to: "/rewards" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h1 className="text-xl font-semibold text-primary">ParentPal</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                "hover:bg-neutral-100",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-600 hover:text-neutral-900"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
