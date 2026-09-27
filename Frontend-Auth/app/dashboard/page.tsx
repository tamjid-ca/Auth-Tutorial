"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, accessToken, refreshToken, manualRefresh, refreshProfile } = useAuth();

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [rawProfileData, setRawProfileData] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<"access" | "refresh" | null>(null);

  const handleManualRefresh = async () => {
    setRefreshLoading(true);
    setStatusMessage(null);
    try {
      await manualRefresh();
      setStatusMessage({
        type: "success",
        text: "Access token successfully refreshed via POST /api/auth/refresh!",
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
        text: "Successfully fetched user profile using Bearer access token!",
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

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              User Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authenticated user profile &amp; active JWT token lifecycle management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Global Alert Notification */}
        {statusMessage && (
          <Alert variant={statusMessage.type === "success" ? "success" : "destructive"}>
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{statusMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{statusMessage.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="md:col-span-1 shadow-sm border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">User Profile</CardTitle>
                <Badge variant={user?.role === "admin" ? "admin" : "user"} className="capitalize">
                  {user?.role}
                </Badge>
              </div>
              <CardDescription>Verified MongoDB document</CardDescription>
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
                  <div className="text-xs text-muted-foreground">User ID</div>
                  <div className="font-mono text-xs text-muted-foreground break-all">
                    {user?.id || user?._id || "N/A"}
                  </div>
                </div>
              </div>

              {user?.createdAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">Joined At</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleTestProtectedEndpoint}
                disabled={profileLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${profileLoading ? "animate-spin" : ""}`} />
                Test GET /api/users/profile
              </Button>
            </CardFooter>
          </Card>

          {/* Token Lifecycle & Inspector */}
          <Card className="md:col-span-2 shadow-sm border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Token Lifecycle Inspector
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-mono">
                  Dual-Token Model
                </Badge>
              </div>
              <CardDescription>
                Tokens stored in client memory/localStorage. Inspect payloads or test token rotation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Access Token */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Access Token (Short-Lived: 15m)
                  </span>
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
                </div>
                <div className="font-mono text-[11px] text-muted-foreground break-all bg-background/80 p-2 rounded border border-border/60 max-h-20 overflow-y-auto">
                  {accessToken || "No access token present"}
                </div>
              </div>

              {/* Refresh Token */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Refresh Token (Long-Lived: 7d, In MongoDB)
                  </span>
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
                </div>
                <div className="font-mono text-[11px] text-muted-foreground break-all bg-background/80 p-2 rounded border border-border/60 max-h-20 overflow-y-auto">
                  {refreshToken || "No refresh token present"}
                </div>
              </div>

              {/* Live Response Box if endpoint tested */}
              {rawProfileData && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground">Latest API Response:</span>
                  <pre className="text-[11px] font-mono bg-muted p-3 rounded-lg overflow-x-auto border border-border text-foreground">
                    {rawProfileData}
                  </pre>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              <Button
                variant="default"
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshLoading || !refreshToken}
                className="flex items-center gap-1.5 text-xs shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshLoading ? "animate-spin" : ""}`} />
                Test Token Refresh (POST /api/auth/refresh)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
