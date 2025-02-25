
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  role: 'parent' | 'child';
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userProfile: null, 
  isLoading: true 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // First check if user is a family member
      const { data: familyMember, error: familyError } = await supabase
        .from("family_members")
        .select("*")
        .eq("email", authUser.email)
        .single();

      if (familyError && familyError.code !== 'PGRST116') {
        console.error("Error fetching family member:", familyError);
      }

      if (familyMember) {
        setUserProfile({
          id: familyMember.id,
          role: familyMember.role as 'parent' | 'child',
          name: familyMember.name,
          email: familyMember.email || authUser.email || '',
        });
        setIsLoading(false);
        return;
      }

      // If not a family member, check general profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setUserProfile(null);
      } else if (profile) {
        setUserProfile({
          id: profile.id,
          role: 'parent', // Default to parent for general profiles
          name: profile.full_name || authUser.email?.split('@')[0] || '',
          email: profile.email || authUser.email || '',
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
