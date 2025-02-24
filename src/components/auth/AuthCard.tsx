
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildAuthForm } from "./ChildAuthForm";
import { ParentAuthForm } from "./ParentAuthForm";

interface AuthCardProps {
  loginRole: "parent" | "child" | null;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setLoginRole: (role: "parent" | "child" | null) => void;
  isEmailConfirmation: boolean;
}

export function AuthCard({
  loginRole,
  isSignUp,
  setIsSignUp,
  isLoading,
  setIsLoading,
  setLoginRole,
  isEmailConfirmation,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isEmailConfirmation
            ? "Confirming your email..."
            : loginRole === 'child'
            ? isSignUp ? "Create your account" : "Welcome back"
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
        {loginRole === 'child' ? (
          <ChildAuthForm
            isSignUp={isSignUp}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <ParentAuthForm
            isSignUp={isSignUp}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
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
  );
}
