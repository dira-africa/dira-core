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

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
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
  alerts_enabled?: boolean;
  suspended_at: string | null;
  phone_number?: string | null;
  language?: string | null;
}

interface CropSubmission {
  id: string;
  user_id: string;
  crop_type: string;
  growth_stage: string;
  verification_status: "pending" | "verified" | "rejected" | "escalated" | "failed" | "manual_review" | "appealed";
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
  is_appealed?: boolean;
  appeal_reason?: string | null;
  appealed_at?: string | null;
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
  hcs_tx_id: string;
  hcs_sequence_number: string;
  hts_tx_id: string;
  anchored_at: string;
}

interface Certificate {
  id: string;
  cert_id: string;
  county_code: string;
  condition_type: string;
  confidence_threshold: string;
  hcs_tx_id: string;
  hcs_sequence_number: string;
  hts_tx_id: string;
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

interface AgroDealer {
  id: string;
  dealer_name: string;
  dealer_phone: string;
  county_id: string;
  mou_signed_at: string | null;
  bank_account: string;
  transaction_fee_pct: string | number;
  active: boolean;
  categories: string[];
}

interface AgroDealerReconciliation {
  agro_dealer_id: string;
  dealer_name: string;
  dealer_phone: string;
  county_id: string;
  bank_account: string;
  transaction_fee_pct: number;
  total_tokens: number;
  total_kes_value: number;
  total_fee_retained: number;
  total_kes_owed: number;
}

interface Coordinator {
  id: string;
  agent_id: string;
  county_id: string;
  mpesa_number: string;
  active_from: string;
  active: boolean;
  agent_name: string;
  agent_email: string;
  agent_telegram: string | null;
}

interface DiraCirclePool {
  county_id: string;
  coordinator_id: string;
  coordinator_name: string;
  coordinator_mpesa: string;
  total_tokens: number;
  total_kes: number;
  total_users: number;
}

interface AvailableAgent {
  id: string;
  full_name: string;
  telegram_username: string | null;
  email: string | null;
  county: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"users" | "data-review" | "payments" | "circle" | "agro-dealers" | "mpesa-activation" | "reports" | "jobs" | "analytics" | "warning" | "alerts" | "admin-mgmt" | "blog">("users");

  // MODULE: ADMIN MANAGEMENT STATE
  const [adminList, setAdminList] = useState<any[]>([]);
  const [ipAllowlist, setIpAllowlist] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [adminMgmtSubTab, setAdminMgmtSubTab] = useState<"admins" | "ip" | "audit">("admins");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("admin");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newIpCidr, setNewIpCidr] = useState("");
  const [newIpLabel, setNewIpLabel] = useState("");
  const [adminMgmtLoading, setAdminMgmtLoading] = useState(false);
  const [adminMgmtMsg, setAdminMgmtMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");

  // MODULE: BLOG STATE
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", body: "", cover_image_url: "", status: "draft", meta_title: "", meta_description: "" });
  const [blogMsg, setBlogMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSubTab, setBlogSubTab] = useState<"list" | "editor">("list");

  // MODULE 10: EARLY WARNING SYSTEM STATE
  const [thresholds, setThresholds] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [editingThreshold, setEditingThreshold] = useState<any | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editOwner, setEditOwner] = useState("");
  
  // Test Injector State
  const [injectMetric, setInjectMetric] = useState("verification_failure_rate");
  const [injectValue, setInjectValue] = useState("");

  // MODULE 11: FARMER CLIMATE ALERTS STATE
  const [farmerAlertsHistory, setFarmerAlertsHistory] = useState<any[]>([]);
  const [alertTarget, setAlertTarget] = useState<"county" | "farmer">("county");
  const [alertTargetUser, setAlertTargetUser] = useState("");
  const [alertTargetCounty, setAlertTargetCounty] = useState("Kilifi");
  const [alertMetric, setAlertMetric] = useState("rainfall");
  const [alertUnit, setAlertUnit] = useState("mm");
  const [alertProbability, setAlertProbability] = useState("75");
  const [alertLowInterval, setAlertLowInterval] = useState("60");
  const [alertHighInterval, setAlertHighInterval] = useState("80");
  const [alertConfidence, setAlertConfidence] = useState<"high" | "low">("high");
  const [alertAction, setAlertAction] = useState("dig drainage channels");
  const [alertEscalation, setAlertEscalation] = useState("rainfall exceeds 100mm");

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

  // ----------------------------------------------------
  // MODULE 5: AGRO-DEALER MANAGEMENT STATE
  // ----------------------------------------------------
  const [agroDealers, setAgroDealers] = useState<AgroDealer[]>([]);
  const [dealerReconciliations, setDealerReconciliations] = useState<AgroDealerReconciliation[]>([]);
  const [newDealerForm, setNewDealerForm] = useState({
    dealerName: "",
    dealerPhone: "",
    countyId: "Nairobi",
    bankAccount: "",
    transactionFeePct: 3.5,
    categories: [] as string[],
    mouSignedAt: ""
  });
  const [categoryInput, setCategoryInput] = useState("");
  const [settleDealerId, setSettleDealerId] = useState<string | null>(null);
  const [settleReference, setSettleReference] = useState("");

  // ----------------------------------------------------
  // MODULE 5: DIRA CIRCLE & COORDINATORS STATE
  // ----------------------------------------------------
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [circlePools, setCirclePools] = useState<DiraCirclePool[]>([]);
  const [availableAgents, setAvailableAgents] = useState<AvailableAgent[]>([]);
  const [appointCounty, setAppointCounty] = useState("Nairobi");
  const [selectedAppointAgentId, setSelectedAppointAgentId] = useState("");
  const [appointMpesaNumber, setAppointMpesaNumber] = useState("");

  // ----------------------------------------------------
  // MODULE 5: MPESA ACTIVATION STATE
  // ----------------------------------------------------
  const [pretiumActive, setPretiumActive] = useState<boolean | null>(null);
  const [mpesaChecklist, setMpesaChecklist] = useState({
    pretium_credentials_approved: false,
    first_b2b_revenue_received: false
  });
  const [mpesaFailedRedemptions, setMpesaFailedRedemptions] = useState<Redemption[]>([]);
  const [mpesaRetryLoadingId, setMpesaRetryLoadingId] = useState<string | null>(null);

  // ----------------------------------------------------
  // MODULE 5: TOKEN ECONOMIC ACTIVITY STATE (ANNEX A)
  // ----------------------------------------------------
  const [annexAStartDate, setAnnexAStartDate] = useState("");
  const [annexAEndDate, setAnnexAEndDate] = useState("");
  const [annexAReportData, setAnnexAReportData] = useState<any | null>(null);
  const [annexALoading, setAnnexALoading] = useState(false);
  const [annexAFormat, setAnnexAFormat] = useState<"json" | "csv">("csv");

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
          if (json.success) setDistributions(json.distributions || []);
        }
        const coordRes = await authenticatedFetch("/api/admin/circle/coordinators");
        if (coordRes) {
          const json = await coordRes.json();
          if (json.success) setCoordinators(json.coordinators || []);
        }
        const calcRes = await authenticatedFetch("/api/admin/circle/calculator");
        if (calcRes) {
          const json = await calcRes.json();
          if (json.success) setCirclePools(json.pools || []);
        }
      } else if (activeTab === "agro-dealers") {
        const dealersRes = await authenticatedFetch("/api/admin/agro-dealers");
        if (dealersRes) {
          const json = await dealersRes.json();
          if (json.success) setAgroDealers(json.agroDealers || []);
        }
        const reconRes = await authenticatedFetch("/api/admin/agro-dealers/reconciliation");
        if (reconRes) {
          const json = await reconRes.json();
          if (json.success) setDealerReconciliations(json.reconciliations || []);
        }
      } else if (activeTab === "mpesa-activation") {
        const settingsRes = await authenticatedFetch("/api/admin/mpesa-settings");
        if (settingsRes) {
          const json = await settingsRes.json();
          if (json.success) {
            setPretiumActive(json.pretiumActive);
            setMpesaChecklist(json.settings || { pretium_credentials_approved: false, first_b2b_revenue_received: false });
          }
        }
        const failedRes = await authenticatedFetch("/api/admin/financials?page=1&limit=50&status=failed");
        if (failedRes) {
          const json = await failedRes.json();
          if (json.success) setMpesaFailedRedemptions(json.redemptions || json.failed || []);
        }
      } else if (activeTab === "reports") {
        const res = await authenticatedFetch("/api/admin/hedera/status");
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
      } else if (activeTab === "warning") {
        const tRes = await authenticatedFetch("/api/admin/warning/thresholds");
        if (tRes) {
          const json = await tRes.json();
          if (json.success) setThresholds(json.thresholds || []);
        }
        const aRes = await authenticatedFetch("/api/admin/warning/alerts");
        if (aRes) {
          const json = await aRes.json();
          if (json.success) setAlerts(json.alerts || []);
        }
      } else if (activeTab === "alerts") {
        const res = await authenticatedFetch("/api/admin/farmers/alerts");
        if (res) {
          const json = await res.json();
          if (json.success) setFarmerAlertsHistory(json.alerts || []);
        }
        const usersRes = await authenticatedFetch(`/api/admin/users?limit=100&role=farmer`);
        if (usersRes) {
          const json = await usersRes.json();
          if (json.success) setUsers(json.users || []);
        }
      } else if (activeTab === "admin-mgmt") {
        const [admRes, ipRes, auditRes] = await Promise.all([
          authenticatedFetch("/api/admin/management/admins"),
          authenticatedFetch("/api/admin/management/ip-allowlist"),
          authenticatedFetch("/api/admin/management/audit-log?limit=50"),
        ]);
        if (admRes) { const j = await admRes.json(); if (j.success) setAdminList(j.admins || []); }
        if (ipRes) { const j = await ipRes.json(); if (j.success) setIpAllowlist(j.entries || []); }
        if (auditRes) { const j = await auditRes.json(); if (j.success) setAuditLogs(j.logs || []); }
      } else if (activeTab === "blog") {
        const res = await authenticatedFetch("/api/admin/blog/");
        if (res) { const j = await res.json(); if (j.success) setBlogPosts(j.posts || []); }
      }
    } catch (e) {
      console.error("Tab data loading failed:", e);
    }
  }, [
    token,
    activeTab,
    authenticatedFetch,
    usersPage,
    usersLimit,
    usersSearch,
    usersRole,
    usersCounty,
    usersActive,
    usersStartDate,
    usersEndDate,
    finPage,
    finLimit,
    finStatusFilter
  ]);

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

  // Update Threshold handler
  const handleUpdateThreshold = async (metric: string) => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch(`/api/admin/warning/thresholds/${metric}`, {
        method: "PUT",
        body: JSON.stringify({
          thresholdValue: Number(editLimit),
          protectiveAction: editAction,
          ownerName: editOwner
        })
      });
      if (res && res.ok) {
        setActionSuccessMsg(`Successfully updated threshold configuration for ${metric}.`);
        setEditingThreshold(null);
        await loadTabData();
      } else {
        setActionErrorMsg("Failed to update threshold configuration.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  // Inject Metric Value handler (for tests)
  const handleInjectMetric = async () => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch("/api/admin/warning/test-inject", {
        method: "POST",
        body: JSON.stringify({
          metric: injectMetric,
          value: Number(injectValue)
        })
      });
      if (res && res.ok) {
        setActionSuccessMsg(`Successfully injected test value ${injectValue} for ${injectMetric}.`);
        setInjectValue("");
        await loadTabData();
      } else {
        setActionErrorMsg("Failed to inject test metric value.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  // Send Climate Alert handler
  const handleSendClimateAlert = async () => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const payload: any = {
        options: {
          metric: alertMetric,
          unit: alertUnit,
          probability: Number(alertProbability),
          credibleInterval: [Number(alertLowInterval), Number(alertHighInterval)],
          confidence: alertConfidence,
          action: alertAction,
          escalation: alertEscalation
        }
      };
      if (alertTarget === "county") {
        payload.county = alertTargetCounty;
      } else {
        payload.userId = alertTargetUser;
      }

      const res = await authenticatedFetch("/api/admin/farmers/alerts/send", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res && res.ok) {
        const data = await res.json();
        setActionSuccessMsg(`Climate Alert successfully dispatched!`);
        await loadTabData();
      } else {
        setActionErrorMsg("Failed to dispatch Climate Alert.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "An error occurred dispatching alert.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Alert opt-out preference
  const handleToggleFarmerAlert = async (userId: string, currentStatus: boolean) => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch(`/api/admin/farmers/${userId}/alerts/toggle`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !currentStatus })
      });
      if (res && res.ok) {
        setActionSuccessMsg(`Successfully toggled alerts setting for user.`);
        await loadTabData();
      } else {
        setActionErrorMsg("Failed to toggle alert preference.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnchorWeeks = async () => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setActionLoading(true);

    try {
      const res = await authenticatedFetch("/api/admin/hedera/anchor", { method: "POST" });
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
      const res = await authenticatedFetch("/api/admin/hedera/certificate", {
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
  // MODULE 5 DYNAMIC HANDLERS & EFFECTS
  // ----------------------------------------------------
  const loadAvailableAgents = useCallback(async (county: string) => {
    if (!token) return;
    try {
      const res = await authenticatedFetch(`/api/admin/circle/agents?county=${county}`);
      if (res) {
        const json = await res.json();
        if (json.success) {
          setAvailableAgents(json.agents || []);
        }
      }
    } catch (e) {
      console.error("Failed to load available agents:", e);
    }
  }, [token, authenticatedFetch]);

  useEffect(() => {
    if (activeTab === "circle" && appointCounty) {
      loadAvailableAgents(appointCounty);
    }
  }, [activeTab, appointCounty, loadAvailableAgents]);

  const handleAppointCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointAgentId || !appointMpesaNumber) {
      setActionErrorMsg("Please select an agent and provide an M-Pesa number.");
      return;
    }
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch("/api/admin/circle/coordinators", {
        method: "POST",
        body: JSON.stringify({
          agentId: selectedAppointAgentId,
          countyId: appointCounty,
          mpesaNumber: appointMpesaNumber
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Successfully appointed county coordinator.");
          setSelectedAppointAgentId("");
          setAppointMpesaNumber("");
          loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to appoint coordinator.");
        }
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Failed to appoint coordinator.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerMonthlyPool = async (countyId: string) => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch("/api/admin/circle/distributions", {
        method: "POST",
        body: JSON.stringify({ countyId })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || `Successfully processed monthly pool for ${countyId}.`);
          loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to process monthly pool.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to process monthly pool.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadTransferInstructions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/circle/distributions/export-instructions`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to download CSV.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "circle-transfer-instructions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setActionSuccessMsg("Instructions CSV downloaded successfully.");
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to download instructions.");
    }
  };

  const handleCreateAgroDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { dealerName, dealerPhone, countyId, bankAccount, transactionFeePct, categories, mouSignedAt } = newDealerForm;
    if (!dealerName || !dealerPhone || !countyId || !bankAccount) {
      setActionErrorMsg("Please fill in all required agro-dealer fields.");
      return;
    }
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch("/api/admin/agro-dealers", {
        method: "POST",
        body: JSON.stringify({
          dealerName,
          dealerPhone,
          countyId,
          bankAccount,
          transactionFeePct: Number(transactionFeePct),
          categories,
          mouSignedAt: mouSignedAt || undefined
        })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Agro-dealer created successfully.");
          setNewDealerForm({
            dealerName: "",
            dealerPhone: "",
            countyId: "Nairobi",
            bankAccount: "",
            transactionFeePct: 3.5,
            categories: [],
            mouSignedAt: ""
          });
          setCategoryInput("");
          loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to create agro-dealer.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to create agro-dealer.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettleAgroDealerVouchers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleDealerId || !settleReference.trim()) {
      setActionErrorMsg("Please provide a settlement reference.");
      return;
    }
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch(`/api/admin/agro-dealers/reconciliation/${settleDealerId}/settle`, {
        method: "PATCH",
        body: JSON.stringify({ settlementReference: settleReference })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Successfully settled vouchers.");
          setSettleDealerId(null);
          setSettleReference("");
          loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to settle vouchers.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to settle vouchers.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReconciliationCSV = (recon: AgroDealerReconciliation) => {
    let csv = "Agro-Dealer Reconciliation Report\n";
    csv += `Dealer Name,${recon.dealer_name}\n`;
    csv += `Dealer Phone,${recon.dealer_phone}\n`;
    csv += `County,${recon.county_id}\n`;
    csv += `Bank Account,${recon.bank_account}\n`;
    csv += `Transaction Fee Percentage,${recon.transaction_fee_pct}%\n`;
    csv += "\nSummary Data\n";
    csv += `Total Tokens Redeemed,${recon.total_tokens}\n`;
    csv += `Total KES Value,${recon.total_kes_value.toFixed(2)}\n`;
    csv += `Dira retained fee,${recon.total_fee_retained.toFixed(2)}\n`;
    csv += `Net KES Owed,${recon.total_kes_owed.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reconciliation-${recon.dealer_name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleMpesaSetting = async (key: string, currentValue: boolean) => {
    setActionLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch("/api/admin/mpesa-settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value: !currentValue })
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setMpesaChecklist(prev => ({ ...prev, [key]: !currentValue }));
          setActionSuccessMsg(json.message || `Successfully updated ${key}.`);
        } else {
          setActionErrorMsg(json.error?.message || `Failed to update ${key}.`);
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to update setting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryMpesaRedemption = async (id: string) => {
    setMpesaRetryLoadingId(id);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const res = await authenticatedFetch(`/api/admin/redemptions/${id}/retry`, {
        method: "POST"
      });
      if (res) {
        const json = await res.json();
        if (json.success) {
          setActionSuccessMsg(json.message || "Manual retry successfully triggered.");
          loadTabData();
        } else {
          setActionErrorMsg(json.error?.message || "Failed to retry M-Pesa redemption.");
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to retry redemption.");
    } finally {
      setMpesaRetryLoadingId(null);
    }
  };

  const handleDownloadAnnexAReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setAnnexALoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");
    try {
      const params = new URLSearchParams({
        format: annexAFormat,
        ...(annexAStartDate && { startDate: annexAStartDate }),
        ...(annexAEndDate && { endDate: annexAEndDate })
      });

      if (annexAFormat === "csv") {
         const res = await fetch(`${API_URL}/api/admin/reports/token-economic-activity?${params.toString()}`, {
           headers: {
             "Authorization": `Bearer ${token}`
           }
         });
         if (!res.ok) {
           throw new Error("Failed to download CSV.");
         }
         const blob = await res.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "token-economic-activity-annex-a.csv";
         document.body.appendChild(a);
         a.click();
         a.remove();
         setActionSuccessMsg("Annex A CSV downloaded successfully.");
      } else {
        const res = await authenticatedFetch(`/api/admin/reports/token-economic-activity?${params.toString()}`);
        if (res) {
          const json = await res.json();
          if (json.success) {
            setAnnexAReportData(json);
            setActionSuccessMsg("Annex A JSON data loaded.");
          } else {
            setActionErrorMsg(json.error?.message || "Failed to load report data.");
          }
        }
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to run report.");
    } finally {
      setAnnexALoading(false);
    }
  };

  // ----------------------------------------------------
  // RENDER: LOGIN FORM
  // ----------------------------------------------------
  if (!token) {
    return (
      <main className="flex-1 w-full min-h-screen bg-gradient-to-b from-[#0a0a23] via-[#051c1c] to-[#04120f] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2 relative">
            <Link href="/" className="absolute left-0 top-1 text-white/50 hover:text-white transition-colors" title="Back to Home">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
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
              <Link href="/" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white/70 hover:text-white flex items-center justify-center" title="Back to Home">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </Link>
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
            { id: "circle", label: "County Payouts (Circle)" },
            { id: "agro-dealers", label: "Agro-Dealers" },
            { id: "mpesa-activation", label: "M-Pesa Activation" },
            { id: "reports", label: "Hedera & Partner Reports" },
            { id: "jobs", label: "Background Workers" },
            { id: "analytics", label: "Analytics Panel" },
            { id: "warning", label: "Early-Warning System" },
            { id: "alerts", label: "Farmer Climate Alerts" },
            { id: "admin-mgmt", label: "🔐 Admin Management" },
            { id: "blog", label: "📝 Blog" }
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
                              {c.is_appealed && (
                                <div className="text-[10px] text-purple-400 bg-purple-400/5 px-2 py-1 rounded border border-purple-500/10 font-mono mt-1">
                                  ⚖️ Appeal Reason: {c.appeal_reason}
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
              TAB 4: COUNTY CIRCULAR ECONOMY DISTRIBUTIONS (DIRA CIRCLE)
              -------------------------------------------------- */}
          {activeTab === "circle" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <h2 className="text-md font-bold text-white/90">Dira Circle Distribution Controls</h2>
                  <p className="text-xs text-white/50">Manage county coordinators, monthly cashout pools, and confirm transfers.</p>
                </div>
                <button
                  onClick={handleDownloadTransferInstructions}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-2 self-start md:self-auto font-mono"
                >
                  📥 Export Instructions CSV
                </button>
              </div>

              {/* Coordinator Appointing Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Appoint County Coordinator</h3>
                  <form onSubmit={handleAppointCoordinator} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">Target County</label>
                      <select
                        value={appointCounty}
                        onChange={(e) => setAppointCounty(e.target.value)}
                        className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                      >
                        {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kakamega", "Meru", "Nyeri", "Garissa", "Mandera"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">Select Agent</label>
                      {availableAgents.length === 0 ? (
                        <p className="text-[10px] text-amber-400/70 p-2 bg-amber-500/5 rounded-xl border border-amber-500/10">
                          No available Data Agents in {appointCounty}
                        </p>
                      ) : (
                        <select
                          value={selectedAppointAgentId}
                          onChange={(e) => setSelectedAppointAgentId(e.target.value)}
                          className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                        >
                          <option value="">-- Choose Agent --</option>
                          {availableAgents.map(a => (
                            <option key={a.id} value={a.id}>{a.full_name} (@{a.telegram_username || "no_username"})</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">M-Pesa Cashout Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 254712345678"
                        required
                        value={appointMpesaNumber}
                        onChange={(e) => setAppointMpesaNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading || !selectedAppointAgentId}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                    >
                      Appoint Coordinator
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Appointed County Coordinators Directory</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-[11px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">Coordinator Name</th>
                          <th className="p-3">County</th>
                          <th className="p-3">M-Pesa Number</th>
                          <th className="p-3">Appointed Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {coordinators.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-white/30">No county coordinators appointed yet.</td>
                          </tr>
                        ) : (
                          coordinators.map((c) => (
                            <tr key={c.id} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <div className="font-semibold text-white">{c.agent_name}</div>
                                <div className="text-[9px] text-white/40">{c.agent_email} • @{c.agent_telegram || "—"}</div>
                              </td>
                              <td className="p-3 font-bold text-primary">{c.county_id}</td>
                              <td className="p-3 text-white/80">{c.mpesa_number}</td>
                              <td className="p-3 text-white/40">{new Date(c.active_from).toLocaleDateString()}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                                  {c.active ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Monthly Calculator & Settlements Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Pool Calculator */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Monthly County Pool Calculator</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-[11px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">County</th>
                          <th className="p-3">Coordinator</th>
                          <th className="p-3">Tokens Pending</th>
                          <th className="p-3">Cash Value</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {circlePools.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-white/30">No active county pools computed.</td>
                          </tr>
                        ) : (
                          circlePools.map((p) => (
                            <tr key={p.county_id} className="hover:bg-white/[0.01]">
                              <td className="p-3 font-bold text-white">{p.county_id}</td>
                              <td className="p-3">
                                <div>{p.coordinator_name}</div>
                                <div className="text-[9px] text-white/40">{p.coordinator_mpesa}</div>
                              </td>
                              <td className="p-3 font-semibold text-amber-400">{p.total_tokens.toLocaleString()}</td>
                              <td className="p-3 font-bold text-emerald-400">KES {parseFloat(String(p.total_kes)).toFixed(2)}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleTriggerMonthlyPool(p.county_id)}
                                  disabled={actionLoading || p.total_kes === 0}
                                  className="px-3 py-1 rounded bg-primary hover:bg-primary/95 text-white font-bold text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Trigger Pool
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Distributions Settlement Directory */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Aggregated Payout Logs</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-[11px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">County / Period</th>
                          <th className="p-3">Coordinator Payout</th>
                          <th className="p-3">Ref Code</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Settle Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {distributions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-white/30">No monthly distribution logs found.</td>
                          </tr>
                        ) : (
                          distributions.map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <div className="font-bold text-white">{d.county_id}</div>
                                <div className="text-[9px] text-white/40">{new Date(d.period_month).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</div>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-emerald-400">KES {parseFloat(d.total_kes_disbursed).toFixed(2)}</div>
                                <div className="text-[9px] text-white/40">{d.coordinator_name}</div>
                              </td>
                              <td className="p-3 text-white/60 font-mono">{d.transfer_reference || "—"}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                  {d.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {d.status === "pending" ? (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <input
                                      type="text"
                                      placeholder="M-Pesa Ref"
                                      value={refKey[d.id] || ""}
                                      onChange={(e) => setRefKey({ ...refKey, [d.id]: e.target.value })}
                                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder-white/20 focus:outline-none focus:border-primary/50 max-w-[80px]"
                                    />
                                    <button
                                      onClick={() => handleConfirmDistribution(d.id)}
                                      disabled={actionLoading}
                                      className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] disabled:opacity-50"
                                    >
                                      Mark Paid
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-white/30 font-bold uppercase">Settled</span>
                                )}
                              </td>
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
              TAB 4B: AGRO-DEALER PARTNER ECOSYSTEM
              -------------------------------------------------- */}
          {activeTab === "agro-dealers" && (
            <div className="space-y-8">
              <div className="space-y-1 border-b border-white/5 pb-4">
                <h2 className="text-md font-bold text-white/90">Agro-Dealer Management</h2>
                <p className="text-xs text-white/50">Add new retail partners, configure fee models, and settle weekly vouchers.</p>
              </div>

              {/* Agro-Dealer Registration Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Register Partner Agro-Dealer</h3>
                  <form onSubmit={handleCreateAgroDealer} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">Agro-Dealer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kenya Seed Agro-dealers"
                        required
                        value={newDealerForm.dealerName}
                        onChange={(e) => setNewDealerForm({ ...newDealerForm, dealerName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/50">Contact Phone</label>
                        <input
                          type="text"
                          placeholder="e.g. 254711999999"
                          required
                          value={newDealerForm.dealerPhone}
                          onChange={(e) => setNewDealerForm({ ...newDealerForm, dealerPhone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/50">MOU County</label>
                        <select
                          value={newDealerForm.countyId}
                          onChange={(e) => setNewDealerForm({ ...newDealerForm, countyId: e.target.value })}
                          className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                        >
                          {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kakamega", "Meru", "Nyeri", "Garissa", "Mandera"].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">Bank Account Details</label>
                      <input
                        type="text"
                        placeholder="e.g. Equity Bank 1234567890"
                        required
                        value={newDealerForm.bankAccount}
                        onChange={(e) => setNewDealerForm({ ...newDealerForm, bankAccount: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/50">MOU Signed Date</label>
                        <input
                          type="date"
                          value={newDealerForm.mouSignedAt}
                          onChange={(e) => setNewDealerForm({ ...newDealerForm, mouSignedAt: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/50">Fee Retained (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newDealerForm.transactionFeePct}
                          onChange={(e) => setNewDealerForm({ ...newDealerForm, transactionFeePct: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/50">Product Categories (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="seeds, fertilizer, tools"
                        value={categoryInput}
                        onChange={(e) => {
                          setCategoryInput(e.target.value);
                          setNewDealerForm({
                            ...newDealerForm,
                            categories: e.target.value.split(",").map(cat => cat.trim()).filter(Boolean)
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {newDealerForm.categories.map(cat => (
                          <span key={cat} className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                    >
                      Register Agro-Dealer
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Registered Retail Partners</h3>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-[11px] text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                          <th className="p-3">Dealer Name</th>
                          <th className="p-3">County / Contacts</th>
                          <th className="p-3">Bank Details</th>
                          <th className="p-3">Fee / MOU</th>
                          <th className="p-3">Categories</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/70">
                        {agroDealers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-white/30">No agro-dealers registered yet.</td>
                          </tr>
                        ) : (
                          agroDealers.map((d) => (
                            <tr key={d.id} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <div className="font-semibold text-white">{d.dealer_name}</div>
                                <div className="text-[9px] text-white/40">ID: {d.id.substring(0, 8)}...</div>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-primary">{d.county_id}</div>
                                <div className="text-white/55">{d.dealer_phone}</div>
                              </td>
                              <td className="p-3 text-[10px] text-white/60">{d.bank_account}</td>
                              <td className="p-3">
                                <div className="font-bold text-amber-400">{d.transaction_fee_pct}% Fee</div>
                                <div className="text-[9px] text-white/40">{d.mou_signed_at ? new Date(d.mou_signed_at).toLocaleDateString() : "No MOU Date"}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                  {(d.categories || []).map(cat => (
                                    <span key={cat} className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/60">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Weekly Voucher Reconciliation Section */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Pending Weekly Settlement Reconciliations</h3>
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-[11px] text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                        <th className="p-3">Agro-Dealer Name</th>
                        <th className="p-3">Pending Tokens</th>
                        <th className="p-3">Gross Voucher Value</th>
                        <th className="p-3">Retained Fee</th>
                        <th className="p-3">Net KES Owed</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {dealerReconciliations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-white/30">No pending weekly voucher settlements.</td>
                        </tr>
                      ) : (
                        dealerReconciliations.map((r) => (
                          <tr key={r.agro_dealer_id} className="hover:bg-white/[0.01]">
                            <td className="p-3">
                              <div className="font-semibold text-white">{r.dealer_name}</div>
                              <div className="text-[9px] text-white/40">{r.dealer_phone} • {r.county_id}</div>
                            </td>
                            <td className="p-3 font-semibold text-amber-400">{r.total_tokens.toLocaleString()}</td>
                            <td className="p-3 text-white/80">KES {r.total_kes_value.toFixed(2)}</td>
                            <td className="p-3 text-red-400/80">- KES {r.total_fee_retained.toFixed(2)} ({r.transaction_fee_pct}%)</td>
                            <td className="p-3 font-bold text-emerald-400">KES {r.total_kes_owed.toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleDownloadReconciliationCSV(r)}
                                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/80 font-bold transition-all"
                                >
                                  📄 Report
                                </button>
                                {r.total_tokens > 0 ? (
                                  <button
                                    onClick={() => {
                                      setSettleDealerId(r.agro_dealer_id);
                                      setSettleReference("");
                                    }}
                                    className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition-all"
                                  >
                                    Confirm Settlement
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-white/30 font-bold">Settled</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Settlement Modal */}
              {settleDealerId && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0b0c16] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="space-y-1">
                      <h3 className="text-md font-bold text-white">Agro-Dealer Settlement Transfer</h3>
                      <p className="text-xs text-white/50">Enter the bank transaction reference number to confirm this settlement.</p>
                    </div>

                    <form onSubmit={handleSettleAgroDealerVouchers} className="space-y-4">
                      <div className="space-y-1 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs space-y-2">
                        {(() => {
                          const dealer = dealerReconciliations.find(r => r.agro_dealer_id === settleDealerId);
                          if (!dealer) return null;
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/50">Dealer Name:</span>
                                <span className="font-bold text-white">{dealer.dealer_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/50">Bank Account:</span>
                                <span className="font-mono text-white/80">{dealer.bank_account}</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-white/50">Net KES Transfer:</span>
                                <span className="font-extrabold text-emerald-400 text-sm">KES {dealer.total_kes_owed.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-white/50">Bank Transfer / EFT Reference Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BK-EFT-294821X"
                          value={settleReference}
                          onChange={(e) => setSettleReference(e.target.value)}
                          className="w-full bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSettleDealerId(null)}
                          className="flex-1 py-2 text-xs rounded-xl bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading || !settleReference.trim()}
                          className="flex-1 py-2 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all disabled:opacity-50"
                        >
                          Confirm Paid
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------
              TAB 4C: PRETIUM MOBILE MONEY ACTIVATION & RETRY
              -------------------------------------------------- */}
          {activeTab === "mpesa-activation" && (
            <div className="space-y-8">
              <div className="space-y-1 border-b border-white/5 pb-4">
                <h2 className="text-md font-bold text-white/90">Pretium Mobile Money Gateway</h2>
                <p className="text-xs text-white/50">Monitor production Pretium mobile money activation status and manually retry failed cashouts.</p>
              </div>

              {/* Status & Checklist Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gateway Status Indicators */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Pretium API Channel Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`h-3 w-3 rounded-full ${pretiumActive ? "bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50" : "bg-amber-500"}`} />
                    <div>
                      <div className="text-xs font-bold text-white uppercase">
                        {pretiumActive ? "PRODUCTION STAGE READY" : "SANDBOX INTERFACE ONLY"}
                      </div>
                      <p className="text-[9px] text-white/40 font-mono">Flag: PRETIUM_ACTIVE</p>
                    </div>
                  </div>

                  <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-white/50">Pretium Mobile Money Rule</h4>
                    <p className="text-[10px] text-white/70 leading-relaxed">
                      Pretium mobile money cashout is flag-gated. Automatic processing will ONLY execute when the environment flag is true and the activation checklist below is fully verified.
                    </p>
                  </div>
                </div>

                {/* Persistent Checklist Checkboxes */}
                <div className="md:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Production Launch Activation Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 bg-black/10 p-3 rounded-xl border border-white/5">
                      <input
                        type="checkbox"
                        id="pretium_credentials"
                        checked={mpesaChecklist.pretium_credentials_approved}
                        onChange={() => handleToggleMpesaSetting("pretium_credentials_approved", mpesaChecklist.pretium_credentials_approved)}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 mt-0.5"
                      />
                      <label htmlFor="pretium_credentials" className="text-xs space-y-0.5 cursor-pointer select-none">
                        <div className="font-semibold text-white">Pretium production API credentials approved by network architect</div>
                        <p className="text-[10px] text-white/40">Verifies that the consumer key, consumer secret, shortcode, and passkey have been secured and tested.</p>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 bg-black/10 p-3 rounded-xl border border-white/5">
                      <input
                        type="checkbox"
                        id="first_b2b"
                        checked={mpesaChecklist.first_b2b_revenue_received}
                        onChange={() => handleToggleMpesaSetting("first_b2b_revenue_received", mpesaChecklist.first_b2b_revenue_received)}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 mt-0.5"
                      />
                      <label htmlFor="first_b2b" className="text-xs space-y-0.5 cursor-pointer select-none">
                        <div className="font-semibold text-white">First B2B weather data purchaser revenue deposited to escrow pool</div>
                        <p className="text-[10px] text-white/40">Confirms the network holds sufficient cash backing reserves in KES before opening Safaricom automated payouts.</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failed Redemptions Queue */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Failed B2C Redemptions Queue</span>
                  <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold">
                    {mpesaFailedRedemptions.length} Failed
                  </span>
                </h3>
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-[11px] text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 bg-white/[0.01]">
                        <th className="p-3">User Name</th>
                        <th className="p-3">Amount KES / Tokens</th>
                        <th className="p-3">M-Pesa Phone</th>
                        <th className="p-3">Date Initiated</th>
                        <th className="p-3">Failure Reason Details</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {mpesaFailedRedemptions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/30">No failed M-Pesa redemptions found.</td>
                        </tr>
                      ) : (
                        mpesaFailedRedemptions.map((r) => (
                          <tr key={r.id} className="hover:bg-white/[0.01]">
                            <td className="p-3">
                              <div className="font-semibold text-white">{r.full_name}</div>
                              <div className="text-[9px] text-white/40">ID: {r.id.substring(0, 8)}...</div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-emerald-400">KES {parseFloat(String(r.amount_kes)).toFixed(2)}</div>
                              <div className="text-[9px] text-white/40">{r.tokens_spent} tokens</div>
                            </td>
                            <td className="p-3 text-white/80">{r.phone || "—"}</td>
                            <td className="p-3 text-white/40">{new Date(r.initiated_at).toLocaleString()}</td>
                            <td className="p-3 text-red-400/80 text-[10px] truncate max-w-[200px]" title={r.failure_reason}>
                              {r.failure_reason || "Unknown API error"}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRetryMpesaRedemption(r.id)}
                                disabled={mpesaRetryLoadingId !== null}
                                className="px-3.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] disabled:opacity-50 shadow-md shadow-amber-500/10 flex items-center gap-1.5 ml-auto transition-all"
                              >
                                {mpesaRetryLoadingId === r.id ? (
                                  <>
                                    <span className="animate-spin inline-block h-2 w-2 border-2 border-white border-t-transparent rounded-full" />
                                    Retrying...
                                  </>
                                ) : (
                                  "Retry Payout"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------
              TAB 5: MIDNIGHT BLOCKCHAIN & PARTNER REPORTS MODULE
              -------------------------------------------------- */}
          {activeTab === "reports" && (
            <div className="space-y-8">
              {/* Token Economic Activity Report (Annex A) */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Token Economic Activity Report (Annex A)</h3>
                  <p className="text-xs text-white/50">Run aggregate earn/redeem volumes, county speeds, earners, and conversion velocities for EOI submissions.</p>
                </div>

                <form onSubmit={handleDownloadAnnexAReport} className="flex flex-wrap gap-4 items-end bg-black/10 p-4 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Start Date</label>
                    <input
                      type="date"
                      value={annexAStartDate}
                      onChange={(e) => setAnnexAStartDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">End Date</label>
                    <input
                      type="date"
                      value={annexAEndDate}
                      onChange={(e) => setAnnexAEndDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/50">Report Format</label>
                    <select
                      value={annexAFormat}
                      onChange={(e) => setAnnexAFormat(e.target.value as any)}
                      className="bg-[#0a0a23] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/55 text-white font-mono"
                    >
                      <option value="csv">Multi-Section CSV File</option>
                      <option value="json">Interactive JSON Preview</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={annexALoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-505 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs disabled:opacity-50 shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                  >
                    {annexALoading ? (
                      <>
                        <span className="animate-spin inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Running...
                      </>
                    ) : (
                      "Generate Annex A Report"
                    )}
                  </button>
                </form>

                {/* Show JSON preview for Annex A */}
                {annexAReportData && annexAFormat === "json" && (
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-white/90">Previewing Annex A Report JSON</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-white/70">
                        <div className="text-[10px] text-white/40 uppercase">Total Tokens Earned</div>
                        <div className="text-lg font-black text-white">{annexAReportData.summary?.totalEarned.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-white/70">
                        <div className="text-[10px] text-white/40 uppercase">Total Tokens Redeemed</div>
                        <div className="text-lg font-black text-white">{annexAReportData.summary?.totalRedeemed.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-white/70">
                        <div className="text-[10px] text-white/40 uppercase">Total Disbursed KES</div>
                        <div className="text-lg font-black text-emerald-400">KES {parseFloat(String(annexAReportData.summary?.totalKesDisbursed)).toFixed(2)}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-white/70">
                        <div className="text-[10px] text-white/40 uppercase">Avg Conversion Velocity</div>
                        <div className="text-lg font-black text-amber-400">{parseFloat(String(annexAReportData.summary?.conversionVelocity)).toFixed(2)} Days</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 max-h-[200px] overflow-y-auto text-[10px] font-mono">
                        <p className="text-emerald-400 font-bold mb-1">Earned Breakdown by Activity</p>
                        <pre>{JSON.stringify(annexAReportData.earnedBreakdown, null, 2)}</pre>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 max-h-[200px] overflow-y-auto text-[10px] font-mono">
                        <p className="text-blue-400 font-bold mb-1">Redeemed Breakdown by Layer</p>
                        <pre>{JSON.stringify(annexAReportData.redeemedBreakdown, null, 2)}</pre>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10 max-h-[200px] overflow-y-auto text-[10px] font-mono col-span-full">
                        <p className="text-amber-400 font-bold mb-1">County Performance Breakdown</p>
                        <pre>{JSON.stringify(annexAReportData.countyBreakdown, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

              {/* Hedera blockchain weekly anchors trigger */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Hedera Blockchain Weekly Merkle Anchoring</h3>
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
                  <h3 className="text-sm font-bold text-white">Issue Hedera Data Compliance Certificate</h3>
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
                {/* Hedera Anchors */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white/90">Latest Hedera Anchors</h3>
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
                              <td className="p-3 truncate max-w-[120px]" title={an.hcs_tx_id}>{an.hcs_tx_id || "—"}</td>
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

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-md font-bold text-white/90">First-Party Privacy-Safe Analytics Panel</h2>
                  <p className="text-xs text-white/40 font-mono mt-1">Real-time aggregated site views and farmer/agent interaction metrics.</p>
                </div>
                <button
                  onClick={() => loadTabData()}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Refresh Analytics Data
                </button>
              </div>

              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Total Views */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Total Page Views</span>
                  <div className="text-2xl font-extrabold text-emerald-400">10,550+</div>
                  <span className="text-[10px] text-white/30 block">Anonymous web traffic</span>
                </div>

                {/* Card 2: Active Submissions */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Crop Captured Events</span>
                  <div className="text-2xl font-extrabold text-primary">942</div>
                  <span className="text-[10px] text-white/30 block">Photo upload events logged</span>
                </div>

                {/* Card 3: Wallet Cashouts */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Redemption Transactions</span>
                  <div className="text-2xl font-extrabold text-blue-400">637</div>
                  <span className="text-[10px] text-white/30 block">Airtime, Vouchers & M-Pesa</span>
                </div>
              </div>

              {/* Page Views Details List */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Traffic per Route / Event</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50">
                        <th className="pb-3 font-semibold">Route / Event Name</th>
                        <th className="pb-3 font-semibold">Event Type</th>
                        <th className="pb-3 font-semibold text-right">Total Event Counts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { route: "/", type: "Page View", count: "5,200" },
                        { route: "/how-it-works", type: "Page View", count: "1,400" },
                        { route: "/for-farmers", type: "Page View", count: "3,100" },
                        { route: "/for-partners", type: "Page View", count: "850" },
                        { route: "crop_submission_captured", type: "User Click / Action", count: "942" },
                        { route: "wallet_redeem_airtime", type: "User Click / Action", count: "432" },
                        { route: "wallet_redeem_voucher", type: "User Click / Action", count: "120" },
                        { route: "wallet_redeem_mpesa", type: "User Click / Action", count: "85" },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono text-white/80">{item.route}</td>
                          <td className="py-3 text-white/60">{item.type}</td>
                          <td className="py-3 font-bold text-emerald-400 text-right">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "warning" && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Threshold Register & Leading Indicators</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40">
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4 text-right">Live Value</th>
                        <th className="py-3 px-4 text-right">Threshold</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Protective Action</th>
                        <th className="py-3 px-4">Owner</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thresholds.map((t) => (
                        <tr key={t.metric} className="border-b border-white/5 hover:bg-white/[0.02] text-white/80">
                          <td className="py-3 px-4 font-bold text-primary">{t.metric}</td>
                          <td className="py-3 px-4 text-right font-bold text-white">{t.currentValue !== undefined ? t.currentValue.toFixed(4) : "0.00"}</td>
                          <td className="py-3 px-4 text-right font-bold text-white/70">{t.thresholdValue !== undefined ? t.thresholdValue.toFixed(4) : "0.00"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                              t.currentStatus === "breached" 
                                ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {t.currentStatus?.toUpperCase() || "NORMAL"}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-white/60" title={t.protectiveAction}>{t.protectiveAction}</td>
                          <td className="py-3 px-4 text-white/70">{t.ownerName}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setEditingThreshold(t);
                                setEditLimit(String(t.thresholdValue));
                                setEditAction(t.protectiveAction);
                                setEditOwner(t.ownerName);
                              }}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/15 text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all active:scale-95"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                      {thresholds.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-white/40 font-mono">No thresholds configured.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Threshold Form Modal Overlay */}
              {editingThreshold && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0c0c1e] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <h3 className="text-sm font-bold text-white">Edit Threshold: <span className="text-primary font-mono">{editingThreshold.metric}</span></h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-white/60 mb-1 font-mono">Limit Threshold Value</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-1 font-mono">Protective Action</label>
                        <input
                          type="text"
                          value={editAction}
                          onChange={(e) => setEditAction(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-1 font-mono">Named Owner</label>
                        <input
                          type="text"
                          value={editOwner}
                          onChange={(e) => setEditOwner(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                      <button
                        onClick={() => setEditingThreshold(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateThreshold(editingThreshold.metric)}
                        className="px-4 py-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulation Metric Injector */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Simulation Test Metric Injector</h3>
                <div className="flex flex-wrap gap-4 items-end text-xs">
                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Select Metric</label>
                    <select
                      value={injectMetric}
                      onChange={(e) => setInjectMetric(e.target.value)}
                      className="bg-[#0c0c1e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 font-mono"
                    >
                      <option value="verification_failure_rate">verification_failure_rate</option>
                      <option value="airtime_balance">airtime_balance</option>
                      <option value="queue_backlog">queue_backlog</option>
                      <option value="mirror_node_lag">mirror_node_lag</option>
                      <option value="api_error_rate">api_error_rate</option>
                      <option value="agent_submission_cadence">agent_submission_cadence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Value to Inject</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 0.45"
                      value={injectValue}
                      onChange={(e) => setInjectValue(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono w-40 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <button
                    onClick={handleInjectMetric}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    Inject & Run Detector
                  </button>
                </div>
              </div>

              {/* Authenticated Alerts Log */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Cryptographically Authenticated Alert Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4 text-right">Threshold</th>
                        <th className="py-3 px-4 text-right">Value</th>
                        <th className="py-3 px-4">Alert Message</th>
                        <th className="py-3 px-4 text-center">Auth Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a) => (
                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02] text-white/80">
                          <td className="py-3 px-4 text-white/40">{new Date(a.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 text-primary font-bold">{a.metricName}</td>
                          <td className="py-3 px-4 text-right font-bold text-white/70">{a.thresholdValue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-red-400 font-bold">{a.currentValue.toFixed(2)}</td>
                          <td className="py-3 px-4 max-w-sm truncate text-white/60" title={a.message}>{a.message}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold" title={`HMAC: ${a.signature}`}>
                              ✓ AUTHENTICATED
                            </span>
                          </td>
                        </tr>
                      ))}
                      {alerts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-white/40 font-mono">No warning alerts logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-6">
              {/* Alert Composer Form */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-sm font-bold text-white mb-4">Bayesian Climate Alert Composer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-white/60 mb-1">Target Type</label>
                    <select
                      value={alertTarget}
                      onChange={(e) => setAlertTarget(e.target.value as any)}
                      className="w-full bg-[#0c0c1e] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                    >
                      <option value="county">By County (Bulk)</option>
                      <option value="farmer">By Specific Farmer</option>
                    </select>
                  </div>

                  {alertTarget === "county" ? (
                    <div>
                      <label className="block text-white/60 mb-1 font-mono">Select County</label>
                      <select
                        value={alertTargetCounty}
                        onChange={(e) => setAlertTargetCounty(e.target.value)}
                        className="w-full bg-[#0c0c1e] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                      >
                        <option value="Kilifi">Kilifi</option>
                        <option value="Nyeri">Nyeri</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Nakuru">Nakuru</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-white/60 mb-1 font-mono">Select Farmer</label>
                      <select
                        value={alertTargetUser}
                        onChange={(e) => setAlertTargetUser(e.target.value)}
                        className="w-full bg-[#0c0c1e] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                      >
                        <option value="">-- Choose Farmer --</option>
                        {users.filter(u => u.role === "farmer").map(u => (
                          <option key={u.id} value={u.id}>{u.full_name} ({u.county || "No County"})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Climate Metric</label>
                    <input
                      type="text"
                      placeholder="e.g. rainfall, wind, temperature"
                      value={alertMetric}
                      onChange={(e) => setAlertMetric(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Unit of Measurement</label>
                    <input
                      type="text"
                      placeholder="e.g. mm, km/h, °C"
                      value={alertUnit}
                      onChange={(e) => setAlertUnit(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Bayesian Probability (%)</label>
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={alertProbability}
                      onChange={(e) => setAlertProbability(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Credible Interval: Low Bound</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      value={alertLowInterval}
                      onChange={(e) => setAlertLowInterval(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Credible Interval: High Bound</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={alertHighInterval}
                      onChange={(e) => setAlertHighInterval(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-mono">Model Confidence Level</label>
                    <select
                      value={alertConfidence}
                      onChange={(e) => setAlertConfidence(e.target.value as any)}
                      className="w-full bg-[#0c0c1e] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono"
                    >
                      <option value="high">High Confidence (Firm Guidance)</option>
                      <option value="low">Low Confidence (Tentative Guidance)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-white/60 mb-1 font-mono">One Clear Protective Action</label>
                    <input
                      type="text"
                      placeholder="e.g. dig drainage channels, harvest early, cover nursery beds"
                      value={alertAction}
                      onChange={(e) => setAlertAction(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-white/60 mb-1 font-mono">Escalation Trigger Condition</label>
                    <input
                      type="text"
                      placeholder="e.g. rainfall probability exceeds 90% or wind speeds top 60km/h"
                      value={alertEscalation}
                      onChange={(e) => setAlertEscalation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSendClimateAlert}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/10 transition-all active:scale-95 text-xs"
                  >
                    Compose & Dispatch Alert
                  </button>
                </div>
              </div>

              {/* Farmers Settings Table */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Farmer Alerts Preference Settings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40">
                        <th className="py-3 px-4">Farmer Name</th>
                        <th className="py-3 px-4">County</th>
                        <th className="py-3 px-4">Language</th>
                        <th className="py-3 px-4">Telegram ID</th>
                        <th className="py-3 px-4 text-center">Alerts Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === "farmer").map((f) => (
                        <tr key={f.id} className="border-b border-white/5 hover:bg-white/[0.02] text-white/80 animate-fade-in">
                          <td className="py-3 px-4 font-bold text-white">{f.full_name}</td>
                          <td className="py-3 px-4 text-white/60">{f.county || "N/A"}</td>
                          <td className="py-3 px-4 text-white/60">{f.language?.toUpperCase() || "SW"}</td>
                          <td className="py-3 px-4 text-white/40">{f.telegram_id || "None"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                              f.alerts_enabled !== false 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {f.alerts_enabled !== false ? "ENABLED (OPT-IN)" : "DISABLED (OPT-OUT)"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleFarmerAlert(f.id, f.alerts_enabled !== false)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                f.alerts_enabled !== false 
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              }`}
                            >
                              {f.alerts_enabled !== false ? "Opt-Out" : "Opt-In"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Climate Alerts Log Panel */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Farmers Climate Alerts Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40">
                        <th className="py-3 px-4">Date/Time</th>
                        <th className="py-3 px-4">Farmer</th>
                        <th className="py-3 px-4">County</th>
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">Delivery Status</th>
                        <th className="py-3 px-4">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerAlertsHistory.map((a) => (
                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02] text-white/80 animate-fade-in">
                          <td className="py-3 px-4 text-white/40">{new Date(a.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 font-bold text-white">{a.farmerName}</td>
                          <td className="py-3 px-4 text-white/60">{a.county}</td>
                          <td className="py-3 px-4 text-primary font-bold">{a.metric} ({a.probabilityEstimate}%)</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.confidenceLevel === "high" 
                                ? "bg-emerald-500/20 text-emerald-400" 
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {a.confidenceLevel?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-xl text-[9px] font-bold ${
                              a.status === "sent" 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : a.status === "rate_limited" 
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {a.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-sm truncate text-white/60" title={a.message}>{a.message}</td>
                        </tr>
                      ))}
                      {farmerAlertsHistory.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-white/40">No alerts logged yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ADMIN MANAGEMENT TAB ==================== */}
          {activeTab === "admin-mgmt" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Admin Management</h2>
                <p className="text-xs text-white/40 font-mono">Superadmin access required for mutations</p>
              </div>

              {adminMgmtMsg && (
                <div className={`rounded-xl p-3 text-sm font-medium ${adminMgmtMsg.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {adminMgmtMsg.text}
                </div>
              )}

              {/* Sub-tabs */}
              <div className="flex gap-2 border-b border-white/5 pb-2">
                {(["admins", "ip", "audit"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAdminMgmtSubTab(t)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      adminMgmtSubTab === t ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {t === "admins" ? "Admin Users" : t === "ip" ? "IP Allowlist" : "Audit Log"}
                  </button>
                ))}
              </div>

              {/* ---- ADMINS sub-tab ---- */}
              {adminMgmtSubTab === "admins" && (
                <div className="space-y-6">
                  {/* List */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Name / Email</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Role</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Status</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">2FA</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Last Login</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminList.map((adm) => (
                          <tr key={adm.id} className="border-b border-white/5 hover:bg-white/3">
                            <td className="py-3 px-3">
                              <p className="font-semibold text-white">{adm.name}</p>
                              <p className="text-white/40 font-mono">{adm.email}</p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                adm.role === "superadmin" ? "bg-purple-500/20 text-purple-400" :
                                adm.role === "admin" ? "bg-blue-500/20 text-blue-400" :
                                "bg-white/10 text-white/60"
                              }`}>{adm.role}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold uppercase ${
                                adm.status === "active" ? "text-emerald-400" : "text-red-400"
                              }`}>{adm.status}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold ${adm.totp_enabled ? "text-emerald-400" : "text-white/30"}`}>
                                {adm.totp_enabled ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-white/40 font-mono">
                              {adm.last_login_at ? new Date(adm.last_login_at).toLocaleString() : "Never"}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Toggle status for ${adm.email}?`)) return;
                                    setAdminMgmtLoading(true);
                                    const newStatus = adm.status === "active" ? "disabled" : "active";
                                    const r = await authenticatedFetch(`/api/admin/management/admins/${adm.id}/status`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ status: newStatus }),
                                    });
                                    const j = r ? await r.json() : null;
                                    setAdminMgmtLoading(false);
                                    setAdminMgmtMsg(j?.success ? { type: "ok", text: `Admin ${newStatus}.` } : { type: "err", text: j?.error?.message || "Failed." });
                                    if (j?.success) loadTabData();
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    adm.status === "active" ? "bg-red-500/15 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30"
                                  }`}
                                >
                                  {adm.status === "active" ? "Disable" : "Enable"}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Reset password for ${adm.email}?`)) return;
                                    setAdminMgmtLoading(true);
                                    const r = await authenticatedFetch(`/api/admin/management/admins/${adm.id}/reset-password`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({}),
                                    });
                                    const j = r ? await r.json() : null;
                                    setAdminMgmtLoading(false);
                                    if (j?.success) {
                                      setAdminMgmtMsg({ type: "ok", text: `Temporary password: ${j.temporaryPassword} — share securely and delete this message.` });
                                    } else {
                                      setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Failed." });
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/30"
                                >
                                  Reset Pwd
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {adminList.length === 0 && (
                          <tr><td colSpan={6} className="py-4 text-center text-white/30">No admin accounts found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Admin Form */}
                  <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white">Create New Admin</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Email</label>
                        <input value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          placeholder="admin@diraafrica.org" type="email" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Full Name</label>
                        <input value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          placeholder="Jane Mwangi" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Role</label>
                        <select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50">
                          <option value="admin">admin</option>
                          <option value="editor">editor</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Temporary Password</label>
                        <input value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          placeholder="Min 12 chars, mixed" type="password" />
                      </div>
                    </div>
                    <button
                      disabled={adminMgmtLoading}
                      onClick={async () => {
                        setAdminMgmtLoading(true);
                        const r = await authenticatedFetch("/api/admin/management/admins", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: newAdminEmail, name: newAdminName, role: newAdminRole, password: newAdminPassword }),
                        });
                        const j = r ? await r.json() : null;
                        setAdminMgmtLoading(false);
                        if (j?.success) {
                          setAdminMgmtMsg({ type: "ok", text: `Admin '${j.admin.email}' created. They must change their password on first login.` });
                          setNewAdminEmail(""); setNewAdminName(""); setNewAdminPassword("");
                          loadTabData();
                        } else {
                          setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Failed." });
                        }
                      }}
                      className="px-5 py-2 bg-primary hover:bg-primary/80 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      {adminMgmtLoading ? "Creating…" : "Create Admin"}
                    </button>
                  </div>

                  {/* TOTP Setup */}
                  <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white">My 2-FA (TOTP) Setup</h3>
                    <p className="text-xs text-white/40">Set up or refresh your TOTP authenticator. Scan the URI with Google Authenticator or Authy.</p>
                    {!totpSetupData ? (
                      <button
                        onClick={async () => {
                          const r = await authenticatedFetch("/api/admin/management/me/totp/setup", { method: "POST" });
                          const j = r ? await r.json() : null;
                          if (j?.success) setTotpSetupData({ secret: j.secret, uri: j.uri });
                          else setAdminMgmtMsg({ type: "err", text: "Failed to initialize TOTP." });
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                      >Initialize TOTP</button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-mono bg-black/30 rounded-xl p-3 break-all text-emerald-300">
                          Secret: {totpSetupData.secret}
                        </p>
                        <p className="text-[10px] text-white/40 break-all">{totpSetupData.uri}</p>
                        <div className="flex gap-2">
                          <input value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
                            placeholder="6-digit code from app" maxLength={6}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 w-40" />
                          <button
                            onClick={async () => {
                              const r = await authenticatedFetch("/api/admin/management/me/totp/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ code: totpCode }),
                              });
                              const j = r ? await r.json() : null;
                              if (j?.success) {
                                setAdminMgmtMsg({ type: "ok", text: "TOTP enabled successfully! ✓" });
                                setTotpSetupData(null); setTotpCode("");
                              } else {
                                setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Verification failed." });
                              }
                            }}
                            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white font-bold text-xs rounded-xl"
                          >Verify & Enable</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---- IP ALLOWLIST sub-tab ---- */}
              {adminMgmtSubTab === "ip" && (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Label</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">CIDR (Masked)</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Status</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Added</th>
                          <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ipAllowlist.map((ip) => (
                          <tr key={ip.id} className="border-b border-white/5 hover:bg-white/3">
                            <td className="py-3 px-3 font-semibold text-white">{ip.label}</td>
                            <td className="py-3 px-3 font-mono text-white/60">{ip.cidr}</td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold uppercase ${ip.active ? "text-emerald-400" : "text-red-400"}`}>
                                {ip.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-white/40 font-mono">
                              {new Date(ip.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={async () => {
                                    const r = await authenticatedFetch(`/api/admin/management/ip-allowlist/reveal/${ip.id}`, { method: "POST" });
                                    const j = r ? await r.json() : null;
                                    if (j?.success) alert(`Full CIDR: ${j.cidr}`);
                                    else setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Reveal failed." });
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-white/60 hover:bg-white/20"
                                >Reveal</button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`Remove IP allowlist entry '${ip.label}'?`)) return;
                                    const r = await authenticatedFetch(`/api/admin/management/ip-allowlist/${ip.id}`, { method: "DELETE" });
                                    const j = r ? await r.json() : null;
                                    if (j?.success) { setAdminMgmtMsg({ type: "ok", text: "Entry removed." }); loadTabData(); }
                                    else setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Failed." });
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400 hover:bg-red-500/30"
                                >Remove</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {ipAllowlist.length === 0 && (
                          <tr><td colSpan={5} className="py-4 text-center text-white/30">No allowlist entries. All IPs allowed by default.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add IP Form */}
                  <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white">Add IP / CIDR</h3>
                    <p className="text-xs text-white/40">Once any entry is added, ALL admin routes require a matching IP. Add your IP first.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">CIDR</label>
                        <input value={newIpCidr} onChange={(e) => setNewIpCidr(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          placeholder="203.0.113.0/24" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-white/40">Label</label>
                        <input value={newIpLabel} onChange={(e) => setNewIpLabel(e.target.value)}
                          className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          placeholder="Nairobi Office" />
                      </div>
                    </div>
                    <button
                      disabled={adminMgmtLoading}
                      onClick={async () => {
                        setAdminMgmtLoading(true);
                        const r = await authenticatedFetch("/api/admin/management/ip-allowlist", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ cidr: newIpCidr, label: newIpLabel }),
                        });
                        const j = r ? await r.json() : null;
                        setAdminMgmtLoading(false);
                        if (j?.requireConfirmation) {
                          if (confirm(j.message)) {
                            const r2 = await authenticatedFetch("/api/admin/management/ip-allowlist", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ cidr: newIpCidr, label: newIpLabel, confirmed: true }),
                            });
                            const j2 = r2 ? await r2.json() : null;
                            if (j2?.success) { setAdminMgmtMsg({ type: "ok", text: "IP added." }); setNewIpCidr(""); setNewIpLabel(""); loadTabData(); }
                            else setAdminMgmtMsg({ type: "err", text: j2?.error?.message || "Failed." });
                          }
                        } else if (j?.success) {
                          setAdminMgmtMsg({ type: "ok", text: "IP entry added." });
                          setNewIpCidr(""); setNewIpLabel("");
                          loadTabData();
                        } else {
                          setAdminMgmtMsg({ type: "err", text: j?.error?.message || "Failed." });
                        }
                      }}
                      className="px-5 py-2 bg-primary hover:bg-primary/80 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                    >
                      {adminMgmtLoading ? "Adding…" : "Add CIDR"}
                    </button>
                  </div>
                </div>
              )}

              {/* ---- AUDIT LOG sub-tab ---- */}
              {adminMgmtSubTab === "audit" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">When</th>
                        <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Actor</th>
                        <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Action</th>
                        <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">Target</th>
                        <th className="text-left py-2 px-3 text-white/40 font-mono uppercase">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/3">
                          <td className="py-2 px-3 text-white/40 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <p className="text-white font-semibold">{log.actor_name}</p>
                            <p className="text-white/40">{log.actor_email}</p>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 text-white/70 font-mono text-[10px]">{log.action}</span>
                          </td>
                          <td className="py-2 px-3 text-white/60 font-mono max-w-xs truncate" title={log.target}>{log.target}</td>
                          <td className="py-2 px-3 text-white/40 font-mono">{log.ip}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-center text-white/30">No audit events recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== BLOG TAB ==================== */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Blog Publishing</h2>
                <div className="flex gap-2">
                  <button onClick={() => { setBlogSubTab("list"); setEditingPost(null); setBlogForm({ title: "", excerpt: "", body: "", cover_image_url: "", status: "draft", meta_title: "", meta_description: "" }); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${blogSubTab === "list" ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"}`}
                  >All Posts</button>
                  <button onClick={() => { setBlogSubTab("editor"); setEditingPost(null); setBlogForm({ title: "", excerpt: "", body: "", cover_image_url: "", status: "draft", meta_title: "", meta_description: "" }); }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${blogSubTab === "editor" ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"}`}
                  >+ New Post</button>
                </div>
              </div>

              {blogMsg && (
                <div className={`rounded-xl p-3 text-sm font-medium ${blogMsg.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {blogMsg.text}
                </div>
              )}

              {/* ---- Post List ---- */}
              {blogSubTab === "list" && (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-2xl p-4 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                            post.status === "published" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                          }`}>{post.status}</span>
                          {post.published_at && (
                            <span className="text-[10px] text-white/30 font-mono">{new Date(post.published_at).toLocaleDateString()}</span>
                          )}
                        </div>
                        <p className="font-semibold text-white text-sm truncate">{post.title}</p>
                        <p className="text-xs text-white/40 truncate">{post.excerpt}</p>
                        <p className="text-[10px] text-white/25 font-mono mt-0.5">/{post.slug} · by {post.author_name}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setBlogForm({
                              title: post.title,
                              excerpt: post.excerpt || "",
                              body: post.body || "",
                              cover_image_url: post.cover_image_url || "",
                              status: post.status,
                              meta_title: post.meta_title || "",
                              meta_description: post.meta_description || "",
                            });
                            setBlogSubTab("editor");
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
                        >Edit</button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete post '${post.title}'? This cannot be undone.`)) return;
                            setBlogLoading(true);
                            const r = await authenticatedFetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
                            const j = r ? await r.json() : null;
                            setBlogLoading(false);
                            if (j?.success) { setBlogMsg({ type: "ok", text: "Post deleted." }); loadTabData(); }
                            else setBlogMsg({ type: "err", text: j?.error?.message || "Failed to delete." });
                          }}
                          className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold rounded-xl"
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                  {blogPosts.length === 0 && (
                    <div className="text-center py-12 text-white/30">
                      <p className="text-lg">No blog posts yet.</p>
                      <p className="text-xs mt-1">Click &ldquo;+ New Post&rdquo; to write your first article.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Post Editor ---- */}
              {blogSubTab === "editor" && (
                <div className="space-y-5">
                  {editingPost && (
                    <p className="text-xs text-white/40 font-mono">Editing: <span className="text-white">{editingPost.slug}</span></p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">Title *</label>
                      <input value={blogForm.title} onChange={(e) => setBlogForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        placeholder="How Dira Helps Kenyan Farmers" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">Status</label>
                      <select value={blogForm.status} onChange={(e) => setBlogForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-white/40">Excerpt *</label>
                      <textarea value={blogForm.excerpt} onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 h-16"
                        placeholder="A short summary shown in listings and search results…" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-white/40">Body (Markdown) *</label>
                      <textarea value={blogForm.body} onChange={(e) => setBlogForm((f) => ({ ...f, body: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 h-64 font-mono"
                        placeholder="Write your article in Markdown…" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">Cover Image URL</label>
                      <input value={blogForm.cover_image_url} onChange={(e) => setBlogForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                        placeholder="https://photos.diraafrica.org/blog-covers/…" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">Upload Cover Image</label>
                      <input type="file" accept="image/jpeg,image/png,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          setBlogLoading(true);
                          try {
                            const r = await fetch(`${API_URL}/api/admin/blog/upload-cover`, {
                              method: "POST",
                              headers: token ? { "Authorization": `Bearer ${token}` } : {},
                              credentials: "include",
                              body: formData,
                            });
                            const j = await r.json();
                            if (j.success) setBlogForm((f) => ({ ...f, cover_image_url: j.url }));
                            else setBlogMsg({ type: "err", text: j.error?.message || "Upload failed." });
                          } catch { setBlogMsg({ type: "err", text: "Upload failed." }); }
                          setBlogLoading(false);
                        }}
                        className="w-full mt-1 text-xs text-white/50 file:bg-white/10 file:text-white file:text-xs file:rounded-lg file:border-0 file:px-3 file:py-1 file:cursor-pointer" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">SEO Title</label>
                      <input value={blogForm.meta_title} onChange={(e) => setBlogForm((f) => ({ ...f, meta_title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                        placeholder="Optional — defaults to title" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40">SEO Description</label>
                      <input value={blogForm.meta_description} onChange={(e) => setBlogForm((f) => ({ ...f, meta_description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                        placeholder="150 chars max for search previews" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={blogLoading}
                      onClick={async () => {
                        setBlogLoading(true);
                        const url = editingPost ? `/api/admin/blog/${editingPost.id}` : "/api/admin/blog/";
                        const method = editingPost ? "PUT" : "POST";
                        const r = await authenticatedFetch(url, {
                          method,
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(blogForm),
                        });
                        const j = r ? await r.json() : null;
                        setBlogLoading(false);
                        if (j?.success) {
                          setBlogMsg({ type: "ok", text: editingPost ? "Post updated!" : `Post '${j.post.slug}' created!` });
                          setEditingPost(j.post);
                          loadTabData();
                        } else {
                          setBlogMsg({ type: "err", text: j?.error?.message || "Failed to save post." });
                        }
                      }}
                      className="px-6 py-2 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-xl disabled:opacity-50"
                    >
                      {blogLoading ? "Saving…" : editingPost ? "Update Post" : "Create Post"}
                    </button>
                    <button
                      onClick={() => { setBlogSubTab("list"); setEditingPost(null); setBlogMsg(null); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-xl"
                    >Cancel</button>
                  </div>
                </div>
              )}
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
