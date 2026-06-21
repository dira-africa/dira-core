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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

// Interface definitions
interface Dealer {
  id: string;
  name: string;
  county: string;
  logoUrl: string | null;
  categories: string[];
}

interface DealersResponse {
  success: boolean;
  dealers: Dealer[];
}

interface BalanceData {
  balance: number;
}

interface VoucherResponse {
  success: boolean;
  qrDataUrl: string;
  voucherCode: string;
  kesValue: number;
  expiresAt: string;
}

// Local translation dictionary
const voucherTranslations = {
  en: {
    back: "Back",
    redeemTitle: "Redeem Voucher",
    balance: "Climate Token Balance",
    step1Title: "Select an Agro-dealer",
    step1Desc: "Choose an active agro-dealer partner to redeem your Climate Tokens for farm input vouchers.",
    searchPlaceholder: "Search agro-dealers...",
    allCategories: "All Categories",
    step2Title: "Enter Redemption Details",
    step2Desc: "Convert your Climate Tokens into farm input vouchers at a rate of 1 DIRA = KES 0.55.",
    selectedDealer: "Selected Dealer",
    tokenAmountLabel: "Select Token Amount",
    customAmount: "Custom Amount (Min 50)",
    kesEquivalent: "You will receive a voucher of KES {amount}",
    buttonRedeem: "Redeem Voucher",
    confirmTitle: "Confirm Redemption",
    confirmDesc: "Please verify the redemption details below before generating your voucher.",
    confirmPrompt: "Generate a KES {kes} voucher for {dealer}",
    deductionWarning: "Tokens will be deducted immediately. Show the QR code to the agro-dealer to scan within 48 hours.",
    buttonConfirm: "Confirm & Generate",
    buttonCancel: "Cancel",
    processingTitle: "Generating Voucher...",
    processingDesc: "Deducting tokens and generating your secure, signed QR code voucher...",
    successTitle: "Voucher Generated!",
    successDesc: "Your farm input voucher has been generated successfully. Show this QR code to the dealer contact at checkout.",
    kesValue: "Voucher Value",
    voucherCode: "Voucher Code",
    expiresIn: "Expires In",
    expiresAtLabel: "Expires At",
    buttonDone: "Return to Wallet",
    failureTitle: "Generation Failed",
    failureDesc: "The voucher could not be generated at this time.",
    failureReason: "Reason",
    refundNotice: "Your tokens have been automatically refunded to your wallet ledger.",
    buttonRetry: "Try Again",
    insufficientBalance: "Insufficient token balance.",
    minTokensError: "Minimum redemption is 50 Climate Tokens.",
    noDealersFound: "No agro-dealers found matching your search.",
  },
  sw: {
    back: "Rudi",
    redeemTitle: "Komboa Voucher",
    balance: "Salio la Climate Token",
    step1Title: "Chagua Agro-dealer",
    step1Desc: "Chagua mshirika hai wa agro-dealer ili kukomboa Climate Tokens zako kwa voucher za pembejeo za shamba.",
    searchPlaceholder: "Tafuta agro-dealers...",
    allCategories: "Kategoria Zote",
    step2Title: "Weka Maelezo ya Ukombozi",
    step2Desc: "Badilisha Climate Tokens zako kuwa voucher za pembejeo kwa kiwango cha 1 DIRA = KES 0.55.",
    selectedDealer: "Muuzaji Aliyechaguliwa",
    tokenAmountLabel: "Chagua Kiasi cha Tokeni",
    customAmount: "Kiasi Unachotaka (Kima cha chini 50)",
    kesEquivalent: "Utapokea voucher ya KES {amount}",
    buttonRedeem: "Komboa Voucher",
    confirmTitle: "Thibitisha Ukombozi",
    confirmDesc: "Tafadhali kagua maelezo ya ukombozi hapa chini kabla ya kutoa voucher yako.",
    confirmPrompt: "Tengeneza voucher ya KES {kes} ya {dealer}",
    deductionWarning: "Tokeni zitakatwa mara moja. Onyesha msimbo wa QR kwa agro-dealer ili aupime ndani ya saa 48.",
    buttonConfirm: "Thibitisha na Utengeneze",
    buttonCancel: "Ghairi",
    processingTitle: "Inatengeneza Voucher...",
    processingDesc: "Tunakata tokeni na kutengeneza msimbo wako salama wa QR uliotiwa saini...",
    successTitle: "Voucher Imetengenezwa!",
    successDesc: "Voucher yako ya pembejeo imetengenezwa kwa mafanikio. Onyesha msimbo huu wa QR kwa muuzaji unapolipa.",
    kesValue: "Thamani ya Voucher",
    voucherCode: "Nambari ya Voucher",
    expiresIn: "Muda Uliosalia",
    expiresAtLabel: "Inakwisha Mnamo",
    buttonDone: "Rudi kwenye Mkoba",
    failureTitle: "Ukombozi Umefeli",
    failureDesc: "Voucher haikuweza kutengenezwa kwa sasa.",
    failureReason: "Sababu",
    refundNotice: "Tokeni zako zimerudishwa kiotomatiki kwenye salio lako la mkoba.",
    buttonRetry: "Jaribu Tena",
    insufficientBalance: "Salio la tokeni halitoshi.",
    minTokensError: "Kiwango cha chini cha ukombozi ni tokeni 50.",
    noDealersFound: "Hakuna agro-dealers waliopatikana kwa utafutaji wako.",
  }
};

type WizardStep = "select-dealer" | "enter-amount" | "confirm" | "processing" | "success" | "failure";

export default function VoucherRedeemPage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const t = voucherTranslations[locale === "sw" ? "sw" : "en"];

  // States
  const [step, setStep] = useState<WizardStep>("select-dealer");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Dealers States
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Form values
  const [tokenAmount, setTokenAmount] = useState<string>("50");
  const [amountError, setAmountError] = useState<string | null>(null);

  // Response Values
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [kesValue, setKesValue] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const rate = 0.55;

  // Fetch Token Balance & Active Dealers
  useEffect(() => {
    async function loadData() {
      try {
        const balRes = await apiClient.get<BalanceData & { success: boolean }>("/api/tokens/balance");
        if (balRes.success) {
          setBalance(balRes.balance);
        }
      } catch (err) {
        console.error("Failed to load balance:", err);
      } finally {
        setLoadingBalance(false);
      }

      try {
        const dealersRes = await apiClient.get<DealersResponse>("/api/tokens/redeem/voucher/dealers");
        if (dealersRes.success) {
          setDealers(dealersRes.dealers);
        }
      } catch (err) {
        console.error("Failed to load agro-dealers:", err);
      } finally {
        setLoadingDealers(false);
      }
    }
    loadData();
  }, []);

  // Time Countdown Logic
  useEffect(() => {
    if (step !== "success" || !expiresAt) return;

    const timer = setInterval(() => {
      const difference = new Date(expiresAt).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("Expired / Imekwisha");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [step, expiresAt]);

  // Derived Categories List
  const allAvailableCategories = Array.from(
    new Set(dealers.flatMap(d => d.categories))
  ).sort();

  // Filter Dealers
  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dealer.county.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || dealer.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const calculateKes = (tokens: string) => {
    const val = parseFloat(tokens) || 0;
    return (val * rate).toFixed(2);
  };

  const handleDealerSelect = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setStep("enter-amount");
  };

  const validateAmount = (): boolean => {
    const amt = parseInt(tokenAmount, 10);
    if (isNaN(amt) || amt < 50) {
      setAmountError(t.minTokensError);
      return false;
    }
    if (balance !== null && amt > balance) {
      setAmountError(t.insufficientBalance);
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAmount()) {
      setStep("confirm");
    }
  };

  const handleConfirmGeneration = async () => {
    if (!selectedDealer) return;
    setStep("processing");
    setIsSubmitting(true);

    const tokensToRedeem = parseInt(tokenAmount, 10);

    try {
      const res = await apiClient.post<VoucherResponse>("/api/tokens/redeem/voucher", {
        token_amount: tokensToRedeem,
        agro_dealer_id: selectedDealer.id
      });

      if (res.success) {
        setQrDataUrl(res.qrDataUrl);
        setVoucherCode(res.voucherCode);
        setKesValue(res.kesValue);
        setExpiresAt(res.expiresAt);

        // Refresh balance local state
        if (balance !== null) {
          setBalance(balance - tokensToRedeem);
        }

        setStep("success");
      } else {
        throw new Error("Redemption response returned success false.");
      }
    } catch (err: any) {
      console.error("Voucher generation failure:", err);
      const reason = err.responseData?.error?.message || err.message || "VOUCHER_GENERATION_FAILED";
      setErrorDetails(reason);
      setStep("failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === "enter-amount") {
      setStep("select-dealer");
    } else if (step === "confirm") {
      setStep("enter-amount");
    } else {
      router.back();
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* Header */}
        <header className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            {(step === "select-dealer" || step === "enter-amount" || step === "confirm") && (
              <button
                onClick={handleBack}
                className="p-1 text-white/60 hover:text-white transition-all text-lg font-bold"
              >
                ←
              </button>
            )}
            <h1 className="font-extrabold text-lg tracking-wide text-white leading-tight">
              {t.redeemTitle}
            </h1>
          </div>

          {/* Language Switcher */}
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

        {/* 1. Token Balance display */}
        {step !== "success" && step !== "processing" && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner backdrop-blur-md">
            <div className="space-y-0.5">
              <p className="text-[10px] text-white/50 tracking-wider font-bold uppercase">
                {t.balance}
              </p>
              <p className="text-xl font-black text-emerald-400">
                {loadingBalance ? "..." : balance !== null ? `${balance.toFixed(2)} DIRA` : "0.00 DIRA"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-lg shadow-md border border-primary/20">
              🪙
            </div>
          </section>
        )}

        {/* Wizard step views */}
        {step === "select-dealer" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.step1Title}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.step1Desc}</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
              />
              <span className="absolute left-3.5 top-3 text-white/40 text-sm">🔍</span>
            </div>

            {/* Categories filter chips */}
            <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === "all"
                    ? "bg-teal-600 border-teal-500 text-white shadow-md shadow-teal-500/10"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {t.allCategories}
              </button>
              {allAvailableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-teal-600 border-teal-500 text-white shadow-md shadow-teal-500/10"
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dealers List */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {loadingDealers ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-teal-400 animate-spin" />
                </div>
              ) : filteredDealers.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-8">{t.noDealersFound}</p>
              ) : (
                filteredDealers.map(dealer => (
                  <div
                    key={dealer.id}
                    onClick={() => handleDealerSelect(dealer)}
                    className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Logo or placeholder */}
                      <div className="h-10 w-10 rounded-xl bg-teal-900/40 border border-teal-500/20 flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-inner">
                        {dealer.logoUrl ? (
                          <img src={dealer.logoUrl} alt={dealer.name} className="h-full w-full object-cover" />
                        ) : (
                          "🌾"
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-sm text-white group-hover:text-teal-400 transition-colors leading-tight">
                          {dealer.name}
                        </h3>
                        <p className="text-[10px] text-white/45 font-semibold">
                          📍 {dealer.county}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dealer.categories.map(c => (
                            <span key={c} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-white/60 font-bold uppercase">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-white/30 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all text-sm">
                      ➔
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === "enter-amount" && selectedDealer && (
          <form onSubmit={handleAmountSubmit} className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.step2Title}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.step2Desc}</p>
            </div>

            {/* Selected Dealer display */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-teal-900/30 border border-teal-500/20 flex items-center justify-center text-base">
                {selectedDealer.logoUrl ? (
                  <img src={selectedDealer.logoUrl} alt={selectedDealer.name} className="h-full w-full object-cover" />
                ) : (
                  "🌾"
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-teal-400 font-black uppercase tracking-wider">{t.selectedDealer}</span>
                <h3 className="font-extrabold text-sm leading-tight text-white">{selectedDealer.name}</h3>
              </div>
            </div>

            {/* Token Selector presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/80">{t.tokenAmountLabel}</label>
              
              <div className="grid grid-cols-3 gap-2">
                {["50", "100", "200"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTokenAmount(preset);
                      setAmountError(null);
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-sm transition-all duration-200 ${
                      tokenAmount === preset
                        ? "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20 scale-[1.02]"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {preset} DIRA
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="space-y-1">
                <input
                  type="number"
                  min="50"
                  value={tokenAmount}
                  onChange={(e) => {
                    setTokenAmount(e.target.value);
                    setAmountError(null);
                  }}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                    amountError ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                  }`}
                  placeholder={t.customAmount}
                />
                
                {/* KES equivalent indicator */}
                <p className="text-[11px] text-teal-400 font-bold tracking-wide mt-1">
                  💡 {t.kesEquivalent.replace("{amount}", calculateKes(tokenAmount))}
                </p>
                
                {amountError && (
                  <p className="text-xs font-semibold text-red-400 mt-1">{amountError}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingBalance}
              className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] hover:from-teal-500 hover:to-[#085a46] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-teal-500/10 transition-all duration-300 disabled:opacity-50 active:scale-[0.99]"
            >
              {t.buttonRedeem}
            </button>
          </form>
        )}

        {step === "confirm" && selectedDealer && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.confirmTitle}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.confirmDesc}</p>
            </div>

            {/* Confirmation details card */}
            <div className="bg-[#0A6E56]/15 border border-[#0A6E56]/30 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="text-center py-2 space-y-1">
                <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">
                  {locale === "en" ? "Voucher Summary" : "Muhtasari wa Voucher"}
                </p>
                <p className="text-2xl font-black text-white">{tokenAmount} DIRA</p>
                <p className="text-sm text-teal-400 font-extrabold px-1">
                  {t.confirmPrompt.replace("{kes}", calculateKes(tokenAmount)).replace("{dealer}", selectedDealer.name)}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] text-amber-300/80 font-bold leading-relaxed text-center">
                  ⚠️ {t.deductionWarning}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleConfirmGeneration}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-teal-500/10 transition-all duration-300 active:scale-[0.99]"
              >
                {t.buttonConfirm}
              </button>
              <button
                onClick={() => setStep("enter-amount")}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
              >
                {t.buttonCancel}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-teal-500/10 animate-ping pointer-events-none" />
            </div>
            <div className="text-center space-y-2 max-w-xs">
              <h2 className="text-base font-black text-white">{t.processingTitle}</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                {t.processingDesc}
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-5">
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              {/* Success Badge */}
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/5">
                <svg
                  className="w-6 h-6 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-teal-400">{t.successTitle}</h2>
                <p className="text-xs text-white/70 max-w-xs leading-relaxed px-4">
                  {t.successDesc}
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="bg-amber-400/10 border border-amber-400/35 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 backdrop-blur-md">
              <span className="text-[9px] text-amber-300 font-black tracking-widest uppercase">
                ⏱️ {t.expiresIn}
              </span>
              <span className="font-mono text-xl font-extrabold text-amber-200 tracking-wider">
                {timeLeft}
              </span>
            </div>

            {/* Signed QR Code Display */}
            <div className="bg-white rounded-3xl p-5 w-60 h-60 mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden border-4 border-teal-500/30">
              <img src={qrDataUrl} alt="Voucher QR Code" className="w-full h-full object-contain" />
            </div>

            {/* Voucher details receipt */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-white/50">{t.selectedDealer}:</span>
                <span className="font-bold text-white">{selectedDealer?.name}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-white/50">{t.kesValue}:</span>
                <span className="font-bold text-emerald-400">KES {kesValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-white/50">{t.expiresAtLabel}:</span>
                <span className="font-semibold text-white/80">
                  {new Date(expiresAt).toLocaleString(locale === "sw" ? "sw-KE" : "en-KE")}
                </span>
              </div>
              <div className="flex flex-col space-y-1 border-t border-white/5 pt-2">
                <span className="text-white/50">{t.voucherCode}:</span>
                <span className="font-mono text-[10px] bg-white/5 px-2.5 py-1 rounded text-white/90 text-center select-all select-text font-bold">
                  {voucherCode}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/wallet")}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
            >
              {t.buttonDone}
            </button>
          </div>
        )}

        {step === "failure" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/5 animate-pulse">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-red-400">{t.failureTitle}</h2>
                <p className="text-xs text-white/70 max-w-xs">
                  {t.failureDesc}
                </p>
              </div>
            </div>

            {/* Error detail panel */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start text-xs">
                <span className="text-white/50">{t.failureReason}:</span>
                <span className="font-semibold text-red-300 max-w-[200px] text-right font-mono">
                  {errorDetails}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 text-center">
                <p className="text-[11px] text-teal-400 font-bold">
                  🛡️ {t.refundNotice}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setStep("select-dealer")}
                className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl transition-all duration-300"
              >
                {t.buttonRetry}
              </button>
              <button
                onClick={() => router.push("/wallet")}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
              >
                {t.buttonDone}
              </button>
            </div>
          </div>
        )}

      </div>
    </AuthGuard>
  );
}
