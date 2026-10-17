"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HexagonBackground } from "@/components/animate-ui/components/backgrounds/hexagon";
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Progress } from "@/components/animate-ui/components/radix/progress";
import {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
} from "@/components/animate-ui/components/radix/preview-link-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/animate-ui/components/radix/accordion";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import {
  Shield,
  KeyRound,
  RefreshCw,
  UserCheck,
  ArrowRight,
  Database,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Code2,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthScore, setHealthScore] = useState(30);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setHealthScore(60);
        const res = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.status === 401 || res.status === 200 || res.status === 400) {
          setBackendStatus("online");
          setHealthScore(100);
        } else {
          setBackendStatus("offline");
          setHealthScore(15);
        }
      } catch {
        setBackendStatus("offline");
        setHealthScore(10);
      }
    };

    checkBackend();
  }, [apiUrl]);

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden">
        {/* Hero Background Hexagons */}
        <div className="absolute inset-0 top-0 h-[640px] w-full overflow-hidden opacity-60 dark:opacity-40 [mask-image:radial-gradient(ellipse_at_top,white,transparent_75%)]">
          <HexagonBackground hexagonSize={65} hexagonMargin={3} />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-12 space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-6 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground shadow-xs">
              <span className="font-semibold text-foreground">Backend API:</span>
              {backendStatus === "checking" && (
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Verifying connectivity...
                </span>
              )}
              {backendStatus === "online" && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online ({apiUrl})
                </span>
              )}
              {backendStatus === "offline" && (
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <XCircle className="h-3.5 w-3.5" /> Offline (Backend on port 5000)
                </span>
              )}
            </div>

            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>System Readiness</span>
                <span>{healthScore}%</span>
              </div>
              <Progress value={healthScore} className="h-1.5" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Enterprise Authentication &amp; <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">RBAC Architecture</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Engineered with Next.js App Router, Tailwind CSS, Animate UI motion components, shadcn/ui Form, and Express + MongoDB dual-token JWT lifecycle.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {!isLoading && user ? (
                <>
                  <Link href="/dashboard">
                    <LiquidButton size="lg" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </LiquidButton>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex items-center gap-2 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/register">
                    <LiquidButton size="lg" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </LiquidButton>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="shadow-xs font-medium">
                      Sign In to Account
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button size="lg" variant="ghost" className="shadow-xs font-medium flex items-center gap-2 border border-border/80">
                      <Code2 className="h-4 w-4 text-indigo-500" />
                      Interactive API Docs
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof / Live User Presence Avatar Cluster */}
            <div className="pt-6 flex flex-col items-center justify-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Active Authenticated Engineers
              </span>
              <UserPresenceAvatar showStatusLabel size="default" />
            </div>
          </section>

          {/* Interactive Stack Cards with Preview Link Card */}
          <section className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Integrated Technologies</h2>
              <p className="text-sm text-muted-foreground">
                Hover over any technology card below to trigger the animated preview link card.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <PreviewLinkCard href="https://nextjs.org">
                <PreviewLinkCardTrigger asChild>
                  <div className="p-4 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors cursor-pointer group shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          Next.js 14
                        </h3>
                        <p className="text-xs text-muted-foreground">App Router &amp; SSR</p>
                      </div>
                    </div>
                  </div>
                </PreviewLinkCardTrigger>
                <PreviewLinkCardContent className="bg-popover p-4 max-w-xs shadow-xl border">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Globe className="h-4 w-4" /> Next.js 14
                    </div>
                    <p className="text-muted-foreground">
                      The React Framework for the Web. Featuring nested layouts, server components, and modern client routing.
                    </p>
                    <span className="text-[11px] text-primary font-medium">nextjs.org →</span>
                  </div>
                </PreviewLinkCardContent>
              </PreviewLinkCard>

              <PreviewLinkCard href="https://animate-ui.com">
                <PreviewLinkCardTrigger asChild>
                  <div className="p-4 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors cursor-pointer group shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          Animate UI
                        </h3>
                        <p className="text-xs text-muted-foreground">Fluid Motion Primitives</p>
                      </div>
                    </div>
                  </div>
                </PreviewLinkCardTrigger>
                <PreviewLinkCardContent className="bg-popover p-4 max-w-xs shadow-xl border">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Sparkles className="h-4 w-4 text-purple-500" /> Animate UI Components
                    </div>
                    <p className="text-muted-foreground">
                      Interactive motion components: Hexagon Background, Liquid Buttons, Presence Avatars, and Radix animated wrappers.
                    </p>
                    <span className="text-[11px] text-primary font-medium">animate-ui.com →</span>
                  </div>
                </PreviewLinkCardContent>
              </PreviewLinkCard>

              <PreviewLinkCard href="https://ui.shadcn.com">
                <PreviewLinkCardTrigger asChild>
                  <div className="p-4 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors cursor-pointer group shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-800 text-white">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          shadcn/ui Form
                        </h3>
                        <p className="text-xs text-muted-foreground">React Hook Form + Zod</p>
                      </div>
                    </div>
                  </div>
                </PreviewLinkCardTrigger>
                <PreviewLinkCardContent className="bg-popover p-4 max-w-xs shadow-xl border">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Layers className="h-4 w-4" /> shadcn/ui Forms
                    </div>
                    <p className="text-muted-foreground">
                      Type-safe schemas, accessible controls, and seamless validation errors built with Zod and React Hook Form.
                    </p>
                    <span className="text-[11px] text-primary font-medium">ui.shadcn.com →</span>
                  </div>
                </PreviewLinkCardContent>
              </PreviewLinkCard>

              <PreviewLinkCard href="https://jwt.io">
                <PreviewLinkCardTrigger asChild>
                  <div className="p-4 rounded-xl border border-border/70 bg-card hover:bg-accent/40 transition-colors cursor-pointer group shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-600 text-white">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          JWT Lifecycle
                        </h3>
                        <p className="text-xs text-muted-foreground">Dual-Token &amp; Rotation</p>
                      </div>
                    </div>
                  </div>
                </PreviewLinkCardTrigger>
                <PreviewLinkCardContent className="bg-popover p-4 max-w-xs shadow-xl border">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <KeyRound className="h-4 w-4 text-rose-500" /> JSON Web Tokens
                    </div>
                    <p className="text-muted-foreground">
                      Stateless access tokens paired with rotated refresh tokens in HTTP-only cookies, strictly enforced with role-based policies.
                    </p>
                    <span className="text-[11px] text-primary font-medium">jwt.io →</span>
                  </div>
                </PreviewLinkCardContent>
              </PreviewLinkCard>
            </div>
          </section>

          {/* Architecture & Feature Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Role-Based Access Control</CardTitle>
                <CardDescription>
                  Granular permission enforcement protecting client routes and server endpoints based on verified claims.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>• User &amp; Admin permission segregation</div>
                <div>• Automatic redirection on unauthorized access</div>
                <div>• Verified server-side claim signatures</div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Silent Refresh Rotation</CardTitle>
                <CardDescription>
                  Seamless access token replenishment without interrupting active user experiences or requesting re-login.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>• Short-lived access token lifetime (15 mins)</div>
                <div>• One-time rotated refresh tokens</div>
                <div>• Automatic 401 interceptor recovery</div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-colors">
              <CardHeader className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Secure Cookie Storage</CardTitle>
                <CardDescription>
                  Mitigating cross-site scripting (XSS) risks by sealing refresh credentials behind strict HTTP-only flags.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>• SameSite=Strict protection</div>
                <div>• Secure HTTPS flag enforcement</div>
                <div>• Unreachable by client JavaScript</div>
              </CardContent>
            </Card>
          </section>

          {/* Interactive Accordion Section */}
          <section className="space-y-6 pt-4">
            <div className="text-center space-y-1">
              <Badge variant="outline" className="text-xs">Security Deep-Dive</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Authentication Architecture FAQ</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Explore how the cryptographic tokens, database storage, and client state work together smoothly.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-xs backdrop-blur-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-semibold">
                    How does the dual-token architecture defend against token theft?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    By issuing a short-lived access token (e.g. 15 minutes) kept in memory and an HTTP-only refresh token stored in a secure cookie, attackers cannot harvest long-lived credentials via client-side script injection (XSS). Furthermore, every refresh request rotates the refresh token so that compromised tokens are instantly invalidated.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-base font-semibold">
                    What happens when an access token expires while using the app?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    The client-side API layer intercepts the HTTP 401 response, triggers an automated background call to <code className="bg-muted px-1.5 py-0.5 rounded text-xs">POST /api/auth/refresh</code>, acquires a new access token, updates the auth state, and transparently retries the original request without user interruption.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-base font-semibold">
                    How is Role-Based Access Control (RBAC) enforced?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Both client and server validate roles. On the frontend, components like <code className="bg-muted px-1.5 py-0.5 rounded text-xs">&lt;RoleGuard allowedRoles=&#123;[&quot;admin&quot;]&#125;&gt;</code> prevent unauthorized navigation. On the backend Express API, JWT middleware decodes the cryptographically signed claims and blocks requests that do not possess the required privilege level.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-base font-semibold">
                    How do Animate UI and shadcn Form elevate the UI experience?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Animate UI provides hardware-accelerated motion primitives (interactive Hexagon Backgrounds, Liquid wave buttons, real-time presence indicators, and smooth Radix overlays), while shadcn Form provides accessible React Hook Form and Zod validation schemas for resilient, instant feedback.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
