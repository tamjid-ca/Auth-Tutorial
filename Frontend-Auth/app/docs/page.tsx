"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { HexagonBackground } from "@/components/animate-ui/components/backgrounds/hexagon";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { Progress } from "@/components/animate-ui/components/radix/progress";
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
import { JsonFileViewer } from "@/components/json-file-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Loader2,
  Shield,
  Key,
  Layers,
  Sparkles,
  Server,
  FileCode,
  ExternalLink,
  Code2,
} from "lucide-react";

interface ApiEndpointConfig {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  authType: "Public" | "Bearer Token" | "Admin RBAC";
  headers: Record<string, string>;
  defaultBody?: Record<string, unknown> | null;
  sampleResponse: Record<string, unknown>;
}

export default function ApiDocsPage() {
  const { user, accessToken, refreshToken } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [healthScore, setHealthScore] = useState(40);

  // Endpoint configurations
  const endpoints: ApiEndpointConfig[] = [
    {
      id: "register",
      method: "POST",
      path: "/api/auth/register",
      title: "Register New User Account",
      description: "Registers a new user into MongoDB with a bcrypt-hashed password and returns signed JWT access & refresh tokens.",
      authType: "Public",
      headers: {
        "Content-Type": "application/json",
      },
      defaultBody: {
        name: "Test Engineer",
        email: `test_${Math.floor(Math.random() * 1000)}@example.com`,
        password: "Password@12345",
        role: "user",
      },
      sampleResponse: {
        message: "User registered successfully",
        user: {
          id: "6704b2a8f9c123456789abcd",
          name: "Test Engineer",
          email: "test_engineer@example.com",
          role: "user",
          createdAt: new Date().toISOString(),
        },
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDRiMmE4ZjljMTIzNDU2Nzg5YWJjZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzI4NjAwMDAwLCJleHAiOjE3Mjg2MDA5MDB9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDRiMmE4ZjljMTIzNDU2Nzg5YWJjZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzI4NjAwMDAwLCJleHAiOjE3MjkyMDQ4MDB9...",
      },
    },
    {
      id: "login",
      method: "POST",
      path: "/api/auth/login",
      title: "Authenticate User (Login)",
      description: "Validates credentials against MongoDB, issues a short-lived access token, and sets the secure HttpOnly refresh cookie.",
      authType: "Public",
      headers: {
        "Content-Type": "application/json",
      },
      defaultBody: {
        email: "admin@example.com",
        password: "Admin@123456",
      },
      sampleResponse: {
        message: "Login successful",
        user: {
          id: "6704b2a8f9c123456789abcd",
          name: "Administrator",
          email: "admin@example.com",
          role: "admin",
        },
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDRiMmE4ZjljMTIzNDU2Nzg5YWJjZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyODYwMDAwMCwiZXhwIjoxNzI4NjAwOTAwfQ...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDRiMmE4ZjljMTIzNDU2Nzg5YWJjZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyODYwMDAwMCwiZXhwIjoxNzI5MjA0ODAwfQ...",
      },
    },
    {
      id: "refresh",
      method: "POST",
      path: "/api/auth/refresh",
      title: "Silent Token Refresh & Rotation",
      description: "Verifies the refresh token, performs rotation against MongoDB, and issues a renewed 15-minute access token.",
      authType: "Public",
      headers: {
        "Content-Type": "application/json",
      },
      defaultBody: {
        refreshToken: refreshToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      sampleResponse: {
        message: "Token refreshed successfully",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDRiMmE4ZjljMTIzNDU2Nzg5YWJjZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzI4NjAxMDAwLCJleHAiOjE3Mjg2MDE5MDB9...",
      },
    },
    {
      id: "logout",
      method: "POST",
      path: "/api/auth/logout",
      title: "Revoke Session & Logout",
      description: "Invalidates the active refresh token in MongoDB and clears the HTTP-only cookie, terminating the session.",
      authType: "Public",
      headers: {
        "Content-Type": "application/json",
      },
      defaultBody: {
        refreshToken: refreshToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      sampleResponse: {
        message: "Logged out successfully",
      },
    },
    {
      id: "profile",
      method: "GET",
      path: "/api/users/profile",
      title: "Get Verified User Profile",
      description: "Protected route. Extracts the user ID from the Bearer JWT access token and returns verified MongoDB document fields.",
      authType: "Bearer Token",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer <ACCESS_TOKEN>",
      },
      defaultBody: null,
      sampleResponse: {
        user: {
          id: user?.id || "6704b2a8f9c123456789abcd",
          name: user?.name || "Verified Member",
          email: user?.email || "user@example.com",
          role: user?.role || "user",
          createdAt: new Date().toISOString(),
        },
      },
    },
    {
      id: "admin-dashboard",
      method: "GET",
      path: "/api/admin/dashboard",
      title: "Admin Dashboard Control Center",
      description: "RBAC-restricted route. Verifies that the JWT payload claim specifies role === 'admin'. Returns system statistics.",
      authType: "Admin RBAC",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer <ADMIN_ACCESS_TOKEN>",
      },
      defaultBody: null,
      sampleResponse: {
        message: "Welcome to the Admin Dashboard",
        admin: {
          id: user?.id || "6704b2a8f9c123456789abcd",
          name: user?.name || "Administrator",
          role: "admin",
        },
        stats: {
          totalUsers: 24,
          activeSessions: 8,
          systemStatus: "healthy",
        },
      },
    },
  ];

  // Request body states
  const [requestBodies, setRequestBodies] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    endpoints.forEach((ep) => {
      if (ep.defaultBody) {
        initial[ep.id] = JSON.stringify(ep.defaultBody, null, 2);
      }
    });
    return initial;
  });

  // Response execution states
  const [executionResults, setExecutionResults] = useState<
    Record<
      string,
      {
        loading: boolean;
        response: unknown;
        statusCode: number | null;
        statusText: string;
        timeMs: number | null;
      }
    >
  >({});

  // Check backend server connectivity
  useEffect(() => {
    const checkServer = async () => {
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
    checkServer();
  }, [apiUrl]);

  // Execute request handler
  const handleExecute = async (endpoint: ApiEndpointConfig) => {
    setExecutionResults((prev) => ({
      ...prev,
      [endpoint.id]: {
        loading: true,
        response: null,
        statusCode: null,
        statusText: "",
        timeMs: null,
      },
    }));

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (endpoint.authType === "Bearer Token" || endpoint.authType === "Admin RBAC") {
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.method === "POST" && requestBodies[endpoint.id]) {
        options.body = requestBodies[endpoint.id];
      }

      const res = await fetch(`${apiUrl}${endpoint.path}`, options);
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      let data: unknown;
      try {
        data = await res.json();
      } catch {
        data = { message: res.statusText || `Response status: ${res.status}` };
      }

      setExecutionResults((prev) => ({
        ...prev,
        [endpoint.id]: {
          loading: false,
          response: data,
          statusCode: res.status,
          statusText: res.statusText || (res.ok ? "OK" : "Error"),
          timeMs: elapsed,
        },
      }));
    } catch (err: unknown) {
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      const errorMsg = err instanceof Error ? err.message : "Network error";

      setExecutionResults((prev) => ({
        ...prev,
        [endpoint.id]: {
          loading: false,
          response: {
            error: "Request Failed",
            details: errorMsg,
            hint: "Make sure the Express backend server is running on port 5000: 'npm run dev' inside Backend-Auth",
          },
          statusCode: 503,
          statusText: "Backend Unreachable",
          timeMs: elapsed,
        },
      }));
    }
  };

  const handleResetBody = (endpoint: ApiEndpointConfig) => {
    if (endpoint.defaultBody) {
      setRequestBodies((prev) => ({
        ...prev,
        [endpoint.id]: JSON.stringify(endpoint.defaultBody, null, 2),
      }));
    }
  };

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden">
        {/* Hexagon Background */}
        <div className="absolute inset-0 top-0 h-[600px] w-full overflow-hidden opacity-50 dark:opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_75%)]">
          <HexagonBackground hexagonSize={65} hexagonMargin={3} />
        </div>

        <div className="container relative z-10 mx-auto max-w-5xl px-4 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 backdrop-blur-sm px-4 py-1 text-xs text-muted-foreground shadow-xs">
              <Server className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-semibold text-foreground">API Server:</span>
              <span className="font-mono">{apiUrl}</span>
              <span className="text-muted-foreground">•</span>
              {backendStatus === "checking" && (
                <span className="text-amber-500 flex items-center gap-1 font-medium">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                </span>
              )}
              {backendStatus === "online" && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              )}
              {backendStatus === "offline" && (
                <span className="text-rose-500 flex items-center gap-1 font-medium">
                  <XCircle className="h-3.5 w-3.5" /> Offline (Port 5000)
                </span>
              )}
            </div>

            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>API Gateway Health</span>
                <span className="font-mono">{healthScore}%</span>
              </div>
              <Progress value={healthScore} className="h-1.5" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Interactive API Reference &amp; <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Playground</span>
            </h1>
            <p className="text-base text-muted-foreground">
              Comprehensive technical documentation with executable endpoints. Expand any accordion item, customize parameters, execute live requests, and inspect the resulting JSON file.
            </p>

            {/* Active Session Status */}
            <div className="p-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Active Session Auth:</span>
                {user ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                    Logged in as {user.name} ({user.role})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Guest (Anonymous)
                  </Badge>
                )}
              </div>

              {accessToken && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  Bearer Token Loaded ({accessToken.slice(0, 14)}...)
                </span>
              )}
            </div>
          </div>

          {/* Accordion Documentation List */}
          <div className="space-y-4">
            <Accordion type="single" collapsible defaultValue="register" className="w-full space-y-4">
              {endpoints.map((endpoint) => {
                const currentResult = executionResults[endpoint.id];
                const isExecuting = currentResult?.loading;

                return (
                  <AccordionItem
                    key={endpoint.id}
                    value={endpoint.id}
                    className="border border-border/80 rounded-2xl bg-card/90 shadow-xs backdrop-blur-xs px-4 py-1"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-wrap items-center gap-3 text-left w-full pr-4">
                        {/* Method Badge */}
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
                            endpoint.method === "GET"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                          }`}
                        >
                          {endpoint.method}
                        </span>

                        {/* Path */}
                        <span className="font-mono text-sm font-bold text-foreground">
                          {endpoint.path}
                        </span>

                        {/* Title */}
                        <span className="hidden md:inline text-xs text-muted-foreground font-medium">
                          — {endpoint.title}
                        </span>

                        {/* Auth Badge */}
                        <div className="ml-auto flex items-center gap-2">
                          {endpoint.authType === "Public" && (
                            <Badge variant="outline" className="text-[10px]">
                              Public
                            </Badge>
                          )}
                          {endpoint.authType === "Bearer Token" && (
                            <Badge variant="outline" className="border-indigo-500/40 text-indigo-600 text-[10px]">
                              <Key className="h-2.5 w-2.5 mr-1" />
                              Bearer JWT
                            </Badge>
                          )}
                          {endpoint.authType === "Admin RBAC" && (
                            <Badge variant="outline" className="border-purple-500/40 text-purple-600 text-[10px]">
                              <Shield className="h-2.5 w-2.5 mr-1" />
                              Admin Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-6 space-y-6">
                      {/* Description & Technical Summary */}
                      <div className="text-xs text-muted-foreground space-y-2 border-b border-border/60 pb-4">
                        <p className="text-sm font-medium text-foreground">{endpoint.description}</p>
                        <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px]">
                          <span>
                            <strong>URL:</strong> {apiUrl}
                            {endpoint.path}
                          </span>
                          <span>
                            <strong>Authorization:</strong> {endpoint.authType}
                          </span>
                        </div>
                      </div>

                      {/* Headers Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                          <span>Request Headers</span>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs font-mono space-y-1">
                          {Object.entries(endpoint.headers).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{key}:</span>
                              <span className="text-muted-foreground truncate max-w-md">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Request Body Editor (if POST) */}
                      {endpoint.defaultBody && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <FileCode className="h-3.5 w-3.5 text-primary" />
                              Request Body Payload (JSON)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetBody(endpoint)}
                              className="h-6 text-[10px] px-2 text-muted-foreground"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset Default
                            </Button>
                          </div>

                          <textarea
                            value={requestBodies[endpoint.id] || ""}
                            onChange={(e) =>
                              setRequestBodies((prev) => ({
                                ...prev,
                                [endpoint.id]: e.target.value,
                              }))
                            }
                            rows={6}
                            className="w-full rounded-xl border border-border/80 bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs resize-y"
                          />
                        </div>
                      )}

                      {/* Execution Action Button */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-muted-foreground">
                          Click below to execute against the live backend server:
                        </div>
                        <LiquidButton
                          onClick={() => handleExecute(endpoint)}
                          disabled={isExecuting}
                          className="flex items-center gap-2 text-xs h-9 px-4"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Executing HTTP {endpoint.method}...</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Execute Request</span>
                            </>
                          )}
                        </LiquidButton>
                      </div>

                      {/* JSON File Viewer Section */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5 text-indigo-500" />
                            {currentResult ? "Live Execution Response" : "Sample Expected Response"}
                          </span>
                          {currentResult ? (
                            <Badge variant="outline" className="text-[10px]">
                              Live Server Result
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Reference Preview
                            </Badge>
                          )}
                        </div>

                        {/* Component: JsonFileViewer */}
                        <JsonFileViewer
                          filename={`${endpoint.id}-response.json`}
                          data={currentResult ? currentResult.response : endpoint.sampleResponse}
                          statusCode={currentResult ? currentResult.statusCode : 200}
                          statusText={currentResult ? currentResult.statusText : "OK"}
                          executionTimeMs={currentResult ? currentResult.timeMs : null}
                          maxHeight="320px"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
