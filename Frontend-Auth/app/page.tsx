"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Ping any endpoint to verify Express connectivity
        const res = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        // 401 is expected because we passed an empty body, which confirms the Express server is online
        if (res.status === 401 || res.status === 200 || res.status === 400) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, [apiUrl]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs text-muted-foreground shadow-sm">
          <span>Backend API:</span>
          {backendStatus === "checking" && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <RefreshCw className="h-3 w-3 animate-spin" /> Checking...
            </span>
          )}
          {backendStatus === "online" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Online ({apiUrl})
            </span>
          )}
          {backendStatus === "offline" && (
            <span className="flex items-center gap-1 text-rose-500 font-medium">
              <XCircle className="h-3.5 w-3.5" /> Offline (Run backend on port 5000)
            </span>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto">
          Secure Authentication &amp; RBAC Architecture
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Built with Next.js App Router, Tailwind CSS, shadcn/ui components, and an Express + MongoDB backend with dual-token JWT lifecycle.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {!isLoading && user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center gap-2 shadow-sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button size="lg" variant="outline" className="flex items-center gap-2 border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20">
                    <ShieldCheck className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="flex items-center gap-2 shadow-sm">
                  Get Started (Register)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Short-Lived Access Tokens</CardTitle>
            <CardDescription>
              15-minute JWTs carry user ID and role claims for stateless, low-latency authorization.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
              <RefreshCw className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Silent Refresh Rotation</CardTitle>
            <CardDescription>
              7-day refresh tokens securely persist in MongoDB and auto-refresh expired sessions on 401s.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Role-Based Access (RBAC)</CardTitle>
            <CardDescription>
              Granular access control strictly segregates standard users from protected admin areas.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
              <Database className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Instant Token Revocation</CardTitle>
            <CardDescription>
              Logging out nullifies the refresh token in MongoDB, immediately preventing token reuse.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">bcryptjs Password Hashing</CardTitle>
            <CardDescription>
              12 salt rounds ensure user passwords are encrypted with industrial security standards.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
              <UserCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Client &amp; Server Guards</CardTitle>
            <CardDescription>
              Next.js client route guards work in tandem with Express route middleware for total security.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* API Reference Preview */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Backend API Endpoints</h2>
            <p className="text-xs text-muted-foreground">Connected to Express API running at {apiUrl}</p>
          </div>
          <Badge variant="outline" className="w-fit text-xs font-mono">
            Express 4.19 + Mongoose 8
          </Badge>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground">
                <th className="py-2 px-3 font-semibold">Method</th>
                <th className="py-2 px-3 font-semibold">Endpoint</th>
                <th className="py-2 px-3 font-semibold">Protection</th>
                <th className="py-2 px-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">POST</td>
                <td className="py-2.5 px-3">/api/auth/register</td>
                <td className="py-2.5 px-3 text-muted-foreground">Public</td>
                <td className="py-2.5 px-3 font-sans">Creates account, hashes password, saves refresh token</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">POST</td>
                <td className="py-2.5 px-3">/api/auth/login</td>
                <td className="py-2.5 px-3 text-muted-foreground">Public</td>
                <td className="py-2.5 px-3 font-sans">Validates password, returns access + refresh token</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">GET</td>
                <td className="py-2.5 px-3">/api/users/profile</td>
                <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold">Bearer Access Token</td>
                <td className="py-2.5 px-3 font-sans">Returns authenticated user document (excl. password)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">POST</td>
                <td className="py-2.5 px-3">/api/auth/refresh</td>
                <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-semibold">Refresh Token</td>
                <td className="py-2.5 px-3 font-sans">Exchanges refresh token for new 15-min access token</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">GET</td>
                <td className="py-2.5 px-3">/api/admin/dashboard</td>
                <td className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-semibold">Admin Role Token</td>
                <td className="py-2.5 px-3 font-sans">Restricted endpoint verifying role === &quot;admin&quot;</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">POST</td>
                <td className="py-2.5 px-3">/api/auth/logout</td>
                <td className="py-2.5 px-3 text-muted-foreground">Refresh Token</td>
                <td className="py-2.5 px-3 font-sans">Revokes refresh token in MongoDB server-side</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
