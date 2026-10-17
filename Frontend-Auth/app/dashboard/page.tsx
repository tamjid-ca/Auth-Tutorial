"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/animate-ui/components/radix/accordion";
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
  User,
  Key,
  RefreshCw,
  Shield,
  Copy,
  Check,
  Calendar,
  Mail,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, accessToken, refreshToken, manualRefresh, refreshProfile, logout } = useAuth();

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rawProfileData, setRawProfileData] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<"access" | "refresh" | null>(null);
  const [tokenLifetimePercent, setTokenLifetimePercent] = useState(85);
  const [revokeOpen, setRevokeOpen] = useState(false);

  // Parse decoded token claims safely for inspection
  const decodedToken = useMemo(() => {
    if (!accessToken) return null;
    try {
      const parts = accessToken.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        return { header, payload };
      }
    } catch {
      return null;
    }
    return null;
  }, [accessToken]);

  // Simulate token lifetime countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenLifetimePercent((prev) => (prev > 10 ? prev - 1 : 95));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshLoading(true);
    setStatusMessage(null);
    try {
      await manualRefresh();
      setTokenLifetimePercent(100);
      setStatusMessage({
        type: "success",
        text: "Access token successfully refreshed & rotated via POST /api/auth/refresh!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refresh token.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleTestProtectedEndpoint = async () => {
    setProfileLoading(true);
    setStatusMessage(null);
    try {
      const data = await authApi.getProfile();
      setRawProfileData(JSON.stringify(data, null, 2));
      setStatusMessage({
        type: "success",
        text: "Successfully verified Bearer token with backend Express auth middleware!",
      });
      await refreshProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch profile.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "access" | "refresh") => {
    navigator.clipboard.writeText(text);
    setCopiedToken(type);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeTokens = async () => {
    await logout();
    setRevokeOpen(false);
  };

  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated Session
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Bearer JWT Verified
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                User Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Active profile claims &amp; dual-token cryptographic lifecycle manager.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 shadow-xs"
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin Panel
                  </Button>
                </Link>
              )}

              {/* Revoke Session Alert Dialog */}
              <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                    Revoke Session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Active JWT Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke your active refresh token and invalidate your access token. You will be redirected to the sign-in screen immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeTokens}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revoke &amp; Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Global Alert Notification */}
          {statusMessage && (
            <Alert className={statusMessage.type === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300"}>
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
              )}
              <AlertTitle>{statusMessage.type === "success" ? "Operation Successful" : "Security Notice"}</AlertTitle>
              <AlertDescription>{statusMessage.text}</AlertDescription>
            </Alert>
          )}

          {/* Active Team Presence Widget */}
          <Card className="border-border/70 shadow-xs bg-card/60 backdrop-blur-xs">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold">Active Team Sessions</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Simulated real-time presence across your authenticated workspace. Click avatars to toggle presence.
                </p>
              </div>
              <UserPresenceAvatar showStatusLabel size="sm" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="md:col-span-1 shadow-xs border-border/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">User Profile</CardTitle>
                  <Badge variant={user?.role === "admin" ? "admin" : "user"} className="capitalize">
                    {user?.role}
                  </Badge>
                </div>
                <CardDescription>Verified MongoDB document claims</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Full Name</div>
                    <div className="font-semibold text-foreground">{user?.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Email Address</div>
                    <div className="font-semibold text-foreground break-all">{user?.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Fingerprint className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">User ID (MongoDB _id)</div>
                    <div className="font-mono text-xs text-muted-foreground break-all">
                      {user?.id || user?._id || "N/A"}
                    </div>
                  </div>
                </div>

                {user?.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Registered Date</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Token Remaining Lifetime with Radix Progress */}
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Token Life Remaining</span>
                    <span className="font-mono font-semibold text-primary">{tokenLifetimePercent}%</span>
                  </div>
                  <Progress value={tokenLifetimePercent} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">
                    Silent refresh triggers before expiration to ensure uninterrupted access.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs shadow-xs"
                  onClick={handleTestProtectedEndpoint}
                  disabled={profileLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${profileLoading ? "animate-spin" : ""}`} />
                  Test GET /api/users/profile
                </Button>
              </CardFooter>
            </Card>

            {/* Token Lifecycle & Inspector Card */}
            <Card className="md:col-span-2 shadow-xs border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Token Lifecycle Inspector
                  </CardTitle>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    Dual-Token Architecture
                  </Badge>
                </div>
                <CardDescription>
                  Access token (in-memory) &amp; Refresh token (HTTP-only cookie + DB). Test rotation and inspect claims.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Access Token Box with Preview Link Card */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <PreviewLinkCard href="https://jwt.io">
                      <PreviewLinkCardTrigger asChild>
                        <span className="font-semibold flex items-center gap-1.5 text-foreground cursor-pointer hover:underline">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Access Token (Short-Lived: 15m)
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </span>
                      </PreviewLinkCardTrigger>
                      <PreviewLinkCardContent className="bg-popover p-3 text-xs max-w-xs shadow-lg border">
                        <p className="font-semibold">JWT Access Token</p>
                        <p className="text-muted-foreground text-[11px] mt-1">
                          Attached to Authorization: Bearer headers. Verified on every protected Express endpoint.
                        </p>
                      </PreviewLinkCardContent>
                    </PreviewLinkCard>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => copyToClipboard(accessToken || "", "access")}
                          disabled={!accessToken}
                        >
                          {copiedToken === "access" ? (
                            <Check className="h-3 w-3 text-emerald-500 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copiedToken === "access" ? "Copied" : "Copy"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Access Token to Clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground break-all bg-background/80 p-2.5 rounded-lg border border-border/60 max-h-20 overflow-y-auto">
                    {accessToken || "No access token present"}
                  </div>
                </div>

                {/* Refresh Token Box with Preview Link Card */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <PreviewLinkCard href="https://owasp.org/www-community/attacks/csrf">
                      <PreviewLinkCardTrigger asChild>
                        <span className="font-semibold flex items-center gap-1.5 text-foreground cursor-pointer hover:underline">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Refresh Token (Rotated: 7d, In MongoDB)
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </span>
                      </PreviewLinkCardTrigger>
                      <PreviewLinkCardContent className="bg-popover p-3 text-xs max-w-xs shadow-lg border">
                        <p className="font-semibold">Rotated Refresh Token</p>
                        <p className="text-muted-foreground text-[11px] mt-1">
                          Stored in MongoDB and dispatched via HttpOnly cookie. Rotated on every refresh call.
                        </p>
                      </PreviewLinkCardContent>
                    </PreviewLinkCard>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => copyToClipboard(refreshToken || "", "refresh")}
                          disabled={!refreshToken}
                        >
                          {copiedToken === "refresh" ? (
                            <Check className="h-3 w-3 text-emerald-500 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copiedToken === "refresh" ? "Copied" : "Copy"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Refresh Token to Clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground break-all bg-background/80 p-2.5 rounded-lg border border-border/60 max-h-20 overflow-y-auto">
                    {refreshToken || "No refresh token present"}
                  </div>
                </div>

                {/* Decoded JWT Claims Accordion */}
                {decodedToken && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="jwt-claims" className="border rounded-xl px-3 bg-muted/20">
                      <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          Decoded JWT Header &amp; Payload Claims
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 text-xs font-mono space-y-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-sans uppercase">Header</span>
                          <pre className="p-2 bg-background/80 rounded border text-[10px] overflow-x-auto">
                            {JSON.stringify(decodedToken.header, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-sans uppercase">Payload Claims</span>
                          <pre className="p-2 bg-background/80 rounded border text-[10px] overflow-x-auto">
                            {JSON.stringify(decodedToken.payload, null, 2)}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Live Response Box */}
                {rawProfileData && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground">Protected API Response:</span>
                    <pre className="text-[11px] font-mono bg-muted p-3 rounded-lg overflow-x-auto border border-border text-foreground">
                      {rawProfileData}
                    </pre>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-wrap gap-3 pt-3 border-t border-border/40">
                <LiquidButton
                  size="default"
                  onClick={handleManualRefresh}
                  disabled={refreshLoading || !refreshToken}
                  className="flex items-center gap-2 text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshLoading ? "animate-spin" : ""}`} />
                  Refresh Token (POST /api/auth/refresh)
                </LiquidButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
