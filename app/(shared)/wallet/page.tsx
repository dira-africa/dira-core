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

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import { getStoredUser, User } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

// Interface definitions
interface BalanceData {
  balance: number;
  kes_equivalent_airtime: number;
  kes_equivalent_cash: number;
  pending_tokens: number;
}

interface Transaction {
  id: string;
  amount: string | number;
  balance_after: string | number;
  transaction_type: string;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

interface RatesData {
  airtime: number;
  voucher: number;
  circle: number;
  mpesa: number;
}

// Localized translations for the wallet component
const walletTranslations = {
  en: {
    title: "Wallet",
    titleSw: "Mkoba",
    balanceLabel: "Climate Tokens Balance",
    estimatedValue: "Estimated Value",
    airtime: "Airtime",
    cash: "Cash",
    pendingLabel: "Pending Verification",
    minNotice: "20 tokens minimum for airtime redemption",
    optionsTitle: "Redemption Options",
    availableNow: "Available now",
    available: "Available",
    comingMonth1: "Coming Month 1",
    comingMonth2: "Coming Month 2",
    comingMonth3_4: "Coming Month 3–4",
    ratesLabel: "1 token = KES",
    historyTitle: "Transaction History",
    historyEmpty: "No transactions recorded yet.",
    earned: "Earned",
    redeemed: "Redeemed",
    pending: "Pending",
    loadMore: "Load More",
    retry: "Try Again",
    home: "Home",
    camera: "Camera",
    reports: "Reports",
    settings: "Settings",
    map: "Map",
    leaders: "Leaders",
    roleFarmer: "Farmer",
    roleAgent: "Data Agent",
    cardAirtimeDesc: "Africa's Talking Instant Airtime",
    cardVoucherDesc: "Agro-dealer farm input vouchers",
    cardCircleDesc: "Community cash distribution pools",
    cardMpesaDesc: "Safaricom B2C M-Pesa cashout",
    comingSoon: "Coming Soon"
  },
  sw: {
    title: "Mkoba",
    titleSw: "Wallet",
    balanceLabel: "Salio la Climate Tokens",
    estimatedValue: "Thamani Inayokadiriwa",
    airtime: "Muda wa Maongezi",
    cash: "Pesa Taslimu",
    pendingLabel: "Zinazosubiri Uhakiki",
    minNotice: "Kiwango cha chini cha kukomboa muda wa maongezi ni tokeni 20",
    optionsTitle: "Njia za Ukaguzi/Ukombozi",
    availableNow: "Inapatikana sasa",
    available: "Inapatikana",
    comingMonth1: "Kuja Mwezi wa 1",
    comingMonth2: "Kuja Mwezi wa 2",
    comingMonth3_4: "Kuja Mwezi wa 3–4",
    ratesLabel: "Tokeni 1 = KES",
    historyTitle: "Historia ya Shughuli",
    historyEmpty: "Hakuna shughuli zilizorekodiwa bado.",
    earned: "Kavuna",
    redeemed: "Kakomboa",
    pending: "Inasubiri",
    loadMore: "Fungua Zaidi",
    retry: "Jaribu Tena",
    home: "Mwanzo",
    camera: "Kamera",
    reports: "Ripoti",
    settings: "Mipangilio",
    map: "Ramani",
    leaders: "Viongozi",
    roleFarmer: "Mkulima",
    roleAgent: "Wakala wa Data",
    cardAirtimeDesc: "Muda wa Maongezi wa Africa's Talking",
    cardVoucherDesc: "Voucher za pembejeo za agro-dealer",
    cardCircleDesc: "Mzunguko wa vikundi vya fedha vya jamii",
    cardMpesaDesc: "Ukombozi wa Safaricom B2C M-Pesa",
    comingSoon: "Hivi Karibuni"
  }
};

export default function WalletPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  
  // Wallet States
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [rates, setRates] = useState<RatesData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active environments flags
  const isVouchersActive = process.env.VOUCHERS_ACTIVE === "true" || process.env.NEXT_PUBLIC_VOUCHERS_ACTIVE === "true";
  const isDiraCircleActive = process.env.DIRA_CIRCLE_ACTIVE === "true" || process.env.NEXT_PUBLIC_DIRA_CIRCLE_ACTIVE === "true";
  const isPretiumActive = false; // Pretium mobile money pending P2.3

  const t = walletTranslations[locale === "sw" ? "sw" : "en"];

  const fetchWalletData = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      if (pageNum === 1) {
        // Concurrently fetch balance, rates, and initial history
        const [balRes, ratesRes, histRes] = await Promise.all([
          apiClient.get<BalanceData & { success: boolean }>("/api/tokens/balance"),
          apiClient.get<RatesData & { success: boolean }>("/api/tokens/rates"),
          apiClient.get<{ success: boolean; transactions: Transaction[]; total: number }>(`/api/tokens/history?page=1&limit=10`)
        ]);

        if (balRes.success) {
          setBalanceData(balRes);
        }
        if (ratesRes.success) {
          setRates(ratesRes);
        }
        if (histRes.success) {
          setTransactions(histRes.transactions);
          setTotalTransactions(histRes.total);
        }
      } else {
        // Fetch next page of history
        const histRes = await apiClient.get<{ success: boolean; transactions: Transaction[]; total: number }>(
          `/api/tokens/history?page=${pageNum}&limit=10`
        );
        if (histRes.success) {
          if (append) {
            setTransactions(prev => [...prev, ...histRes.transactions]);
          } else {
            setTransactions(histRes.transactions);
          }
          setTotalTransactions(histRes.total);
        }
      }
    } catch (err: any) {
      console.error("Wallet data load failed:", err);
      setError(err.message || "Failed to load wallet data.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setUser(getStoredUser());
    fetchWalletData(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWalletData(nextPage, true);
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === "sw") {
      const months = [
        "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", 
        "Jul", "Ago", "Sep", "Okt", "Nov", "Des"
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  // Maps backend types to clean readable UI text
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "crop_photo":
        return locale === "en" ? "Crop Photo Verification" : "Uhakiki wa Picha ya Zao";
      case "atmospheric_sync":
        return locale === "en" ? "Weather Data Sync" : "Usawazishaji wa Hali ya Hewa";
      case "redeem_airtime":
        return locale === "en" ? "Airtime Redemption" : "Ukombozi wa Airtime";
      case "redeem_voucher":
        return locale === "en" ? "Agro-dealer Voucher" : "Voucher ya Agro-dealer";
      case "redeem_circle":
        return locale === "en" ? "Dira Circle Contribution" : "Mchango wa Dira Circle";
      case "redeem_mpesa":
        return locale === "en" ? "M-Pesa Cashout" : "Ulipaji wa M-Pesa";
      case "bonus":
        return locale === "en" ? "Climate Bonus" : "Bonus ya Tabianchi";
      case "adjustment":
        return locale === "en" ? "System Adjustment" : "Marekebisho ya Mfumo";
      default:
        return type;
    }
  };

  if (loading && page === 1) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/10 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-24">
          <div className="animate-pulse flex justify-between items-center py-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-7 w-12 bg-white/10 rounded-xl" />
          </div>
          <div className="animate-pulse bg-primary/20 border border-primary/20 rounded-3xl p-6 h-36" />
          <div className="animate-pulse bg-white/5 border border-white/10 rounded-3xl p-5 h-16" />
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 bg-white/5 rounded-2xl" />
              <div className="h-28 bg-white/5 rounded-2xl" />
              <div className="h-28 bg-white/5 rounded-2xl" />
              <div className="h-28 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center items-center bg-gradient-to-b from-[#0d0d21] to-[#04120f] text-white min-h-screen text-center space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold">
            {locale === "en" ? "Unable to load Wallet" : "Imeshindikana kufungua Mkoba"}
          </h2>
          <p className="text-sm text-white/60 max-w-xs">
            {error}
          </p>
          <button
            onClick={() => fetchWalletData(1)}
            className="px-6 py-2.5 bg-primary hover:bg-[#085a46] active:scale-[0.98] transition-all font-bold text-sm rounded-2xl shadow-lg"
          >
            {t.retry || (locale === "en" ? "Try Again" : "Jaribu Tena")}
          </button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* Header */}
        <header className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1 text-white/60 hover:text-white transition-all text-lg font-bold"
            >
              ←
            </button>
            <h1 className="font-extrabold text-lg tracking-wide text-white leading-tight">
              {t.title}
            </h1>
          </div>

          {/* Localized Language Switcher */}
          <div className="flex space-x-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                locale === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("sw")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                locale === "sw" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              SW
            </button>
          </div>
        </header>

        {/* 1. Balance display Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#052b22] border border-primary/30 rounded-3xl p-6 shadow-2xl">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/60 tracking-widest font-bold uppercase">
                  {t.balanceLabel}
                </p>
                <p className="text-3xl font-black mt-1 tracking-tight text-emerald-50">
                  {balanceData ? balanceData.balance.toFixed(2) : "0.00"} DIRA
                </p>
              </div>
              <span className="text-[9px] bg-white/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {user?.role === "farmer" ? t.roleFarmer : t.roleAgent}
              </span>
            </div>
            
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] text-white/50 font-bold uppercase tracking-wider">
                  {t.estimatedValue} ({t.airtime})
                </p>
                <p className="text-sm font-bold text-white/95 mt-0.5">
                  KES {balanceData ? balanceData.kes_equivalent_airtime.toFixed(2) : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-white/50 font-bold uppercase tracking-wider">
                  {t.estimatedValue} ({t.cash})
                </p>
                <p className="text-sm font-bold text-white/95 mt-0.5">
                  KES {balanceData ? balanceData.kes_equivalent_cash.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>

            {balanceData && balanceData.pending_tokens > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] text-amber-300 font-semibold flex items-center justify-between">
                <span>⏱️ {t.pendingLabel}:</span>
                <span className="font-extrabold">{balanceData.pending_tokens.toFixed(2)} DIRA</span>
              </div>
            )}
          </div>
        </section>

        {/* 2. Minimum redemption notice */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-3 shadow-inner">
          <span className="text-base select-none">⚡</span>
          <p className="text-[11px] text-white/70 font-semibold leading-snug">
            {t.minNotice}
          </p>
        </div>

        {/* 3. Four redemption option cards sorted by rate */}
        <section className="space-y-3">
          <h2 className="text-xs font-black text-primary tracking-widest uppercase pb-1">
            {t.optionsTitle}
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Card 1: Airtime */}
            <div className="bg-[#0A6E56]/10 border border-[#0A6E56]/30 hover:border-[#0A6E56]/50 rounded-2xl p-4 flex justify-between items-center transition-all duration-300 hover:scale-[1.01]">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-extrabold text-[#2ae0ab] uppercase tracking-wider">AIRTIME ⚡</span>
                  <span className="text-[8px] bg-[#0A6E56]/30 border border-[#0A6E56]/40 text-[#2ae0ab] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.availableNow}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">
                  {t.cardAirtimeDesc}
                </p>
                <p className="text-xs font-bold text-white/80">
                  {t.ratesLabel} {rates ? rates.airtime.toFixed(2) : "0.55"}
                </p>
              </div>
              <Link href="/wallet/redeem/airtime">
                <button className="px-4 py-2 bg-[#0A6E56] hover:bg-[#085a46] active:scale-[0.98] rounded-xl text-xs font-black transition-all tracking-wider uppercase">
                  KOMBOA
                </button>
              </Link>
            </div>

            {/* Card 2: Vouchers */}
            <div className={`border rounded-2xl p-4 flex justify-between items-center transition-all duration-300 ${
              isVouchersActive 
                ? "bg-teal-500/10 border-teal-500/30 hover:border-teal-500/50 hover:scale-[1.01]" 
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">FARM INPUTS 🌱</span>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isVouchersActive 
                      ? "bg-teal-500/20 border border-teal-500/30 text-teal-400"
                      : "bg-white/10 text-white/40 border border-white/10"
                  }`}>
                    {isVouchersActive ? t.available : t.comingMonth1}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">
                  {t.cardVoucherDesc}
                </p>
                <p className="text-xs font-bold text-white/80">
                  {t.ratesLabel} {rates ? rates.voucher.toFixed(2) : "0.55"}
                </p>
              </div>
              {isVouchersActive ? (
                <Link href="/wallet/redeem/voucher">
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-xl text-xs font-black transition-all tracking-wider uppercase">
                    KOMBOA
                  </button>
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-white/5 text-white/30 rounded-xl text-xs font-black tracking-wider uppercase cursor-not-allowed">
                  LOCK
                </button>
              )}
            </div>

            {/* Card 3: Circle */}
            <div className={`border rounded-2xl p-4 flex justify-between items-center transition-all duration-300 ${
              isDiraCircleActive 
                ? "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50 hover:scale-[1.01]" 
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">DIRA CIRCLE 👥</span>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isDiraCircleActive 
                      ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                      : "bg-white/10 text-white/40 border border-white/10"
                  }`}>
                    {isDiraCircleActive ? t.available : t.comingMonth2}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">
                  {t.cardCircleDesc}
                </p>
                <p className="text-xs font-bold text-white/80">
                  {t.ratesLabel} {rates ? rates.circle.toFixed(2) : "0.50"}
                </p>
              </div>
              {isDiraCircleActive ? (
                <Link href="/wallet/redeem/circle">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] rounded-xl text-xs font-black transition-all tracking-wider uppercase">
                    KOMBOA
                  </button>
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-white/5 text-white/30 rounded-xl text-xs font-black tracking-wider uppercase cursor-not-allowed">
                  LOCK
                </button>
              )}
            </div>

            {/* Card 4: M-Pesa */}
            <div className={`border rounded-2xl p-4 flex justify-between items-center transition-all duration-300 ${
              isPretiumActive 
                ? "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 hover:scale-[1.01]" 
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider">M-PESA 📱</span>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPretiumActive 
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                      : "bg-white/10 text-white/40 border border-white/10"
                  }`}>
                    {isPretiumActive ? t.available : t.comingSoon}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">
                  {t.cardMpesaDesc}
                </p>
                <p className="text-xs font-bold text-white/80">
                  {t.ratesLabel} {rates ? rates.mpesa.toFixed(2) : "0.50"}
                </p>
              </div>
              {isPretiumActive ? (
                <Link href="/wallet/redeem/mpesa">
                  <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] rounded-xl text-xs font-black transition-all tracking-wider uppercase">
                    KOMBOA
                  </button>
                </Link>
              ) : (
                <button disabled className="px-4 py-2 bg-white/5 text-white/30 rounded-xl text-xs font-black tracking-wider uppercase cursor-not-allowed">
                  LOCK
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 4. Transaction history tab */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
          <h2 className="text-xs font-black text-white/80 tracking-widest uppercase">
            {t.historyTitle}
          </h2>
          
          {transactions.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4">{t.historyEmpty}</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const amountNum = Number(tx.amount);
                const isDebit = amountNum < 0;
                
                // Determine color and indicator labels
                let labelText = isDebit ? t.redeemed : t.earned;
                let textClass = isDebit ? "text-rose-400" : "text-emerald-400";
                let bgBadgeClass = isDebit ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20";
                
                // Override for pending transactions
                const isPending = tx.notes === "pending" || tx.transaction_type === "pending";
                if (isPending) {
                  labelText = t.pending;
                  textClass = "text-amber-400";
                  bgBadgeClass = "bg-amber-500/10 border-amber-500/20";
                }

                return (
                  <div key={tx.id} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-white/90">
                        {getTransactionTypeLabel(tx.transaction_type)}
                      </p>
                      <p className="text-[10px] text-white/40 font-medium">
                        {getFormattedDate(tx.created_at)}
                      </p>
                      {tx.notes && tx.notes !== "pending" && (
                        <p className="text-[9px] text-white/50 italic leading-snug">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${bgBadgeClass} ${textClass}`}>
                        {labelText}
                      </span>
                      <p className={`font-black text-sm tracking-tight mt-1 ${textClass}`}>
                        {amountNum > 0 ? "+" : ""}{amountNum.toFixed(2)} DIRA
                      </p>
                    </div>
                  </div>
                );
              })}

              {transactions.length < totalTransactions && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider text-center"
                >
                  {loadingMore ? "..." : t.loadMore}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#04120f] via-[#04120f]/95 to-[#04120f]/90 border-t border-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 px-6 py-3 flex justify-between items-center select-none">
          {user?.role === "agent" ? (
            <>
              {/* Agent Home */}
              <Link href="/agent/home" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.home}
                </span>
              </Link>
              {/* Agent Map */}
              <Link href="/agent/map" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.map}
                </span>
              </Link>
              {/* Agent Wallet (active) */}
              <div className="flex flex-col items-center space-y-1">
                <svg
                  className="h-5 w-5 text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-primary">
                  {t.title}
                </span>
              </div>
              {/* Agent Leaderboard */}
              <Link href="/agent/leaderboard" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.leaders}
                </span>
              </Link>
              {/* Agent Settings */}
              <Link href="/agent/settings" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.settings}
                </span>
              </Link>
            </>
          ) : (
            <>
              {/* Farmer Home */}
              <Link href="/farmer/home" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.home}
                </span>
              </Link>
              {/* Farmer Camera */}
              <Link href="/farmer/submit" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.camera}
                </span>
              </Link>
              {/* Farmer Wallet (active) */}
              <div className="flex flex-col items-center space-y-1">
                <svg
                  className="h-5 w-5 text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-primary">
                  {t.title}
                </span>
              </div>
              {/* Farmer Reports */}
              <Link href="/farmer/reports" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.reports}
                </span>
              </Link>
              {/* Farmer Settings */}
              <Link href="/farmer/settings" className="flex flex-col items-center space-y-1 group">
                <svg
                  className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[9px] font-extrabold tracking-wide text-white/40">
                  {t.settings}
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </AuthGuard>
  );
}
