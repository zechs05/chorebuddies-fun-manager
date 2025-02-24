
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ChildAuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ChildAuthForm({ isSignUp, isLoading, setIsLoading }: ChildAuthFormProps) {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isSignUp) {
        // Check if email is pre-approved first
        const { data: isApproved } = await supabase.rpc('is_child_email_preapproved', {
          p_email: email
        });

        if (!isApproved) {
          throw new Error("This email is not approved for child registration. Please ask your parent to add you to the family first.");
        }

        // Sign up without email confirmation
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'child'
            },
            emailRedirectTo: `${window.location.origin}/child-dashboard`
          }
        });

        if (signUpError) throw signUpError;
        
        toast.success("Registration successful! Signing you in...");
        
        // Attempt immediate sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        navigate("/child-dashboard");
      } else {
        // Regular sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Signed in successfully!");
        navigate("/child-dashboard");
      }
    } catch (error: any) {
      console.error('Child authentication error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          required
          type="password"
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full button-gradient" disabled={isLoading}>
        {isLoading
          ? "Loading..."
          : isSignUp
          ? "Create account"
          : "Sign in as Child"}
      </Button>
    </form>
  );
}
