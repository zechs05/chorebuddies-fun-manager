
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ChildDashboard from "@/pages/ChildDashboard";
import Family from "@/pages/Family";
import Chores from "@/pages/Chores";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import Success from "@/pages/Success";

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
