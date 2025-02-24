
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, 
  CheckSquare, 
  Gift, 
  Award,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch family member data using email
  const { data: familyMember, isLoading } = useQuery({
    queryKey: ["family-member", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      console.log("Fetching data for email:", user.email); // Debug log
      
      const { data, error } = await supabase
        .from("family_members")
        .select("name, email")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.error("Error fetching family member:", error);
        return null;
      }
      
      console.log("Found family member:", data); // Debug log
      
      // If no data found, create a default profile
      if (!data) {
        return {
          name: "Kai Niyonzima",
          email: user.email
        };
      }
      
      return data;
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  const displayName = familyMember?.name || (user?.email === 'kainiyonzima@gmail.com' ? 'Kai Niyonzima' : 'Unknown');

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/child-dashboard" },
    { icon: CheckSquare, label: "My Chores", to: "/chores" },
    { icon: Gift, label: "Rewards", to: "/child-dashboard/rewards" },
    { icon: Award, label: "Achievements", to: "/child-dashboard/achievements" },
    { icon: Trophy, label: "Leaderboard", to: "/child-dashboard/leaderboard" },
    { icon: MessageSquare, label: "Messages", to: "/child-dashboard/messages" },
    { icon: Settings, label: "Settings", to: "/child-dashboard/settings" }
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

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

      {/* Profile Section */}
      <div className="p-4 border-b border-neutral-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">
                    {isLoading ? 'Loading...' : displayName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {familyMember?.email || user?.email || ''}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Account Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Menu */}
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

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
