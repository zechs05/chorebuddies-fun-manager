
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { user } = useAuth();

  const { data: familyMember, isLoading } = useQuery({
    queryKey: ["family-member", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.error("Error fetching family member:", error);
        return null;
      }

      return data;
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {familyMember?.name?.[0] || user?.email?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold">
                        {familyMember?.name || user?.email}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {familyMember?.email || user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Role: {familyMember?.role || 'Child'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
