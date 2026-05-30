import { getAuthHeader, clearAuth } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  
  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      url.searchParams.append(key, val);
    });
  }

  const headers = new Headers(options.headers);
  
  const authHeader = getAuthHeader();
  Object.entries(authHeader).forEach(([key, val]) => {
    headers.set(key, val);
  });

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url.toString(), config);
    
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/?error=unauthorized";
      }
      throw new ApiError(
        "Session expired. Please re-authenticate inside Telegram. / Kipindi kimekwisha. Tafadhali ingia tena kupitia Telegram.",
        401
      );
    }

    if (!response.ok) {
      let errorMsg = "An error occurred while communicating with the server. / Hitilafu imetokea wakati wa mawasiliano na seva.";
      let errData: unknown;
      try {
        errData = await response.json();
        if (errData && typeof errData === "object" && "error" in errData) {
          const errObj = errData as { error?: { message?: string } };
          errorMsg = errObj.error?.message || errorMsg;
        }
      } catch {
        // Ignore parsing errors
      }
      throw new ApiError(errorMsg, response.status, errData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Network connection failure. Please check your internet connection. / Hitilafu ya muunganisho wa mtandao. Tafadhali kagua mtandao wako.",
      0,
      error
    );
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
