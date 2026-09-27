"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, AuthResponse } from "@/lib/types";
import {
  authApi,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  manualRefresh: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile();
      setUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
    } catch {
      // If profile fetching fails, clear tokens
      setUser(null);
      clearTokens();
    }
  }, []);

  // Initial load: restore tokens & user profile
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = getAccessToken();
      const refToken = getRefreshToken();

      if (token && refToken) {
        setAccessTokenState(token);
        setRefreshTokenState(refToken);

        const cachedUser = localStorage.getItem("authUser");
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            // ignore JSON parse error
          }
        }

        try {
          await refreshProfile();
        } catch {
          // Token might be invalid or backend down
        }
      }

      setIsLoading(false);
    };

    initAuth();

    // Listen for logout events dispatched from API client
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessTokenState(null);
      setRefreshTokenState(null);
    };

    window.addEventListener("auth-logout", handleLogoutEvent);
    return () => window.removeEventListener("auth-logout", handleLogoutEvent);
  }, [refreshProfile]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setTokens(res.accessToken, res.refreshToken);
      setAccessTokenState(res.accessToken);
      setRefreshTokenState(res.refreshToken);

      // Fetch user profile
      const profile = await authApi.getProfile();
      setUser(profile.user);
      localStorage.setItem("authUser", JSON.stringify(profile.user));

      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role?: string
  ): Promise<AuthResponse> => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password, role });

      // Automatically store tokens if returned on registration
      if (res.accessToken && res.refreshToken) {
        setTokens(res.accessToken, res.refreshToken);
        setAccessTokenState(res.accessToken);
        setRefreshTokenState(res.refreshToken);
      }

      if (res.user) {
        setUser(res.user);
        localStorage.setItem("authUser", JSON.stringify(res.user));
      }

      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentRefToken = refreshToken || getRefreshToken();
    if (currentRefToken) {
      try {
        await authApi.logout(currentRefToken);
      } catch {
        // Continue clearing client even if server call fails
      }
    }
    clearTokens();
    setUser(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
  };

  const manualRefresh = async () => {
    const currentRefToken = refreshToken || getRefreshToken();
    if (!currentRefToken) {
      throw new Error("No refresh token available");
    }

    const res = await authApi.refresh(currentRefToken);
    setTokens(res.accessToken);
    setAccessTokenState(res.accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,
        login,
        register,
        logout,
        manualRefresh,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
