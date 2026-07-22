"use client";

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

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser, clearAuth, User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

export default function FarmerSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Climate Warning Alerts preference state
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);

  useEffect(() => {
    setUser(getStoredUser());

    // Fetch latest alerts preference from backend
    apiClient.get<{ success: boolean; user: { alerts_enabled: boolean } }>("/api/users/me")
      .then(res => {
        if (res.success) {
          setAlertsEnabled(res.user.alerts_enabled);
        }
      })
      .catch(err => {
        console.error("Failed to load user alert settings:", err);
      });
  }, []);

  const handleToggleAlerts = async () => {
    try {
      setLoadingAlerts(true);
      setErrorMessage("");
      const nextStatus = !alertsEnabled;
      const res = await apiClient.put<{ success: boolean }>("/api/users/me/alerts", { enabled: nextStatus });
      if (res.success) {
        setAlertsEnabled(nextStatus);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update alert preference.");
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      setErrorMessage("");
      const res = await apiClient.get<{ success: boolean; export: any }>("/api/users/me/export");
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.export, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dira_data_export_${user?.id || "user"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to export data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmCheckbox) return;
    try {
      setDeleting(true);
      setErrorMessage("");
      const res = await apiClient.post<{ success: boolean }>("/api/users/me/delete-request");
      if (res.success) {
        setShowDeleteModal(false);
        clearAuth();
        router.push("/?message=deleted");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to request account deletion.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* Header */}
        <header className="flex items-center space-x-3 py-2 border-b border-white/5">
          <Link href="/farmer/home" className="text-white/60 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="font-extrabold text-lg tracking-wide text-white leading-tight">
            {locale === "en" ? "Settings & Privacy" : "Mipangilio na Faragha"}
          </h1>
        </header>

        {/* User Card */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold">
            👨‍🌾
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">{user?.name || "Farmer"}</p>
            <p className="text-[10px] text-white/50 capitalize font-medium">{user?.role || "farmer"}</p>
          </div>
        </div>

        {/* Data Protection Information Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-primary tracking-widest uppercase">
            {locale === "en" ? "Kenya DPA 2019 Compliance" : "Utekelezaji wa Kenya DPA 2019"}
          </h2>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-5">
            {/* ODPC Registration Number */}
            <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3.5 rounded-2xl">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-none">
                  {locale === "en" ? "ODPC Registration Ref" : "Nambari ya Usajili ya ODPC"}
                </p>
                <p className="text-sm font-black text-white tracking-wide">ODPC/REG/2026/084920</p>
              </div>
              <span className="text-[9px] bg-primary/20 border border-primary/30 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {locale === "en" ? "Registered" : "Sajili"}
              </span>
            </div>

            {/* What Data We Collect */}
            <div className="space-y-1.5 text-left">
              <h3 className="text-xs font-bold text-white/80">
                {locale === "en" ? "1. What data we collect and why" : "1. Data tunayokusanya na kwa nini"}
              </h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {locale === "en"
                  ? "We collect your phone number (securely encrypted using pgcrypto) to verify and process mobile airtime, agro-dealer vouchers, and M-Pesa payouts. We also collect crop photos, growth stage, and GPS coordinates to verify agricultural status and calculate rewards."
                  : "Tunakusanya nambari yako ya simu (iliyosimbwa kwa usalama kwa kutumia pgcrypto) ili kuthibitisha na kuchakata salio, vocha, na malipo ya M-Pesa. Tunakusanya pia picha za mazao na eneo la GPS ili kuthibitisha mazao na kuhesabu tokens."}
              </p>
            </div>

            {/* Data Retention */}
            <div className="space-y-1.5 text-left">
              <h3 className="text-xs font-bold text-white/80">
                {locale === "en" ? "2. How long we keep your data" : "2. Muda tunavyohifadhi data yako"}
              </h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {locale === "en"
                  ? "Your personal data is retained as long as your account is active. If you request account deletion, all PII (name, phone, telegram details) is anonymised and crop photos are deleted after a 30-day grace period. Anonymised transaction ledgers and readings are kept permanently for blockchain anchoring and financial audit purposes."
                  : "Data yako ya kibinafsi huhifadhiwa wakati akaunti yako iko hai. Ukiiomba ifutwe, maelezo yote ya kibinafsi yanabadilishwa na picha kufutwa baada ya siku 30. Kumbukumbu za miamala zisizotambulika huhifadhiwa daima kwa ukaguzi wa kifedha."}
              </p>
            </div>
          </div>
        </section>

        {/* Preference Settings */}
        <section className="space-y-3">
          <h2 className="text-xs font-black text-primary tracking-widest uppercase">
            {locale === "en" ? "Preferences" : "Mipangilio ya Tahadhari"}
          </h2>

          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
            <div className="space-y-0.5 text-left">
              <span className="text-white text-xs font-extrabold">
                {locale === "en" ? "Climate Warning Alerts" : "Tahadhari za Hali ya Hewa"}
              </span>
              <p className="text-[10px] text-white/40 font-medium">
                {locale === "en"
                  ? "Receive early climate warning alerts via Telegram"
                  : "Pokea tahadhari za hewa mapema kupitia Telegram"}
              </p>
            </div>
            <button
              onClick={handleToggleAlerts}
              disabled={loadingAlerts}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${
                alertsEnabled ? "bg-[#0A6E56]" : "bg-white/10"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  alertsEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Data Actions (Export & Delete) */}
        <section className="space-y-3">
          <h2 className="text-xs font-black text-primary tracking-widest uppercase">
            {locale === "en" ? "Data Controls" : "Udhibiti wa Data"}
          </h2>

          <div className="space-y-2">
            {/* Export Personal Data Button */}
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.99] transition-all rounded-2xl text-xs font-bold text-left"
            >
              <div className="space-y-0.5">
                <span className="text-white text-xs font-extrabold">
                  {locale === "en" ? "Export My Data" : "Safirisha Data Yangu"}
                </span>
                <p className="text-[10px] text-white/40 font-medium">
                  {locale === "en" ? "Download your profile and history in JSON format" : "Pakua wasifu wako na historia katika muundo wa JSON"}
                </p>
              </div>
              <span>{exporting ? "⏳" : "📥"}</span>
            </button>

            {/* Delete Account Request Button */}
            <button
              onClick={() => {
                setErrorMessage("");
                setConfirmCheckbox(false);
                setShowDeleteModal(true);
              }}
              className="w-full flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 active:scale-[0.99] transition-all rounded-2xl text-xs font-bold text-left text-rose-400"
            >
              <div className="space-y-0.5">
                <span className="text-rose-400 text-xs font-extrabold">
                  {locale === "en" ? "Delete My Account" : "Futa Akaunti Yangu"}
                </span>
                <p className="text-[10px] text-rose-400/50 font-medium">
                  {locale === "en" ? "Mark your profile for deletion in 30 days" : "Weka wasifu wako kwa ajili ya kufutwa baada ya siku 30"}
                </p>
              </div>
              <span>🗑️</span>
            </button>
          </div>
        </section>

        {errorMessage && (
          <p className="text-xs font-semibold text-red-400 text-center">{errorMessage}</p>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0e0e26] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-6 text-center shadow-2xl relative">
              <h3 className="text-lg font-black text-rose-400">
                {locale === "en" ? "Account Deletion Request" : "Ombi la Kufuta Akaunti"}
              </h3>
              
              <div className="text-xs text-white/60 space-y-3 leading-relaxed text-left">
                <p>
                  {locale === "en"
                    ? "Warning: Your account will be queued for deletion in 30 days."
                    : "Ilani: Akaunti yako itawekwa kwenye foleni ya kufutwa baada ya siku 30."}
                </p>
                <p>
                  {locale === "en"
                    ? "During this 30-day grace period, you can cancel this request by logging back in. After 30 days, your name, phone number, and telegram ID will be completely anonymised, and all crop submissions will be deleted from storage."
                    : "Wakati wa siku hizi 30, unaweza kughairi ombi hili kwa kuingia tena. Baada ya siku 30, maelezo yako ya simu na jina yatafutwa kabisa."}
                </p>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-white/5 text-rose-500 focus:ring-rose-500 focus:ring-offset-[#0e0e26]"
                />
                <span className="text-[11px] leading-tight text-white/80 select-none">
                  {locale === "en"
                    ? "I understand that my PII will be anonymised, and my photos will be permanently deleted after 30 days."
                    : "Naelewa kuwa maelezo yangu ya kibinafsi yatafutwa, na picha zangu kufutwa kabisa baada ya siku 30."}
                </span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold"
                >
                  {locale === "en" ? "Cancel" : "Ghairi"}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!confirmCheckbox || deleting}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    confirmCheckbox && !deleting
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 cursor-pointer"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {deleting
                    ? (locale === "en" ? "Deleting..." : "Inafuta...")
                    : (locale === "en" ? "Confirm Delete" : "Thibitisha Kufuta")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#04120f] via-[#04120f]/95 to-[#04120f]/90 border-t border-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 px-6 py-3 flex justify-between items-center select-none">
          <Link href="/farmer/home" className="flex flex-col items-center space-y-1 group">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Home" : "Mwanzo"}
            </span>
          </Link>

          <Link href="/farmer/submit" className="flex flex-col items-center space-y-1 group">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Camera" : "Kamera"}
            </span>
          </Link>

          <Link href="/wallet" className="flex flex-col items-center space-y-1 group">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Wallet" : "Mkoba"}
            </span>
          </Link>

          <Link href="/farmer/reports" className="flex flex-col items-center space-y-1 group">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Reports" : "Ripoti"}
            </span>
          </Link>

          <Link href="/farmer/settings" className="flex flex-col items-center space-y-1 group">
            <svg className="h-5 w-5 transition-transform group-hover:scale-110 text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-primary">
              {locale === "en" ? "Settings" : "Mipangilio"}
            </span>
          </Link>
        </nav>
      </div>
    </AuthGuard>
  );
}
