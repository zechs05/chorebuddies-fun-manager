
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Active Chores</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Family Members</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-600">Completed Today</h3>
            <p className="text-2xl font-semibold text-neutral-900 mt-2">0</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
          <div className="text-sm text-neutral-600">
            No recent activity to show.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
