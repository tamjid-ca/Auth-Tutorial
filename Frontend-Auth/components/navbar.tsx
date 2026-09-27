"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-foreground font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
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
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-foreground">
                  {user.name}
                </span>
                <Badge
                  variant={user.role === "admin" ? "admin" : "user"}
                  className="mt-0.5 capitalize text-[10px] py-0 px-1.5"
                >
                  {user.role}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
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
                <Button size="sm" className="flex items-center gap-1 shadow-sm">
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
