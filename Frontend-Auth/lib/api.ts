import {
  AuthResponse,
  ProfileResponse,
  AdminResponse,
  RefreshResponse,
  ApiErrorResponse,
  AddressListResponse,
  AddressSingleResponse,
  AddressCreateInput,
  AddressUpdateInput,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Token Storage Helpers ────────────────────────────────────────────────────
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
  window.dispatchEvent(new Event("auth-logout"));
};

// Queue for pending requests during token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ── Core API Fetch with Token Refresh Interceptor ────────────────────────────
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (attempt refresh unless the endpoint is already auth/login or auth/refresh)
  if (
    response.status === 401 &&
    !endpoint.includes("/login") &&
    !endpoint.includes("/refresh")
  ) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) {
          clearTokens();
          isRefreshing = false;
          throw new Error("Refresh token expired. Please log in again.");
        }

        const refreshData: RefreshResponse = await refreshRes.json();
        setTokens(refreshData.accessToken);
        isRefreshing = false;
        onRefreshed(refreshData.accessToken);

        // Retry original request with new token
        headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
        const retryRes = await fetch(url, { ...options, headers });
        if (!retryRes.ok) {
          const errData: ApiErrorResponse = await retryRes.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed with status ${retryRes.status}`);
        }
        return retryRes.json();
      } catch (err) {
        clearTokens();
        isRefreshing = false;
        throw err;
      }
    } else {
      // If refresh is already in progress, wait for it
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          fetch(url, { ...options, headers })
            .then(async (res) => {
              if (!res.ok) {
                const errData: ApiErrorResponse = await res.json().catch(() => ({}));
                reject(new Error(errData.message || "Request failed"));
              } else {
                resolve(res.json());
              }
            })
            .catch(reject);
        });
      });
    }
  }

  // Handle standard errors
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Request failed with status: ${response.statusText}` };
    }

    // Extract express-validator errors if present
    if (errorData.errors && errorData.errors.length > 0) {
      const messages = errorData.errors.map((e) => e.msg).join(", ");
      const error = new Error(messages);
      (error as unknown as { apiErrors: ApiErrorResponse }).apiErrors = errorData;
      throw error;
    }

    throw new Error(errorData.message || "An unexpected error occurred.");
  }

  return response.json();
}

// ── Auth Endpoints ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: (data: { email: string; password: string }): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  refresh: (refreshToken: string): Promise<RefreshResponse> => {
    return apiFetch<RefreshResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout: (refreshToken: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  getProfile: (): Promise<ProfileResponse> => {
    return apiFetch<ProfileResponse>("/api/users/profile");
  },

  getAdminDashboard: (): Promise<AdminResponse> => {
    return apiFetch<AdminResponse>("/api/admin/dashboard");
  },
};

// ── Address Endpoints ──────────────────────────────────────────────────────
export const addressApi = {
  getAll: (): Promise<AddressListResponse> => {
    return apiFetch<AddressListResponse>("/api/users/addresses");
  },

  getById: (id: string): Promise<AddressSingleResponse> => {
    return apiFetch<AddressSingleResponse>(`/api/users/addresses/${id}`);
  },

  create: (data: AddressCreateInput): Promise<AddressSingleResponse> => {
    return apiFetch<AddressSingleResponse>("/api/users/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: AddressUpdateInput): Promise<AddressSingleResponse> => {
    return apiFetch<AddressSingleResponse>(`/api/users/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/users/addresses/${id}`, {
      method: "DELETE",
    });
  },
};
