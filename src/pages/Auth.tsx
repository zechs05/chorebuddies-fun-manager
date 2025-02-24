
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoginRole = "parent" | "child" | null;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginRole, setLoginRole] = useState<LoginRole>(null);
  const [hasChildAccounts, setHasChildAccounts] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle role selection - Directly navigate to child dashboard for child role
  const handleRoleSelect = (role: LoginRole) => {
    if (role === "child") {
      navigate("/child-dashboard");
    } else {
      setLoginRole(role);
    }
  };

  // Handle email confirmation
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (token_hash && type === 'signup') {
        try {
          setIsLoading(true);
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup',
          });
          if (error) throw error;
          toast.success("Email confirmed successfully!");
          navigate('/dashboard');
        } catch (error: any) {
          console.error('Verification error:', error);
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleParentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

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
        
        if (data.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.success("Please check your email for the confirmation link!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show role selector first
  if (!loginRole) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <RoleSelector onRoleSelect={handleRoleSelect} hasChildAccounts={hasChildAccounts} />
      </div>
    );
  }

  // Parent login/signup form
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isLoading && searchParams.get('token_hash') 
              ? "Confirming your email..."
              : isSignUp 
              ? "Create your account" 
              : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {loginRole === "parent" && (
              <Button variant="ghost" size="sm" onClick={() => setLoginRole(null)}>
                ← Back to role selection
              </Button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleParentSubmit} className="space-y-4">
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
              />
            </div>
            <Button type="submit" className="w-full button-gradient" disabled={isLoading}>
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-neutral-600 hover:text-primary"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
