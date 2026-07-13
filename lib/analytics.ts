/*
 * Copyright 2026 Dira Africa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

export interface AnalyticsEvent {
  event: string;
  path: string;
  referrer?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Sends a privacy-safe analytics event to the dira-api backend.
 * Fails gracefully and silently in case of network errors.
 */
export async function trackEvent(
  event: string,
  metadata?: Record<string, any>
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const payload: AnalyticsEvent = {
      event,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Fire and forget, don't block user interactions
    fetch(`${API_URL}/api/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // Catch network-level errors gracefully
      console.warn("[Analytics] Silently ignored send failure:", err.message);
    });
  } catch (err) {
    // Catch any serialization or window access error
    console.warn("[Analytics] Tracking failed silently:", err);
  }
}

/**
 * Tracks a page view event.
 */
export function trackPageView(): void {
  trackEvent("page_view");
}
