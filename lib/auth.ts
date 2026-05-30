const TOKEN_KEY = "dira_auth_token";
const USER_KEY = "dira_auth_user";

export interface User {
  id: string;
  name: string;
  role: "farmer" | "agent" | "admin";
  language: "en" | "sw";
  isNewUser: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

interface CustomWindow extends Window {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
}

/**
 * Perform authentication using Telegram's initData.
 * Sends data to backend and stores response in sessionStorage.
 */
export async function authenticateWithTelegram(): Promise<AuthResponse> {
  if (typeof window === "undefined") {
    throw new Error("Cannot authenticate on the server side.");
  }

  const customWindow = window as unknown as CustomWindow;
  const tgWebApp = customWindow.Telegram?.WebApp;
  const initData = tgWebApp?.initData;

  if (!initData) {
    throw new Error("No Telegram WebApp initData found.");
  }

  const response = await fetch(`${API_URL}/api/auth/telegram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    let errorMsg = "Authentication failed.";
    try {
      const errData = await response.json();
      errorMsg = errData.error?.message || errorMsg;
    } catch {
      // Ignore parsing errors
    }
    throw new Error(errorMsg);
  }

  const authData: AuthResponse = await response.json();

  sessionStorage.setItem(TOKEN_KEY, authData.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(authData.user));

  return authData;
}

/**
 * Returns Authorization header object containing the stored JWT.
 */
export function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Retrieves the stored JWT token.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieves the stored user details.
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = sessionStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Removes auth credentials from sessionStorage.
 */
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

/**
 * Checks if a valid JWT exists in sessionStorage.
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return decodedPayload.exp > now;
  } catch {
    return false;
  }
}

