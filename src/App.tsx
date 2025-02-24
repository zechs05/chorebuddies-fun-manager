import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ChildDashboard from "@/pages/ChildDashboard";
import Family from "@/pages/Family";
import Chores from "@/pages/Chores";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import Success from "@/pages/Success";
import Profile from "@/pages/Profile";
import { RewardsTab } from "@/components/rewards/RewardsTab";
import { AchievementsTab } from "@/components/achievements/AchievementsTab";
import { LeaderboardTab } from "@/components/leaderboard/LeaderboardTab";
import { MessagesTab } from "@/components/messages/MessagesTab";
import { SettingsTab } from "@/components/settings/SettingsTab";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/child-dashboard",
    element: <ChildDashboard />,
  },
  {
    path: "/child-dashboard/rewards",
    element: <DashboardLayout><RewardsTab /></DashboardLayout>,
  },
  {
    path: "/child-dashboard/achievements",
    element: <DashboardLayout><AchievementsTab /></DashboardLayout>,
  },
  {
    path: "/child-dashboard/leaderboard",
    element: <DashboardLayout><LeaderboardTab /></DashboardLayout>,
  },
  {
    path: "/child-dashboard/messages",
    element: <DashboardLayout><MessagesTab /></DashboardLayout>,
  },
  {
    path: "/child-dashboard/settings",
    element: <DashboardLayout><SettingsTab /></DashboardLayout>,
  },
  {
    path: "/family",
    element: <Family />,
  },
  {
    path: "/chores",
    element: <Chores />,
  },
  {
    path: "/reports",
    element: <Reports />,
  },
  {
    path: "/success",
    element: <Success />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
