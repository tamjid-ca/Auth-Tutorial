"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { HexagonBackground } from "@/components/animate-ui/components/backgrounds/hexagon";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Progress } from "@/components/animate-ui/components/radix/progress";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  UserCheck,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters long")
      .max(50, "Full name cannot exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    role: z.enum(["user", "admin"], {
      message: "Please select an account role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const currentPassword = form.watch("password") || "";

  // Dynamic Password Strength Meter calculations
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (currentPassword.length >= 6) score += 25;
    if (currentPassword.length >= 10) score += 15;
    if (/[A-Z]/.test(currentPassword)) score += 20;
    if (/[0-9]/.test(currentPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(currentPassword)) score += 20;

    const clamped = Math.min(100, score);
    let label = "Too weak";
    let color = "text-rose-500";

    if (clamped >= 80) {
      label = "Very strong";
      color = "text-emerald-500";
    } else if (clamped >= 60) {
      label = "Strong";
      color = "text-emerald-400";
    } else if (clamped >= 40) {
      label = "Moderate";
      color = "text-amber-500";
    } else if (clamped > 0) {
      label = "Weak";
      color = "text-rose-400";
    } else {
      label = "Empty";
      color = "text-muted-foreground";
    }

    return { score: clamped, label, color };
  }, [currentPassword]);

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await register(
        values.name.trim(),
        values.email.trim(),
        values.password,
        values.role
      );

      setSuccessMsg("Account created successfully! Preparing your session...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setErrorMsg(msg);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0 size-full opacity-60 dark:opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]">
          <HexagonBackground hexagonSize={70} hexagonMargin={3} />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <Card className="shadow-xl border-border/80 bg-card/90 backdrop-blur-md">
            <CardHeader className="space-y-2 text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1 ring-1 ring-primary/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
              <CardDescription>
                Join AuthHub and initialize your role-based authenticated profile
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {errorMsg && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Registration Error</AlertTitle>
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  )}

                  {successMsg && (
                    <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <AlertTitle>Registration Successful</AlertTitle>
                      <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                  )}

                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Alex Developer"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="alex@example.com"
                            type="email"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field with Radix Progress Strength Meter */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          {currentPassword && (
                            <span className={`text-[11px] font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label} ({passwordStrength.score}%)
                            </span>
                          )}
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        {/* Animated Radix Progress Bar */}
                        <div className="pt-1">
                          <Progress
                            value={passwordStrength.score}
                            className="h-1.5 transition-all"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role Selector with Tooltips */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Initial Role Assignment</FormLabel>
                          <span className="text-[11px] text-muted-foreground">RBAC Claim</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label
                                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                                  field.value === "user"
                                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                                    : "border-border/80 bg-card hover:bg-muted/50 text-muted-foreground"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="role"
                                  value="user"
                                  checked={field.value === "user"}
                                  onChange={() => field.onChange("user")}
                                  className="sr-only"
                                />
                                <UserCheck className="h-4 w-4 text-primary" />
                                <div className="text-left">
                                  <div className="text-xs font-semibold text-foreground">User</div>
                                  <div className="text-[10px] text-muted-foreground">Standard access</div>
                                </div>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Standard user privileges for general application use</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <label
                                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                                  field.value === "admin"
                                    ? "border-purple-500 bg-purple-500/5 text-foreground ring-1 ring-purple-500"
                                    : "border-border/80 bg-card hover:bg-muted/50 text-muted-foreground"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="role"
                                  value="admin"
                                  checked={field.value === "admin"}
                                  onChange={() => field.onChange("admin")}
                                  className="sr-only"
                                />
                                <Shield className="h-4 w-4 text-purple-600" />
                                <div className="text-left">
                                  <div className="text-xs font-semibold text-foreground">Admin</div>
                                  <div className="text-[10px] text-muted-foreground">Full management</div>
                                </div>
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Administrator privileges: Access to /admin control panel</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Liquid Submit Button */}
                  <div className="pt-2">
                    <LiquidButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 h-10"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Register Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </LiquidButton>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 pt-2 border-t border-border/40 text-center text-xs text-muted-foreground">
                  <p>
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                      Sign In
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
