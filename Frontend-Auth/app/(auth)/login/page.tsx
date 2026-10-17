"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HexagonBackground } from "@/components/animate-ui/components/backgrounds/hexagon";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import { LogIn, AlertCircle, Loader2, Sparkles, Shield, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg(null);
    try {
      await login(values.email.trim(), values.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      setErrorMsg(msg);
    }
  };

  const fillDemo = (email: string, pass: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", pass, { shouldValidate: true });
    setErrorMsg(null);
  };

  return (
    <TooltipProvider>
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0 size-full opacity-60 dark:opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]">
          <HexagonBackground hexagonSize={70} hexagonMargin={3} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-xl border-border/80 bg-card/90 backdrop-blur-md">
            <CardHeader className="space-y-2 text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1 ring-1 ring-primary/20">
                <LogIn className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription>
                Authenticate using your credentials to issue your dual-token JWT session
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {errorMsg && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Failed</AlertTitle>
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Field with shadcn Form */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
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

                  {/* Password Field with shadcn Form */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <span className="text-xs text-muted-foreground">JWT Protected</span>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
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
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </LiquidButton>
                  </div>

                  {/* Demo Credentials Section */}
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-3.5 space-y-2 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>Quick Demo Credentials</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Populate form with predefined accounts tested against Express + MongoDB:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5 font-normal"
                            onClick={() => fillDemo("admin@example.com", "Admin@123456")}
                          >
                            <Shield className="h-3 w-3 mr-1 text-purple-600" />
                            Admin Demo
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fill: admin@example.com / Admin@123456</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5 font-normal"
                            onClick={() => fillDemo("user@example.com", "User@123456")}
                          >
                            User Demo
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fill: user@example.com / User@123456</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 pt-2 border-t border-border/40 text-center text-xs text-muted-foreground">
                  <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                      Create an account
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
