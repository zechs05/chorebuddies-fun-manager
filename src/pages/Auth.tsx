
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { AuthCard } from "@/components/auth/AuthCard";

type LoginRole = "parent" | "child" | null;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginRole, setLoginRole] = useState<LoginRole>(null);
  const [hasChildAccounts, setHasChildAccounts] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRoleSelect = (role: LoginRole) => {
    setLoginRole(role);
  };

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

  if (!loginRole) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <RoleSelector onRoleSelect={handleRoleSelect} hasChildAccounts={hasChildAccounts} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <AuthCard
        loginRole={loginRole}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setLoginRole={setLoginRole}
        isEmailConfirmation={Boolean(isLoading && searchParams.get('token_hash'))}
      />
    </div>
  );
}
