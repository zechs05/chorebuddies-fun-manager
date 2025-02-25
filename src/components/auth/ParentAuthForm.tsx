
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ParentAuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ParentAuthForm({ isSignUp, isLoading, setIsLoading }: ParentAuthFormProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) throw error;

        if (!data.user || data.user.identities?.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        toast.success("Please check your email for the confirmation link!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Signed in successfully!");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="John Doe"
            disabled={isLoading}
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          disabled={isLoading}
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete={isSignUp ? "new-password" : "current-password"}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full button-gradient" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
          </div>
        ) : (
          <span>{isSignUp ? "Create account" : "Sign in"}</span>
        )}
      </Button>
    </form>
  );
}
