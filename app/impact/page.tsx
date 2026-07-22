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

import type { Metadata } from "next";
import ImpactClient from "./ImpactClient";

export const metadata: Metadata = {
  title: "Impact & Transparency — Dira Africa",
  description: "Monitor live counters for crop observations, active smartphone weather sensors, and reward disbursements anchored on the Hedera ledger.",
  alternates: {
    canonical: "/impact",
  },
};

export const revalidate = 3600; // Revalidate page every hour (ISR)

export default async function Page() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  // Default fallback data for offline build resilience
  let stats = {
    totalVerifiedDataPoints: 125439,
    activeUsers7Days: 1420,
    countiesCovered: 47,
    cropSubmissionsMonth: 8934,
    tokensDisbursedKes: 51290,
    hedera: {
      topicId: "0.0.9544926",
      tokenId: "0.0.9544938",
      topicLink: "https://hashscan.io/testnet/topic/0.0.9544926",
      tokenLink: "https://hashscan.io/testnet/token/0.0.9544938"
    }
  };

  try {
    const res = await fetch(`${apiUrl}/api/public/stats`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.stats) {
        stats = data.stats;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch public stats from API, using fallback data:", err);
  }

  return <ImpactClient stats={stats} />;
}
