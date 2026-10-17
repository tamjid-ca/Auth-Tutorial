"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
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
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
  Radio,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutOpen(false);
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 text-foreground font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg">
              Auth<span className="text-primary font-extrabold">Hub</span>
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
              >
                Home
              </Button>
            </Link>

            <Link href="/docs">
              <Button
                variant={isActive("/docs") ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
              >
                API Docs
              </Button>
            </Link>

            {user && (
              <>
                <Link href="/dashboard">
                  <Button
                    variant={isActive("/dashboard") ? "secondary" : "ghost"}
                    size="sm"
                    className="flex items-center gap-1.5 text-sm font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/admin">
                  <Button
                    variant={isActive("/admin") ? "secondary" : "ghost"}
                    size="sm"
                    className="flex items-center gap-1.5 text-sm font-medium"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    Admin
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Auth status & actions */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Active user presence badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer rounded-full bg-muted/40 p-1 pr-3 border border-border/60 hover:bg-muted/70 transition-colors">
                      <div className="relative">
                        <Avatar className="size-8 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                            {user.name?.slice(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">
                          {user.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={user.role === "admin" ? "admin" : "user"}
                            className="capitalize text-[9px] py-0 px-1 h-3.5"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-[11px] opacity-80">{user.email}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 pt-1">
                        <Radio className="size-3 animate-pulse" /> Active JWT Session
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Logout Alert Dialog */}
                <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Session Termination</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to sign out? Your access token and HTTP-only refresh cookie will be cleared from this browser.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="flex items-center gap-1 shadow-sm font-medium">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
