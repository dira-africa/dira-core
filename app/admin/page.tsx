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
import { Chart, registerables } from "chart.js";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

// 2 hours in milliseconds = 7,200,000 ms
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

if (typeof window !== "undefined") {
  Chart.register(...registerables);
}

// ----------------------------------------------------
// DYNAMIC LEAFLET MAP COMPONENT
// ----------------------------------------------------
const MapComponent = ({ lat, lng }: { lat: number; lng: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (typeof window === "undefined" || !el) return;

    const initMap = async () => {
      const L = await import("leaflet");

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (mapRef.current) {
        mapRef.current.remove();
      }

      const map = L.map(el).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      L.marker([lat, lng]).addTo(map);
      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="h-48 w-full rounded-2xl border border-white/10 shadow-inner overflow-hidden" />;
};

// ----------------------------------------------------
// CHARTJS MONTHLY VELOCITY CHART
// ----------------------------------------------------
const VelocityChart = ({ data }: { data: { month: string; credited: number; debited: number }[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: "Tokens Credited (+)",
            data: data.map(d => d.credited),
            backgroundColor: "rgba(16, 185, 129, 0.6)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: "Tokens Debited (-)",
            data: data.map(d => d.debited),
            backgroundColor: "rgba(239, 68, 68, 0.6)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#e5e7eb",
              font: { family: "monospace", size: 10 }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#9ca3af", font: { family: "monospace", size: 9 } }
          },
          y: {
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#9ca3af", font: { family: "monospace", size: 9 } }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="h-64 w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4">
      <canvas ref={canvasRef} />
    </div>
  );
};

// ----------------------------------------------------
// TYPES
// ----------------------------------------------------
interface UserRecord {
  id: string;
  full_name: string;
  telegram_username: string | null;
  telegram_id: number | null;
  role: "farmer" | "agent" | "admin";
  county: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_seen_at: string | null;
  token_balance?: number;
  submission_count?: number;
  sync_count?: number;
  email: string | null;
  suspension_reason: string | null;
  suspended_at: string | null;
  phone_number?: string | null;
  language?: string | null;
}

interface CropSubmission {
  id: string;
  user_id: string;
  crop_type: string;
  growth_stage: string;
  verification_status: "pending" | "verified" | "rejected" | "escalated" | "failed" | "manual_review";
  submitted_at: string;
  photo_url: string;
  photo_thumbnail_url: string;
  ai_health_score: number;
  ai_confidence: number;
  ai_detected_issues: any;
  rejection_reason: string | null;
  admin_notes: string | null;
  full_name: string | null;
  latitude?: number;
  longitude?: number;
}

interface WeatherReading {
  id: string;
  user_id: string;
  pressure_hpa: number;
  altitude_m: number;
  temperature_c: number;
  humidity_pct: number;
  anomaly_score: number;
  verified: boolean;
  network_consensus: number;
  recorded_at: string;
  admin_notes: string | null;
  verification_status: "pending" | "verified" | "rejected" | "escalated" | "manual_review";
  full_name: string | null;
  latitude?: number;
  longitude?: number;
}

interface Redemption {
  id: string;
  tokens_spent: number;
  redemption_type: "airtime" | "voucher" | "circle" | "mpesa";
  amount_kes: number;
  status: "pending" | "processing" | "completed" | "failed";
  initiated_at: string;
  mpesa_receipt: string | null;
  full_name: string | null;
  phone: string | null;
  failure_reason?: string;
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

  // Action feedback flags
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Inactivity timeout reference
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------
  // MODULE 1: USER MANAGEMENT STATE
  // ----------------------------------------------------
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRole, setUsersRole] = useState("all");
  const [usersCounty, setUsersCounty] = useState("all");
  const [usersActive, setUsersActive] = useState("all");
  const [usersStartDate, setUsersStartDate] = useState("");
  const [usersEndDate, setUsersEndDate] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersTotal, setUsersTotal] = useState(0);

  // Selected User detailed profile & history
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState<{
    ledger: any[];
    submissions: any[];
    redemptions: any[];
    audit: any[];
  } | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalTab, setUserModalTab] = useState<"details" | "ledger" | "submissions" | "redemptions" | "audit">("details");
  const [suspendReason, setSuspendReason] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");

  // ----------------------------------------------------
  // MODULE 2: DATA REVIEW QUEUE STATE
  // ----------------------------------------------------
  const [reviewCrops, setReviewCrops] = useState<CropSubmission[]>([]);
  const [reviewAtmospherics, setReviewAtmospherics] = useState<WeatherReading[]>([]);
  const [cropReviewAction, setCropReviewAction] = useState<{ id: string; action: "approve" | "reject" | "escalate"; crop_type: string } | null>(null);
  const [weatherReviewAction, setWeatherReviewAction] = useState<{ id: string; action: "approve" | "reject" | "escalate"; reading_time: string } | null>(null);
  const [reviewReasonOrNotes, setReviewReasonOrNotes] = useState("");

  // ----------------------------------------------------
  // MODULE 3: FINANCIAL DASHBOARD STATE
  // ----------------------------------------------------
  const [finCirculation, setFinCirculation] = useState<number>(0);
  const [finRedeemed, setFinRedeemed] = useState<any[]>([]);
  const [finPending, setFinPending] = useState({ count: 0, kes: 0 });
  const [finFailed, setFinFailed] = useState<Redemption[]>([]);
  const [finVelocity, setFinVelocity] = useState<any[]>([]);
  const [finRedemptions, setFinRedemptions] = useState<Redemption[]>([]);
  const [finStatusFilter, setFinStatusFilter] = useState("all");
  const [finPage, setFinPage] = useState(1);
  const [finLimit, setFinLimit] = useState(10);
  const [finTotal, setFinTotal] = useState(0);

  // ----------------------------------------------------
  // MODULE 4: PARTNER REPORTS STATE
  // ----------------------------------------------------
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportFormat, setReportFormat] = useState<"json" | "csv">("csv");
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // ----------------------------------------------------
  // MODULE 5 & 6: CIRCULAR ECONOMY & JOBS STATE
  // ----------------------------------------------------
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [queues, setQueues] = useState<QueueStat[]>([]);

  // Midnight cert form state
  const [certForm, setCertForm] = useState({
    countyCode: "",
    periodStart: "",
    periodEnd: "",
    conditionType: "High Quality Ingestion",
    confidenceThreshold: "0.95"
  });

  const [refKey, setRefKey] = useState<{ [key: string]: string }>({});

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

  // Inactivity tracking
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      alert("Session expired due to 2 hours of inactivity. Please log in again.");
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  // Request fetch helper with token
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
        const params = new URLSearchParams({
          page: String(usersPage),
          limit: String(usersLimit),
          ...(usersSearch && { search: usersSearch }),
          ...(usersRole && usersRole !== "all" && { role: usersRole }),
          ...(usersCounty && usersCounty !== "all" && { county: usersCounty }),
          ...(usersActive && usersActive !== "all" && { active: usersActive }),
          ...(usersStartDate && { startDate: usersStartDate }),
          ...(usersEndDate && { endDate: usersEndDate }),
        });
        const res = await authenticatedFetch(`/api/admin/users?${params.toString()}`);
        if (res) {
          const json = await res.json();
          if (json.success) {
            setUsers(json.users || []);
            setUsersTotal(json.total || 0);
          }
        }
      } else if (activeTab === "data-review") {
        const res = await authenticatedFetch("/api/admin/review-queue");
        if (res) {
          const json = await res.json();
          if (json.success) {
            setReviewCrops(json.cropSubmissions || []);
            setReviewAtmospherics(json.atmosphericReadings || []);
          }
        }
      } else if (activeTab === "payments") {
        const params = new URLSearchParams({
          page: String(finPage),
          limit: String(finLimit),
          ...(finStatusFilter && finStatusFilter !== "all" && { status: finStatusFilter })
        });
        const res = await authenticatedFetch(`/api/admin/financials?${params.toString()}`);
        if (res) {
          const json = await res.json();
          if (json.success) {
            setFinCirculation(json.circulation || 0);
            setFinRedeemed(json.redeemed || []);
            setFinPending(json.pending || { count: 0, kes: 0 });
            setFinFailed(json.failed || []);
            setFinVelocity(json.velocity || []);
            setFinRedemptions(json.redemptions || []);
            setFinTotal(json.totalCount || 0);
          }
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
            setAnchors(json.anchors || []);
            setCertificates(json.certificates || []);
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
  }, [token, activeTab, authenticatedFetch, usersPage, usersLimit, usersSearch, usersRole, usersCounty, usersActive, usersStartDate, usersEndDate, finPage, finLimit, finStatusFilter]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Login handler
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

  // ----------------------------------------------------
  // MODULE 1: USER DETAILS FETCH & USER ACTIONS
  // ----------------------------------------------------
  const fetchUserDetails = async (userId: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`);
      if (res) {
        const json = await res.json();
        if (json.success) {
          setSelectedUser(json.user);
          setSelectedUserHistory(json.history);
          setIsUserModalOpen(true);
          setUserModalTab("details");
        } else {
          setActionErrorMsg(json.error?.message || "Failed to load user details.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to fetch user details.");
    }
  };

  const handleUserVerify = async (userId: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "verify" })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "User verified successfully.");
          await fetchUserDetails(userId);
          await loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to verify user.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to verify user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserSuspend = async (userId: string, suspend: boolean) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    if (suspend && (!suspendReason || suspendReason.trim().length === 0)) {
      setActionErrorMsg("Suspension reason is mandatory and cannot be empty.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: suspend ? "suspend" : "unsuspend",
          reason: suspend ? suspendReason.trim() : undefined
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Action executed successfully.");
          setSuspendReason("");
          await fetchUserDetails(userId);
          await loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Action failed.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAdjustBalance = async (userId: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt === 0) {
      setActionErrorMsg("Adjustment amount must be a non-zero number.");
      return;
    }
    if (!adjustNotes || adjustNotes.trim().length === 0) {
      setActionErrorMsg("Adjustment notes/reason must be provided.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "adjust_balance",
          amount: amt,
          notes: adjustNotes.trim()
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Balance adjusted successfully.");
          setAdjustAmount("");
          setAdjustNotes("");
          await fetchUserDetails(userId);
          await loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Balance adjustment failed.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Balance adjustment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportUsersCSV = async () => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);
    try {
      const params = new URLSearchParams({
        ...(usersSearch && { search: usersSearch }),
        ...(usersRole && usersRole !== "all" && { role: usersRole }),
        ...(usersCounty && usersCounty !== "all" && { county: usersCounty }),
        ...(usersActive && usersActive !== "all" && { active: usersActive }),
        ...(usersStartDate && { startDate: usersStartDate }),
        ...(usersEndDate && { endDate: usersEndDate }),
      });
      const res = await authenticatedFetch(`/api/admin/users/export?${params.toString()}`);
      if (res) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setActionSuccessMsg("Users CSV export downloaded successfully.");
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to export users.");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // MODULE 2: DATA REVIEW ACTIONS
  // ----------------------------------------------------
  const handleCropReview = async () => {
    if (!cropReviewAction) return;
    setActionSuccessMsg("");
    setActionErrorMsg("");

    const { id, action } = cropReviewAction;
    if (action === "reject" && (!reviewReasonOrNotes || reviewReasonOrNotes.trim().length === 0)) {
      setActionErrorMsg("Rejection reason is required.");
      return;
    }
    if (action === "escalate" && (!reviewReasonOrNotes || reviewReasonOrNotes.trim().length === 0)) {
      setActionErrorMsg("Escalation notes are required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/review-queue/crop/${id}`, {
        method: "POST",
        body: JSON.stringify({
          action,
          reason: action === "reject" ? reviewReasonOrNotes.trim() : undefined,
          notes: action === "escalate" ? reviewReasonOrNotes.trim() : undefined
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || `Crop submission successfully ${action}ed.`);
          setCropReviewAction(null);
          setReviewReasonOrNotes("");
          await loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to submit crop review.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to process review.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWeatherReview = async () => {
    if (!weatherReviewAction) return;
    setActionSuccessMsg("");
    setActionErrorMsg("");

    const { id, action } = weatherReviewAction;
    if (action === "reject" && (!reviewReasonOrNotes || reviewReasonOrNotes.trim().length === 0)) {
      setActionErrorMsg("Rejection reason is required.");
      return;
    }
    if (action === "escalate" && (!reviewReasonOrNotes || reviewReasonOrNotes.trim().length === 0)) {
      setActionErrorMsg("Escalation notes are required.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/review-queue/atmospheric/${id}`, {
        method: "POST",
        body: JSON.stringify({
          action,
          reason: action === "reject" ? reviewReasonOrNotes.trim() : undefined,
          notes: action === "escalate" ? reviewReasonOrNotes.trim() : undefined
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || `Weather reading successfully ${action}ed.`);
          setWeatherReviewAction(null);
          setReviewReasonOrNotes("");
          await loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to submit weather reading review.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to process review.");
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // MODULE 4: PARTNER REPORT GENERATION & DOWNLOAD
  // ----------------------------------------------------
  const handleDownloadPartnerReport = async () => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setReportLoading(true);
    try {
      const params = new URLSearchParams({
        ...(reportStartDate && { startDate: reportStartDate }),
        ...(reportEndDate && { endDate: reportEndDate }),
        format: reportFormat
      });
      const res = await authenticatedFetch(`/api/admin/reports/partner?${params.toString()}`);
      if (res) {
        if (reportFormat === "csv") {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `partner-report-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          setActionSuccessMsg("Partner CSV report downloaded successfully.");
        } else {
          const json = await res.json();
          if (json.success) {
            setGeneratedReport(json.report);
            setActionSuccessMsg("Partner JSON report loaded preview successfully.");
          } else {
            setActionErrorMsg(json.error?.message || "Failed to generate report.");
          }
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to download report.");
    } finally {
      setReportLoading(false);
    }
  };

  // ----------------------------------------------------
  // CIRCULAR ECONOMY DISTRIBUTIONS & BLOCKCHAIN
  // ----------------------------------------------------
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
          setActionSuccessMsg(data.message || "Distribution marked paid successfully.");
          loadTabData();
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

  const handleAnchorWeeks = async () => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);

    try {
      const res = await authenticatedFetch("/api/admin/midnight/anchor", { method: "POST" });
      if (res) {
        const data = await res.json();
        if (res.ok) {
          setActionSuccessMsg(`Success! Anchored completed weeks. Count: ${data.anchoredWeeksCount || 0}`);
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

  // ----------------------------------------------------
  // RENDER: LOGIN FORM
  // ----------------------------------------------------
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
              {loginLoading ? "Verifying credentials..." : "Login to Admin Interface"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // RENDER: DASHBOARD LAYOUT
  // ----------------------------------------------------
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

        {/* Action notifications */}
        {(actionSuccessMsg || actionErrorMsg) && (
          <div className="space-y-2">
            {actionSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold p-4 rounded-2xl flex justify-between items-center">
                <span>{actionSuccessMsg}</span>
                <button onClick={() => setActionSuccessMsg("")} className="text-white/40 hover:text-white">&times;</button>
              </div>
            )}
            {actionErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-4 rounded-2xl flex justify-between items-center">
                <span>{actionErrorMsg}</span>
                <button onClick={() => setActionErrorMsg("")} className="text-white/40 hover:text-white">&times;</button>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
          {[
            { id: "users", label: "Users" },
            { id: "data-review", label: "Data Review Queue" },
            { id: "payments", label: "Financial Dashboard" },
            { id: "circle", label: "County Payouts" },
            { id: "reports", label: "Midnight & Partner Reports" },
            { id: "jobs", label: "Background Workers" }
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
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/10"
                  : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Active tab viewport */}
        <section className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-xl min-h-[400px]">

          {/* --------------------------------------------------
              TAB 1: USERS MODULE
              -------------------------------------------------- */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-md font-bold text-white/90">Dira Network Registered Nodes</h2>
                <button
                  onClick={handleExportUsersCSV}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                >
                  Export Current List to CSV
                </button>
              </div>

              {/* Advanced search/filters section */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Search</label>
                  <input
                    type="text"
                    value={usersSearch}
                    onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                    placeholder="Search name, username, email..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Role</label>
                  <select
                    value={usersRole}
                    onChange={(e) => { setUsersRole(e.target.value); setUsersPage(1); }}
                    className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="farmer">Farmer</option>
                    <option value="agent">Data Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">County</label>
                  <select
                    value={usersCounty}
                    onChange={(e) => { setUsersCounty(e.target.value); setUsersPage(1); }}
                    className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                  >
                    <option value="all">All Counties</option>
                    {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Kakamega", "Uasin Gishu", "Nyeri", "Kilifi", "Kwale", "Meru", "Machakos"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Status</label>
                  <select
                    value={usersActive}
                    onChange={(e) => { setUsersActive(e.target.value); setUsersPage(1); }}
                    className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Joined From</label>
                  <input
                    type="date"
                    value={usersStartDate}
                    onChange={(e) => { setUsersStartDate(e.target.value); setUsersPage(1); }}
                    className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40">Joined To</label>
                  <input
                    type="date"
                    value={usersEndDate}
                    onChange={(e) => { setUsersEndDate(e.target.value); setUsersPage(1); }}
                    className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                  />
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                <table className="w-full text-xs text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">County</th>
                      <th className="p-4 font-semibold">Balance</th>
                      <th className="p-4 font-semibold">Submissions</th>
                      <th className="p-4 font-semibold">Syncs</th>
                      <th className="p-4 font-semibold">Active</th>
                      <th className="p-4 font-semibold">Verified</th>
                      <th className="p-4 font-semibold">Registered</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-white/30">No user profiles matches current filters.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4 font-bold text-white/95">{u.full_name}</td>
                          <td className="p-4 uppercase text-[9px]">
                            <span className={`px-2 py-0.5 rounded font-black ${
                              u.role === "farmer" ? "bg-emerald-500/10 text-emerald-400" : u.role === "agent" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                            }`}>{u.role}</span>
                          </td>
                          <td className="p-4">{u.county || "—"}</td>
                          <td className="p-4 font-extrabold text-primary">{u.token_balance ?? 0}</td>
                          <td className="p-4">{u.submission_count ?? 0}</td>
                          <td className="p-4">{u.sync_count ?? 0}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black ${u.is_active ? "text-emerald-400" : "text-red-400 bg-red-400/5 px-2 py-0.5 rounded"}`}>
                              {u.is_active ? "ACTIVE" : "SUSPENDED"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={u.is_verified ? "text-emerald-400" : "text-white/40"}>
                              {u.is_verified ? "✓" : "—"}
                            </span>
                          </td>
                          <td className="p-4 text-white/40">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => fetchUserDetails(u.id)}
                              className="px-3 py-1 rounded bg-primary hover:bg-primary/90 text-white font-bold text-[10px] transition-all"
                            >
                              Manage Node
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex justify-between items-center text-xs text-white/50 pt-2 font-mono">
                <div>
                  Showing {Math.min(users.length, usersLimit)} of {usersTotal} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={usersPage <= 1}
                    onClick={() => setUsersPage(usersPage - 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-white">Page {usersPage} of {Math.ceil(usersTotal / usersLimit) || 1}</span>
                  <button
                    disabled={usersPage >= Math.ceil(usersTotal / usersLimit)}
                    onClick={() => setUsersPage(usersPage + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------
              TAB 2: DATA REVIEW QUEUE MODULE
              -------------------------------------------------- */}
          {activeTab === "data-review" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-md font-bold text-white/90">Climate Sensor Data Verification Queue</h2>
                <p className="text-xs text-white/50">Manual review pipeline for anomalous barometric readings and crop registrations flagging.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Crop review sub-section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-emerald-400 font-mono">Flagged Crop Photos ({reviewCrops.length})</h3>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {reviewCrops.length === 0 ? (
                      <div className="text-center text-white/30 border border-white/5 rounded-2xl p-8 bg-black/10 text-xs">
                        No crop photo submissions requiring review.
                      </div>
                    ) : (
                      reviewCrops.map((c) => (
                        <div key={c.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4 hover:border-white/20 transition-all">
                          <div className="flex gap-4">
                            <div className="h-24 w-24 relative rounded-xl overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                              <a href={c.photo_url} target="_blank" rel="noreferrer">
                                <img
                                  src={c.photo_thumbnail_url || c.photo_url}
                                  alt="Crop Thumbnail"
                                  className="object-cover h-full w-full hover:scale-105 transition-all"
                                />
                              </a>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-white text-xs truncate">{c.full_name || "Unknown Farmer"}</span>
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold font-mono">
                                  {c.verification_status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-white/70">Crop: <span className="text-white font-semibold">{c.crop_type}</span> ({c.growth_stage})</p>
                              <p className="text-[10px] text-white/40 font-mono">Submitted: {new Date(c.submitted_at).toLocaleString()}</p>
                              {c.ai_detected_issues && (
                                <div className="text-[9px] text-red-400 bg-red-400/5 px-2 py-1 rounded border border-red-500/10 font-mono mt-1">
                                  Flagged Issues: {JSON.stringify(c.ai_detected_issues)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2 text-center">
                              <p className="text-[9px] uppercase font-bold text-white/40">AI Health Score</p>
                              <p className="text-xs font-black text-white">{(c.ai_health_score * 100).toFixed(1)}%</p>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2 text-center">
                              <p className="text-[9px] uppercase font-bold text-white/40">AI Confidence</p>
                              <p className="text-xs font-black text-white">{(c.ai_confidence * 100).toFixed(1)}%</p>
                            </div>
                          </div>

                          {c.latitude && c.longitude && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-white/40 font-mono">Location: {c.latitude.toFixed(6)}, {c.longitude.toFixed(6)}</p>
                              <MapComponent lat={c.latitude} lng={c.longitude} />
                            </div>
                          )}

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setCropReviewAction({ id: c.id, action: "approve", crop_type: c.crop_type })}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setCropReviewAction({ id: c.id, action: "reject", crop_type: c.crop_type })}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setCropReviewAction({ id: c.id, action: "escalate", crop_type: c.crop_type })}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-all"
                            >
                              Escalate
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Weather reading review sub-section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-blue-400 font-mono">Anomalous Weather Syncs ({reviewAtmospherics.length})</h3>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {reviewAtmospherics.length === 0 ? (
                      <div className="text-center text-white/30 border border-white/5 rounded-2xl p-8 bg-black/10 text-xs">
                        No barometric readings requiring review.
                      </div>
                    ) : (
                      reviewAtmospherics.map((ar) => (
                        <div key={ar.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4 hover:border-white/20 transition-all">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-white text-xs">{ar.full_name || "Unknown Agent"}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black font-mono bg-red-500/10 text-red-400`}>
                                Anomaly Score: {ar.anomaly_score.toFixed(3)}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/45 font-mono">Sync Time: {new Date(ar.recorded_at).toLocaleString()}</p>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-1.5 text-center">
                              <p className="text-[8px] uppercase font-bold text-white/40">Pressure</p>
                              <p className="text-xs font-black text-white font-mono">{ar.pressure_hpa} hPa</p>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-1.5 text-center">
                              <p className="text-[8px] uppercase font-bold text-white/40">Temperature</p>
                              <p className="text-xs font-black text-white font-mono">{ar.temperature_c}°C</p>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-1.5 text-center">
                              <p className="text-[8px] uppercase font-bold text-white/40">Humidity</p>
                              <p className="text-xs font-black text-white font-mono">{ar.humidity_pct}%</p>
                            </div>
                            <div className="bg-white/[0.01] border border-white/5 rounded-lg p-1.5 text-center">
                              <p className="text-[8px] uppercase font-bold text-white/40">Altitude</p>
                              <p className="text-xs font-black text-white font-mono">{ar.altitude_m}m</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-white/50 bg-black/10 px-3 py-1.5 rounded-lg">
                            <span>Network Consensus Count:</span>
                            <span className="font-bold text-white">{ar.network_consensus} matching nodes</span>
                          </div>

                          {ar.latitude && ar.longitude && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-white/40 font-mono">Location: {ar.latitude.toFixed(6)}, {ar.longitude.toFixed(6)}</p>
                              <MapComponent lat={ar.latitude} lng={ar.longitude} />
                            </div>
                          )}

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => setWeatherReviewAction({ id: ar.id, action: "approve", reading_time: new Date(ar.recorded_at).toLocaleTimeString() })}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all"
                            >
                              Approve (Force Sync)
                            </button>
                            <button
                              onClick={() => setWeatherReviewAction({ id: ar.id, action: "reject", reading_time: new Date(ar.recorded_at).toLocaleTimeString() })}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setWeatherReviewAction({ id: ar.id, action: "escalate", reading_time: new Date(ar.recorded_at).toLocaleTimeString() })}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] transition-all"
                            >
                              Escalate
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --------------------------------------------------
              TAB 3: FINANCIAL DASHBOARD MODULE
              -------------------------------------------------- */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <h2 className="text-md font-bold text-white/90">Climate Tokens Financial Audit Dashboard</h2>

              {/* KPI metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/40">Tokens in Circulation</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{finCirculation.toLocaleString()} CT</p>
                  <p className="text-[10px] text-white/30 font-mono">KES equivalent: ~{(finCirculation * 1.0).toLocaleString()}</p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/40">Completed Redemptions</p>
                  <div className="space-y-1 text-xs">
                    {finRedeemed.length === 0 ? (
                      <span className="text-white/30 font-mono text-[10px]">No redemptions completed</span>
                    ) : (
                      finRedeemed.map(r => (
                        <div key={r.redemption_type} className="flex justify-between items-center font-mono">
                          <span className="text-white/50 capitalize text-[10px]">{r.redemption_type}:</span>
                          <span className="font-bold text-white text-[10px]">KES {parseFloat(r.total_kes).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/40">Pending Queue</p>
                  <p className="text-2xl font-black text-amber-400 font-mono">{finPending.count} requests</p>
                  <p className="text-[10px] text-white/30 font-mono">Pending Value: KES {finPending.kes.toLocaleString()}</p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-white/40">Failed Flags</p>
                  <p className="text-2xl font-black text-red-400 font-mono">{finFailed.length} failed</p>
                  <p className="text-[10px] text-white/30 font-mono">Requires coordinator manual payout audits</p>
                </div>
              </div>

              {/* Chart and Failed redemptions panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-sm font-bold text-white/80">Monthly Token Velocity (Credits vs Debits)</h3>
                  <VelocityChart data={finVelocity} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-red-400">Failed Cashouts Queue</h3>
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {finFailed.length === 0 ? (
                      <div className="text-center text-white/30 border border-white/5 rounded-2xl p-6 bg-black/10 text-xs">
                        No failed transactions found.
                      </div>
                    ) : (
                      finFailed.map(f => (
                        <div key={f.id} className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-3 space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between text-white font-bold">
                            <span>{f.full_name || "Unknown User"}</span>
                            <span className="text-red-400">KES {parseFloat(f.amount_kes as any).toFixed(2)}</span>
                          </div>
                          <p className="text-white/50">Type: <span className="uppercase text-white">{f.redemption_type}</span> ({f.tokens_spent} CT)</p>
                          <p className="text-red-400/80 bg-red-400/5 p-1 rounded font-mono border border-red-500/10">Reason: {f.failure_reason}</p>
                          <p className="text-white/30 text-[9px] pt-1">Time: {new Date(f.initiated_at).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Redemptions logs with status filter & pagination */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-sm font-bold text-white/80">Redemptions Audit Logs</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white/50 font-mono">Filter Status:</span>
                    <select
                      value={finStatusFilter}
                      onChange={(e) => { setFinStatusFilter(e.target.value); setFinPage(1); }}
                      className="bg-[#0a0a23] border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary/55 text-white"
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 bg-white/[0.01]">
                        <th className="p-3">User</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Masked Phone</th>
                        <th className="p-3">Tokens Spent</th>
                        <th className="p-3">KES Amount</th>
                        <th className="p-3">Receipt / Ref</th>
                        <th className="p-3">Initiated At</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {finRedemptions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-white/30">No redemption requests matches current filters.</td>
                        </tr>
                      ) : (
                        finRedemptions.map(r => (
                          <tr key={r.id} className="hover:bg-white/[0.01]">
                            <td className="p-3 font-semibold text-white">{r.full_name || "Unknown"}</td>
                            <td className="p-3 uppercase text-[10px]">{r.redemption_type}</td>
                            <td className="p-3 text-white/50">{r.phone || "—"}</td>
                            <td className="p-3">{r.tokens_spent} CT</td>
                            <td className="p-3 font-bold text-primary">KES {parseFloat(r.amount_kes as any).toFixed(2)}</td>
                            <td className="p-3 text-white/60 font-semibold">{r.mpesa_receipt || "—"}</td>
                            <td className="p-3 text-white/40">{new Date(r.initiated_at).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                r.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : r.status === "failed" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
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

                <div className="flex justify-between items-center text-xs text-white/50 pt-1 font-mono">
                  <div>
                    Showing {Math.min(finRedemptions.length, finLimit)} of {finTotal} records
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={finPage <= 1}
                      onClick={() => setFinPage(finPage - 1)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      Prev
                    </button>
                    <span className="font-bold text-white">Page {finPage} of {Math.ceil(finTotal / finLimit) || 1}</span>
                    <button
                      disabled={finPage >= Math.ceil(finTotal / finLimit)}
                      onClick={() => setFinPage(finPage + 1)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --------------------------------------------------
              TAB 4: COUNTY CIRCULAR ECONOMY DISTRIBUTIONS
              -------------------------------------------------- */}
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
                          <td className="p-4 text-white/40">{new Date(d.period_month).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</td>
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

          {/* --------------------------------------------------
              TAB 5: MIDNIGHT BLOCKCHAIN & PARTNER REPORTS MODULE
              -------------------------------------------------- */}
          {activeTab === "reports" && (
            <div className="space-y-8">
              {/* Partner report builder section */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Generate Partner/UNICEF Audit Report</h3>
                  <p className="text-xs text-white/50">Export county data ingestion points, registrations, AI confidence rates, ledger audits and redemptions.</p>
                </div>

                <div className="flex flex-wrap gap-4 items-end bg-black/10 p-4 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Start Date</label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">End Date</label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Format</label>
                    <select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as any)}
                      className="bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    >
                      <option value="csv">Multi-Section CSV File</option>
                      <option value="json">Interactive JSON Preview</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDownloadPartnerReport}
                    disabled={reportLoading}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs disabled:opacity-50"
                  >
                    {reportLoading ? "Generating..." : "Download / Preview"}
                  </button>
                </div>

                {/* Show preview of JSON data if loaded */}
                {generatedReport && reportFormat === "json" && (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-white/90">Previewing JSON Report Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5 max-h-[200px] overflow-y-auto text-[10px] font-mono">
                        <p className="text-emerald-400 font-bold mb-1">Crops Ingested Count</p>
                        <pre>{JSON.stringify(generatedReport.verifiedCrops, null, 2)}</pre>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5 max-h-[200px] overflow-y-auto text-[10px] font-mono">
                        <p className="text-blue-400 font-bold mb-1">Weather Readings Count</p>
                        <pre>{JSON.stringify(generatedReport.verifiedWeather, null, 2)}</pre>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5 max-h-[200px] overflow-y-auto text-[10px] font-mono col-span-full">
                        <p className="text-amber-400 font-bold mb-1">AI Verified Confidence Averages</p>
                        <pre>{JSON.stringify(generatedReport.aiConfidence, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Midnight blockchain weekly anchors trigger */}
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

          {/* --------------------------------------------------
              TAB 6: JOBS MODULE (BULLMQ)
              -------------------------------------------------- */}
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

      {/* --------------------------------------------------
          POPUP MODAL: USER DETAILS & MANAGEMENT (MODULE 1)
          -------------------------------------------------- */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-[#0a0a23] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsUserModalOpen(false); setSelectedUser(null); setSelectedUserHistory(null); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl font-bold"
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{selectedUser.full_name}</h3>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-black uppercase text-[10px]">
                  {selectedUser.role}
                </span>
              </div>
              <p className="text-xs text-white/40 font-mono">User UUID: {selectedUser.id}</p>
            </div>

            {/* Quick Actions (Verify, Suspend, Balance adjust) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-white/5 py-4">

              {/* Verify & Status actions */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-emerald-400 font-mono">Verification status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/50">Verified status:</span>
                    <span className={selectedUser.is_verified ? "text-emerald-400 font-bold" : "text-white/40"}>
                      {selectedUser.is_verified ? "VERIFIED ✓" : "UNVERIFIED"}
                    </span>
                  </div>
                  <button
                    disabled={selectedUser.is_verified || actionLoading}
                    onClick={() => handleUserVerify(selectedUser.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Verify Node
                  </button>
                </div>
              </div>

              {/* Suspension actions */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-red-400 font-mono">Suspension controls</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/50">Status:</span>
                    <span className={selectedUser.is_active ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                      {selectedUser.is_active ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </div>
                  {selectedUser.is_active ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Reason for suspension..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                      <button
                        disabled={actionLoading}
                        onClick={() => handleUserSuspend(selectedUser.id, true)}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Suspend Node
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUserSuspend(selectedUser.id, false)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Unsuspend Node
                    </button>
                  )}
                </div>
              </div>

              {/* Balance Adjustments (notes mandatory) */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-primary font-mono">Award/Debit Tokens</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white/50">Token Balance:</span>
                    <span className="text-primary font-black">{selectedUser.token_balance ?? 0} CT</span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="number"
                      placeholder="Amount (e.g. 15 or -10)"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Mandatory justification notes..."
                      value={adjustNotes}
                      onChange={(e) => setAdjustNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUserAdjustBalance(selectedUser.id)}
                      className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Detailed User History Tabs */}
            <div className="space-y-4">
              <div className="flex gap-2 border-b border-white/5 pb-2">
                {[
                  { id: "details", label: "Overview details" },
                  { id: "ledger", label: "Token Ledgers" },
                  { id: "submissions", label: "Crop Uploads" },
                  { id: "redemptions", label: "Cashouts Log" },
                  { id: "audit", label: "Audit Trails" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUserModalTab(tab.id as any)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                      userModalTab === tab.id
                        ? "bg-primary border-primary text-white"
                        : "bg-white/5 border-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab views content */}
              <div className="bg-black/20 rounded-2xl p-4 min-h-[150px] overflow-y-auto max-h-[300px]">
                {userModalTab === "details" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Email Address</p>
                      <p className="text-white font-semibold">{selectedUser.email || "—"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Telegram Username</p>
                      <p className="text-white font-semibold">@{selectedUser.telegram_username || "—"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Telegram ID</p>
                      <p className="text-white font-semibold">{selectedUser.telegram_id || "—"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Phone Number</p>
                      <p className="text-white font-semibold">{selectedUser.phone_number || "—"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">County Area</p>
                      <p className="text-white font-semibold">{selectedUser.county || "Global"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Language Setting</p>
                      <p className="text-white font-semibold uppercase">{selectedUser.language || "en"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Registered Date</p>
                      <p className="text-white font-semibold">{new Date(selectedUser.created_at).toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase text-white/40 font-bold">Last Activity Seen</p>
                      <p className="text-white font-semibold">{selectedUser.last_seen_at ? new Date(selectedUser.last_seen_at).toLocaleString() : "—"}</p>
                    </div>
                    {selectedUser.suspension_reason && (
                      <div className="space-y-0.5 col-span-full border-t border-red-500/10 pt-2 mt-2">
                        <p className="text-[10px] uppercase text-red-400 font-bold">Suspension Reason (At {selectedUser.suspended_at ? new Date(selectedUser.suspended_at).toLocaleString() : "—"})</p>
                        <p className="text-red-400/80 bg-red-500/5 px-2 py-1 rounded font-semibold border border-red-500/10">{selectedUser.suspension_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {userModalTab === "ledger" && (
                  <div className="space-y-2">
                    {selectedUserHistory?.ledger.length === 0 ? (
                      <p className="text-center text-white/30 text-xs">No token ledger adjustments found.</p>
                    ) : (
                      selectedUserHistory?.ledger.map((l: any) => (
                        <div key={l.id} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-1">
                          <div>
                            <span className={`font-bold ${l.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {l.amount > 0 ? `+${l.amount}` : l.amount} CT
                            </span>
                            <span className="text-white/40 ml-2">Type: {l.transaction_type}</span>
                            {l.notes && <p className="text-[10px] text-white/60">Notes: {l.notes}</p>}
                          </div>
                          <span className="text-white/30">{new Date(l.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {userModalTab === "submissions" && (
                  <div className="space-y-2">
                    {selectedUserHistory?.submissions.length === 0 ? (
                      <p className="text-center text-white/30 text-xs">No crop photos uploaded.</p>
                    ) : (
                      selectedUserHistory?.submissions.map((s: any) => (
                        <div key={s.id} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-1">
                          <div>
                            <span className="font-semibold text-white">{s.crop_type}</span>
                            <span className="text-white/40 ml-2">Stage: {s.growth_stage}</span>
                            {s.ai_health_score && <p className="text-[10px] text-white/50">AI Health: {(s.ai_health_score*100).toFixed(1)}%</p>}
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            s.verification_status === "verified" ? "bg-emerald-500/10 text-emerald-400" : s.verification_status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                          }`}>{s.verification_status.toUpperCase()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {userModalTab === "redemptions" && (
                  <div className="space-y-2">
                    {selectedUserHistory?.redemptions.length === 0 ? (
                      <p className="text-center text-white/30 text-xs">No redemptions requested.</p>
                    ) : (
                      selectedUserHistory?.redemptions.map((r: any) => (
                        <div key={r.id} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-1">
                          <div>
                            <span className="font-semibold capitalize text-white">{r.redemption_type}</span>
                            <span className="text-white/40 ml-2">Spent: {r.tokens_spent} CT</span>
                            <p className="text-[10px] text-primary">Disbursed KES: {parseFloat(r.amount_kes).toFixed(2)}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            r.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : r.status === "failed" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                          }`}>{r.status.toUpperCase()}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {userModalTab === "audit" && (
                  <div className="space-y-2">
                    {selectedUserHistory?.audit.length === 0 ? (
                      <p className="text-center text-white/30 text-xs">No audit trail recorded.</p>
                    ) : (
                      selectedUserHistory?.audit.map((a: any) => (
                        <div key={a.id} className="text-xs font-mono border-b border-white/5 pb-1 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-white font-semibold">{a.action}</span>
                            <span className="text-white/30">{new Date(a.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-white/50">Target: {a.entity_type} • IP: {a.ip_address}</p>
                          {a.metadata && <p className="text-[9px] text-white/40">Meta: {JSON.stringify(a.metadata)}</p>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------
          POPUP MODAL: REVIEW ACTIONS FORM (MODULE 2)
          -------------------------------------------------- */}
      {cropReviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0a0a23] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-md font-bold text-white">
              Process Crop photo for: <span className="text-primary capitalize">{cropReviewAction.crop_type}</span>
            </h3>
            <p className="text-xs text-white/50">
              Confirming <span className="text-white font-semibold uppercase">{cropReviewAction.action}</span> action. 
              {cropReviewAction.action === "approve" && " Verified farmers automatically earn 15 climate tokens."}
            </p>

            {cropReviewAction.action !== "approve" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/50">
                  {cropReviewAction.action === "reject" ? "Rejection Reason (Required)" : "Escalation Notes (Required)"}
                </label>
                <textarea
                  value={reviewReasonOrNotes}
                  onChange={(e) => setReviewReasonOrNotes(e.target.value)}
                  placeholder={cropReviewAction.action === "reject" ? "Enter explicit rejection explanation..." : "Describe why escalation is necessary..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-primary/55 text-white h-24"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setCropReviewAction(null); setReviewReasonOrNotes(""); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleCropReview}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {weatherReviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0a0a23] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-md font-bold text-white">
              Process Weather reading sync at: <span className="text-primary font-mono">{weatherReviewAction.reading_time}</span>
            </h3>
            <p className="text-xs text-white/50">
              Confirming <span className="text-white font-semibold uppercase">{weatherReviewAction.action}</span> action. 
              {weatherReviewAction.action === "approve" && " Crediting 1 climate token to the weather agent."}
            </p>

            {weatherReviewAction.action !== "approve" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/50">
                  {weatherReviewAction.action === "reject" ? "Rejection Reason (Required)" : "Escalation Notes (Required)"}
                </label>
                <textarea
                  value={reviewReasonOrNotes}
                  onChange={(e) => setReviewReasonOrNotes(e.target.value)}
                  placeholder={weatherReviewAction.action === "reject" ? "Enter explicit rejection explanation..." : "Describe why escalation is necessary..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-primary/55 text-white h-24"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setWeatherReviewAction(null); setReviewReasonOrNotes(""); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleWeatherReview}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
