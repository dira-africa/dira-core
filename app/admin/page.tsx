/*
 * Copyright 2026 Blockchain & Climate Institute
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

"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

// 2 hours in milliseconds = 7,200,000 ms
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

interface UserRecord {
  id: string;
  full_name: string;
  role: "farmer" | "agent" | "admin";
  county: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface CropSubmission {
  id: string;
  crop_type: string;
  verification_status: "pending" | "verified" | "rejected" | "failed";
  submitted_at: string;
  full_name: string | null;
}

interface Redemption {
  id: string;
  redemption_type: "airtime" | "voucher" | "circle" | "mpesa";
  amount_kes: number;
  status: "pending" | "processing" | "completed" | "failed";
  initiated_at: string;
  full_name: string | null;
}

interface Distribution {
  id: string;
  county_id: string;
  coordinator_name: string;
  period_month: string;
  total_users: number;
  total_tokens: number;
  total_kes_disbursed: string;
  status: "pending" | "completed";
  transfer_reference: string | null;
}

interface Anchor {
  week_number: number;
  batch_hash: string;
  midnight_tx_hash: string;
  anchored_at: string;
}

interface Certificate {
  id: string;
  cert_id: string;
  county_code: string;
  condition_type: string;
  confidence_threshold: string;
  midnight_tx_hash: string;
  created_at: string;
}

interface QueueStat {
  queueName: string;
  sizes: {
    active: number;
    waiting: number;
    delayed: number;
    completed: number;
    failed: number;
    total: number;
  };
  processingRate: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"users" | "data-review" | "payments" | "circle" | "reports" | "jobs">("users");

  // Telemetry data states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [submissions, setSubmissions] = useState<CropSubmission[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [queues, setQueues] = useState<QueueStat[]>([]);

  // Action states
  const [refKey, setRefKey] = useState<{ [key: string]: string }>({});
  const [certForm, setCertForm] = useState({
    countyCode: "",
    periodStart: "",
    periodEnd: "",
    conditionType: "High Quality Ingestion",
    confidenceThreshold: "0.95"
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Logout utility
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("dira_admin_token");
    setToken(null);
    setEmail("");
    setPassword("");
    setLoginError("");
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  // Inactivity tracking: resets timeout on user interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      alert("Logged out due to 2 hours of inactivity.");
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  // Request wrapper with token & automatic 403 logout interceptor
  const authenticatedFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!token) return null;
    const url = `${API_URL}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 403 || res.status === 401) {
        handleLogout();
        return null;
      }
      return res;
    } catch (e) {
      console.error("Fetch failure:", e);
      return null;
    }
  }, [token, handleLogout]);

  // Set up inactivity event listeners once token is active
  useEffect(() => {
    if (!token) return;

    resetInactivityTimer();

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((name) => {
      window.addEventListener(name, resetInactivityTimer);
    });

    return () => {
      events.forEach((name) => {
        window.removeEventListener(name, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [token, resetInactivityTimer]);

  // Check sessionStorage for active token on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("dira_admin_token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  // Load data depending on active tab
  const loadTabData = useCallback(async () => {
    if (!token) return;

    try {
      if (activeTab === "users") {
        const res = await authenticatedFetch("/api/admin/users");
        if (res) {
          const json = await res.json();
          if (json.success) setUsers(json.users);
        }
      } else if (activeTab === "data-review") {
        const res = await authenticatedFetch("/api/admin/submissions");
        if (res) {
          const json = await res.json();
          if (json.success) setSubmissions(json.submissions);
        }
      } else if (activeTab === "payments") {
        const res = await authenticatedFetch("/api/admin/redemptions");
        if (res) {
          const json = await res.json();
          if (json.success) setRedemptions(json.redemptions);
        }
      } else if (activeTab === "circle") {
        const res = await authenticatedFetch("/api/admin/circle/distributions");
        if (res) {
          const json = await res.json();
          if (json.success) setDistributions(json.distributions);
        }
      } else if (activeTab === "reports") {
        const res = await authenticatedFetch("/api/admin/midnight/status");
        if (res) {
          const json = await res.json();
          if (json.success) {
            setAnchors(json.anchors);
            setCertificates(json.certificates);
          }
        }
      } else if (activeTab === "jobs") {
        const res = await authenticatedFetch("/api/admin/jobs");
        if (res) {
          const json = await res.json();
          if (json.success) setQueues(json.queues);
        }
      }
    } catch (e) {
      console.error("Tab data loading failed:", e);
    }
  }, [token, activeTab, authenticatedFetch]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Login action handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Login failed.");
      }

      sessionStorage.setItem("dira_admin_token", data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials or rate limit reached.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Confirm Dira Circle County Payout distribution
  const handleConfirmDistribution = async (distId: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    const transferReference = refKey[distId]?.trim();
    if (!transferReference) {
      setActionErrorMsg("Please enter the Bank / M-Pesa transfer reference code.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/circle/distributions/${distId}/confirm`, {
        method: "PATCH",
        body: JSON.stringify({ transferReference })
      });

      if (res) {
        const data = await res.json();
        if (res.ok) {
          setActionSuccessMsg(data.message || "Distribution paid successfully.");
          loadTabData(); // Refresh list
        } else {
          setActionErrorMsg(data.error?.message || "Failed to confirm distribution.");
        }
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error completing distribution transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Midnight blockchain weekly anchoring
  const handleAnchorWeeks = async () => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);

    try {
      const res = await authenticatedFetch("/api/admin/midnight/anchor", { method: "POST" });
      if (res) {
        const data = await res.json();
        if (res.ok) {
          setActionSuccessMsg(`Success! Anchored weeks. Count: ${data.anchoredWeeksCount || 0}`);
          loadTabData();
        } else {
          setActionErrorMsg(data.error?.message || "Anchoring trigger failed.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Error launching anchor job.");
    } finally {
      setActionLoading(false);
    }
  };

  // Issue custom Midnight county certificate
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);

    try {
      const res = await authenticatedFetch("/api/admin/midnight/certificate", {
        method: "POST",
        body: JSON.stringify({
          countyCode: certForm.countyCode.trim().toUpperCase(),
          periodStart: certForm.periodStart,
          periodEnd: certForm.periodEnd,
          conditionType: certForm.conditionType,
          confidenceThreshold: parseFloat(certForm.confidenceThreshold)
        })
      });

      if (res) {
        const data = await res.json();
        if (res.ok) {
          setActionSuccessMsg(`Certificate generated successfully! Cert ID: ${data.certId}`);
          setCertForm({
            countyCode: "",
            periodStart: "",
            periodEnd: "",
            conditionType: "High Quality Ingestion",
            confidenceThreshold: "0.95"
          });
          loadTabData();
        } else {
          setActionErrorMsg(data.error?.message || "Failed to generate certificate.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Error executing certificate Smart Contract transaction.");
    } finally {
      setActionLoading(false);
    }
  };

  // RENDER: LOGIN FORM
  if (!token) {
    return (
      <main className="flex-1 w-full min-h-screen bg-gradient-to-b from-[#0a0a23] via-[#051c1c] to-[#04120f] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto shadow-lg">
              <span className="font-extrabold text-2xl text-primary">D</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              Dira Hardened Admin Panel
            </h1>
            <p className="text-xs text-white/50">
              Administrative access control portal. Logins are rate-limited and logged.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-3.5 rounded-2xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dira.africa"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-white/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loginLoading ? "Verifying short-lived credentials..." : "Login to Admin Interface"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // RENDER: ADMIN DASHBOARD
  return (
    <main className="flex-1 w-full min-h-screen bg-gradient-to-b from-[#070716] via-[#051412] to-[#030907] text-white font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header bar */}
        <header className="flex flex-col md:flex-row justify-between md:items-center border-b border-white/10 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center font-black text-white shadow shadow-primary/20">
                A
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
                Dira Central Administration
              </h1>
            </div>
            <p className="text-xs text-white/40 font-mono">Secure administrative panel • 2h session timeout</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all self-start md:self-auto"
          >
            Logout Securely
          </button>
        </header>

        {/* Action feedback flags */}
        {(actionSuccessMsg || actionErrorMsg) && (
          <div className="space-y-2">
            {actionSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold p-4 rounded-2xl">
                {actionSuccessMsg}
              </div>
            )}
            {actionErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-4 rounded-2xl">
                {actionErrorMsg}
              </div>
            )}
          </div>
        )}

        {/* Premium Tab Navigation */}
        <nav className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
          {[
            { id: "users", label: "Users" },
            { id: "data-review", label: "Data Review" },
            { id: "payments", label: "Payments" },
            { id: "circle", label: "Circular Economy" },
            { id: "reports", label: "Reports" },
            { id: "jobs", label: "Jobs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setActionSuccessMsg("");
                setActionErrorMsg("");
              }}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                activeTab === tab.id
                  ? "bg-primary border-primary text-white shadow-lg"
                  : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content sections */}
        <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl min-h-[400px]">
          
          {/* TAB 1: USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h2 className="text-md font-bold text-white/90">Registered Dira Network Nodes (Farmers / Agents)</h2>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                      <th className="p-4 font-semibold">User UUID</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">County</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-white/30">No user profiles fetched.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 text-white/40 break-all">{u.id}</td>
                          <td className="p-4 font-bold text-white/95">{u.full_name}</td>
                          <td className="p-4 uppercase text-[10px]">
                            <span className={`px-2 py-0.5 rounded font-black ${
                              u.role === "farmer" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                            }`}>{u.role}</span>
                          </td>
                          <td className="p-4">{u.county || "Global"}</td>
                          <td className="p-4 text-[10px] font-bold">
                            <span className={u.is_active ? "text-emerald-400" : "text-white/40"}>
                              {u.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td className="p-4 text-white/40">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DATA REVIEW */}
          {activeTab === "data-review" && (
            <div className="space-y-4">
              <h2 className="text-md font-bold text-white/90">Recent Agricultural Crop Submissions</h2>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                      <th className="p-4 font-semibold">Submission ID</th>
                      <th className="p-4 font-semibold">Farmer Name</th>
                      <th className="p-4 font-semibold">Crop Type</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-white/30">No crop submissions found.</td>
                      </tr>
                    ) : (
                      submissions.map((cs) => (
                        <tr key={cs.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 text-white/40">{cs.id}</td>
                          <td className="p-4 font-semibold text-white/95">{cs.full_name || "Unknown"}</td>
                          <td className="p-4">{cs.crop_type}</td>
                          <td className="p-4 text-white/40">{new Date(cs.submitted_at).toLocaleString()}</td>
                          <td className="p-4 font-bold text-[10px]">
                            <span className={`px-2 py-0.5 rounded ${
                              cs.verification_status === "verified"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : cs.verification_status === "pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                              {cs.verification_status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <h2 className="text-md font-bold text-white/90">Climate Tokens Redemptions Audits</h2>
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                      <th className="p-4 font-semibold">Redemption ID</th>
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Amount (KES)</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {redemptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-white/30">No redemption transactions recorded.</td>
                      </tr>
                    ) : (
                      redemptions.map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 text-white/40">{r.id}</td>
                          <td className="p-4 font-semibold text-white/95">{r.full_name || "Unknown"}</td>
                          <td className="p-4 uppercase text-[10px]">{r.redemption_type}</td>
                          <td className="p-4 font-extrabold text-primary">KES {parseFloat(r.amount_kes as any).toFixed(2)}</td>
                          <td className="p-4 text-white/40">{new Date(r.initiated_at).toLocaleString()}</td>
                          <td className="p-4 font-bold text-[10px]">
                            <span className={`px-2 py-0.5 rounded ${
                              r.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : r.status === "processing" || r.status === "pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CIRCULAR ECONOMY (Dira Circle Distributions) */}
          {activeTab === "circle" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-white/90">Dira Circle County Pool Distributions</h2>
                <p className="text-xs text-white/50">Review monthly community aggregated payouts and issue bank transfers to county coordinators.</p>
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                      <th className="p-4 font-semibold">Distribution ID</th>
                      <th className="p-4 font-semibold">County</th>
                      <th className="p-4 font-semibold">Coordinator</th>
                      <th className="p-4 font-semibold">Period</th>
                      <th className="p-4 font-semibold">Aggregated Payout</th>
                      <th className="p-4 font-semibold">Receipt / Reference</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {distributions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-white/30">No monthly Dira Circle distributions found.</td>
                      </tr>
                    ) : (
                      distributions.map((d) => (
                        <tr key={d.id} className="hover:bg-white/[0.01]">
                          <td className="p-4 text-white/40">{d.id}</td>
                          <td className="p-4 font-semibold text-white/95">{d.county_id}</td>
                          <td className="p-4 text-white/70">{d.coordinator_name}</td>
                          <td className="p-4 text-white/40">{new Date(d.period_month).toLocaleDateString(undefined, {month: "short", year: "numeric"})}</td>
                          <td className="p-4 font-bold text-emerald-400">KES {parseFloat(d.total_kes_disbursed).toFixed(2)}</td>
                          <td className="p-4 text-white/60">{d.transfer_reference || "—"}</td>
                          <td className="p-4 font-bold text-[10px]">
                            <span className={`px-2 py-0.5 rounded ${
                              d.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {d.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            {d.status === "pending" ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="Tx Ref Code (e.g. B2345X...)"
                                  value={refKey[d.id] || ""}
                                  onChange={(e) => setRefKey({ ...refKey, [d.id]: e.target.value })}
                                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                                />
                                <button
                                  onClick={() => handleConfirmDistribution(d.id)}
                                  disabled={actionLoading}
                                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-[10px] disabled:opacity-50"
                                >
                                  Mark Paid
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-white/30 font-bold uppercase">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS & BLOCKCHAIN ANCHORS */}
          {activeTab === "reports" && (
            <div className="space-y-8">
              {/* Trigger panel */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Midnight Blockchain Weekly Merkle Anchoring</h3>
                  <p className="text-xs text-white/50">Triggers automated background anchoring of verified crop and weather data batches for ended weeks.</p>
                </div>
                <button
                  onClick={handleAnchorWeeks}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow shadow-primary/20 disabled:opacity-50 self-start md:self-auto"
                >
                  Trigger Weekly Anchors
                </button>
              </div>

              {/* Certificate formulation form */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Issue Midnight ZK Data Compliance Certificate</h3>
                  <p className="text-xs text-white/50">Submit a county climate quality certificate contract transaction permanently on-chain.</p>
                </div>
                <form onSubmit={handleIssueCertificate} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">County Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NBI, MSA, NKU"
                      value={certForm.countyCode}
                      onChange={(e) => setCertForm({ ...certForm, countyCode: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Period Start</label>
                    <input
                      type="date"
                      required
                      value={certForm.periodStart}
                      onChange={(e) => setCertForm({ ...certForm, periodStart: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Period End</label>
                    <input
                      type="date"
                      required
                      value={certForm.periodEnd}
                      onChange={(e) => setCertForm({ ...certForm, periodEnd: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Conditions Type</label>
                    <select
                      value={certForm.conditionType}
                      onChange={(e) => setCertForm({ ...certForm, conditionType: e.target.value })}
                      className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    >
                      <option value="High Quality Ingestion">High Quality Ingestion</option>
                      <option value="Crop Photo Validation Rate">Crop Photo Validation Rate</option>
                      <option value="Low Barometric Anomaly Standard">Low Barometric Anomaly Standard</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs disabled:opacity-50"
                  >
                    Issue ZK Cert
                  </button>
                </form>
              </div>

              {/* Anchors and certificates summaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Midnight Anchors */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white/90">Latest Midnight Anchors</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl max-h-[220px] overflow-y-auto">
                    <table className="w-full text-[10px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">Week</th>
                          <th className="p-3">Merkle Root</th>
                          <th className="p-3">Transaction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {anchors.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-white/30">No anchors found.</td>
                          </tr>
                        ) : (
                          anchors.map((an) => (
                            <tr key={an.week_number} className="hover:bg-white/[0.01]">
                              <td className="p-3 font-semibold text-white">{an.week_number}</td>
                              <td className="p-3 truncate max-w-[120px]" title={an.batch_hash}>{an.batch_hash}</td>
                              <td className="p-3 truncate max-w-[120px]" title={an.midnight_tx_hash}>{an.midnight_tx_hash}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Midnight Certificates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white/90">Issued Data Certificates</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl max-h-[220px] overflow-y-auto">
                    <table className="w-full text-[10px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">Cert ID</th>
                          <th className="p-3">County</th>
                          <th className="p-3">Condition</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {certificates.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-white/30">No certificates issued.</td>
                          </tr>
                        ) : (
                          certificates.map((c) => (
                            <tr key={c.id} className="hover:bg-white/[0.01]">
                              <td className="p-3 font-semibold text-white break-all" title={c.cert_id}>{c.cert_id.substring(0, 8)}...</td>
                              <td className="p-3 font-bold text-primary">{c.county_code}</td>
                              <td className="p-3">{c.condition_type}</td>
                              <td className="p-3 text-white/40">{new Date(c.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: JOBS (BullMQ Diagnostics) */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <h2 className="text-md font-bold text-white/90">BullMQ Active Background Queue Workers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {queues.length === 0 ? (
                  <div className="col-span-full text-center text-white/30 p-8">No queue diagnostics loaded.</div>
                ) : (
                  queues.map((q) => (
                    <div
                      key={q.queueName}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/15 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-black capitalize text-white">{q.queueName} Queue</h3>
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {q.processingRate}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/50">Active:</span>
                          <span className="font-bold text-white">{q.sizes.active}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/50">Waiting:</span>
                          <span className="font-bold text-white">{q.sizes.waiting}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/50">Delayed:</span>
                          <span className="font-bold text-amber-400">{q.sizes.delayed}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/50">Completed:</span>
                          <span className="font-bold text-emerald-400">{q.sizes.completed}</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/50">Failed:</span>
                          <span className={`font-bold ${q.sizes.failed > 0 ? "text-red-400" : "text-white/30"}`}>
                            {q.sizes.failed}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-mono border-t border-white/5 pt-2">
                          <span className="text-white/60 font-semibold">Total:</span>
                          <span className="font-bold text-white">{q.sizes.total}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
