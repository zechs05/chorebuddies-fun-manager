
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleSelectorProps {
  onRoleSelect: (role: "parent" | "child") => void;
  hasChildAccounts: boolean;
}

export function RoleSelector({ onRoleSelect, hasChildAccounts }: RoleSelectorProps) {
  if (!hasChildAccounts) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Who are you?</CardTitle>
        <CardDescription>Choose how you want to log in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onRoleSelect("parent")} 
          className="w-full"
          variant="default"
        >
          I'm a Parent
        </Button>
        <Button 
          onClick={() => onRoleSelect("child")} 
          className="w-full"
          variant="secondary"
        >
          I'm a Child
        </Button>
      </CardContent>
    </Card>
  );
}
