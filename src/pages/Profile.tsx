
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          {/* Profile content will go here */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
