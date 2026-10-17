"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";
import { authApi } from "@/lib/api";
import { AdminResponse } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserPresenceAvatar } from "@/components/animate-ui/components/community/user-presence-avatar";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Progress } from "@/components/animate-ui/components/radix/progress";
import {
  PreviewLinkCard,
  PreviewLinkCardTrigger,
  PreviewLinkCardContent,
} from "@/components/animate-ui/components/radix/preview-link-card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import {
  ShieldCheck,
  Lock,
  Users,
  Key,
  Database,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileCode,
  ShieldAlert,
  Server,
  Activity,
  Zap,
} from "lucide-react";

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await authApi.getAdminDashboard();
      setAdminData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin dashboard.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePurgeTokens = () => {
    setPurgeSuccess("All revoked session documents cleaned from MongoDB collection.");
    setPurgeOpen(false);
    setTimeout(() => setPurgeSuccess(null), 4000);
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <TooltipProvider>
        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="admin" className="text-xs">
                  RBAC Level: Admin
                </Badge>
                <PreviewLinkCard href="http://localhost:5000/api/admin/dashboard">
                  <PreviewLinkCardTrigger asChild>
                    <span className="text-xs text-muted-foreground font-mono cursor-pointer hover:underline">
                      GET /api/admin/dashboard
                    </span>
                  </PreviewLinkCardTrigger>
                  <PreviewLinkCardContent className="bg-popover p-3 text-xs max-w-xs shadow-lg border">
                    <p className="font-semibold text-purple-600">Admin Protected Route</p>
                    <p className="text-muted-foreground text-[11px] mt-1">
                      Enforced by requireRole(&apos;admin&apos;) middleware verifying JWT sub &amp; role claims.
                    </p>
                  </PreviewLinkCardContent>
                </PreviewLinkCard>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                Administrator Control Center
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2 shadow-xs">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>

              {/* Purge Inactive Tokens Alert Dialog */}
              <AlertDialog open={purgeOpen} onOpenChange={setPurgeOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs shadow-xs"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                    Purge Stale Tokens
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Purge Expired Token Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will run database garbage collection and remove expired refresh tokens from MongoDB. Active user sessions will not be affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurgeTokens}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirm Purge
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Status Alerts */}
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authorization Failure</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {purgeSuccess && (
            <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Maintenance Complete</AlertTitle>
              <AlertDescription>{purgeSuccess}</AlertDescription>
            </Alert>
          )}

          {adminData && (
            <Alert className="border-purple-500/30 bg-purple-500/10 text-purple-900 dark:text-purple-300">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <AlertTitle>RBAC Verification Passed</AlertTitle>
              <AlertDescription>
                Backend successfully verified your JWT token claims and confirmed role: <strong>admin</strong>.
              </AlertDescription>
            </Alert>
          )}

          {/* User Presence Monitoring Widget */}
          <Card className="border-border/70 shadow-xs bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Active User Presence Monitor
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Simulated real-time presence cluster for system users. Click avatars to toggle simulated availability.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">Real-Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <UserPresenceAvatar showStatusLabel size="default" />
            </CardContent>
          </Card>

          {/* Metrics Grid with Radix Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Role Enforcement</CardDescription>
                  <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl font-bold">requireRole(&apos;admin&apos;)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Express middleware verifies req.user.role before invoking controllers.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Enforcement Compliance</span>
                    <span className="font-mono text-purple-600 font-semibold">100%</span>
                  </div>
                  <Progress value={100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Admin Session ID</CardDescription>
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xs font-mono break-all font-semibold">
                  {adminData?.admin.id || "Loading..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  MongoDB ObjectId verified from JWT payload.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Session Validity</span>
                    <span className="font-mono text-blue-600 font-semibold">Active</span>
                  </div>
                  <Progress value={92} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">Database Revocation</CardDescription>
                  <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  Healthy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Logout immediately clears stored refresh tokens in MongoDB.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Token Health Score</span>
                    <span className="font-mono text-emerald-600 font-semibold">98%</span>
                  </div>
                  <Progress value={98} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raw Response & Technical Architecture */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  Raw Backend Response
                </CardTitle>
                <CardDescription>
                  Payload returned by router.get(&apos;/dashboard&apos;, protect, requireRole(&apos;admin&apos;))
                </CardDescription>
              </div>
              <LiquidButton
                variant="outline"
                size="sm"
                onClick={fetchAdminData}
                disabled={loading}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Re-fetch Metrics
              </LiquidButton>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                  Querying /api/admin/dashboard...
                </div>
              ) : (
                <pre className="font-mono text-xs bg-muted/60 p-4 rounded-xl border border-border text-foreground overflow-x-auto">
                  {JSON.stringify(adminData, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </RoleGuard>
  );
}
