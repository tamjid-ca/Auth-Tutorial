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
} from "lucide-react";

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="admin" className="text-xs">
                RBAC Level: Admin
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                GET /api/admin/dashboard
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              Administrator Control Center
            </h1>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authorization Failure</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {adminData && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>RBAC Verification Passed</AlertTitle>
            <AlertDescription>
              Backend successfully verified your JWT token claims and confirmed role: <strong>admin</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Role Enforcement</CardDescription>
                <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl font-bold">requireRole(&apos;admin&apos;)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Express middleware verifies req.user.role before invoking controllers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Admin Session ID</CardDescription>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm font-mono break-all font-semibold">
                {adminData?.admin.id || "Loading..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                MongoDB ObjectId verified from JWT payload.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Database Revocation</CardDescription>
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Logout immediately clears stored refresh tokens in MongoDB.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Raw Response & Technical Architecture */}
        <Card className="border-border shadow-sm">
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
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={loading}
              className="h-8 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Re-fetch
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                Querying /api/admin/dashboard...
              </div>
            ) : (
              <pre className="font-mono text-xs bg-muted p-4 rounded-lg border border-border text-foreground overflow-x-auto">
                {JSON.stringify(adminData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
