
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ChildDashboard from "@/pages/ChildDashboard";
import Family from "@/pages/Family";
import Chores from "@/pages/Chores";
import NotFound from "@/pages/NotFound";
import Success from "@/pages/Success";

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
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
