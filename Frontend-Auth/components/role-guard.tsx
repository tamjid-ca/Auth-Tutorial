"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Verifying permissions...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="container mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full border-destructive/30 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl text-destructive">
              403 - Forbidden
            </CardTitle>
            <CardDescription className="text-sm">
              Insufficient Permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              You are currently logged in with role{" "}
              <span className="font-semibold text-foreground uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-muted">
                {user.role}
              </span>
              . This area requires one of the following roles:
            </p>
            <div className="flex justify-center gap-2">
              {allowedRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-md bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 capitalize"
                >
                  {role}
                </span>
              ))}
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-left text-muted-foreground mt-4 space-y-1">
              <p className="font-semibold text-foreground">💡 How to test as Admin:</p>
              <p>You can register a new user and select the <strong>Admin</strong> role during registration, or update the role directly in MongoDB.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
