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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

// Interface definitions
interface Coordinator {
  name: string;
  mpesaNumber: string;
}

interface LastRequest {
  status: "pending" | "processing" | "completed" | "failed";
  amountKes: number;
  tokensSpent: number;
  initiatedAt: string;
  completedAt: string | null;
  mpesaReceipt: string | null;
}

interface CircleStatusResponse {
  success: boolean;
  county: string | null;
  coordinator: Coordinator | null;
  lastRequest: LastRequest | null;
}

interface BalanceData {
  balance: number;
}

interface RedeemResponse {
  success: boolean;
  message: string;
}

// Local translation dictionary
const circleTranslations = {
  en: {
    back: "Back",
    redeemTitle: "Dira Circle Pool",
    balance: "Climate Token Balance",
    noCoordinatorTitle: "No Active Coordinator",
    noCoordinatorDesc: "Dira Circle is not yet active in your county ({county}). Direct MPESA and Airtime withdrawals are still available.",
    buttonDone: "Return to Wallet",
    statusTitle: "Redemption Status",
    activeRequestTitle: "Active Circle Redemption",
    newRequestTitle: "New Redemption Request",
    step1Title: "Enter Redemption Details",
    step1Desc: "Convert your Climate Tokens into cash. All county requests are pooled and distributed locally by your coordinator.",
    coordinatorLabel: "County Coordinator",
    distributionRulesLabel: "Payout Schedule",
    distributionRulesVal: "Every last Friday of the month",
    tokenAmountLabel: "Select Token Amount",
    customAmount: "Custom Amount (Min 100)",
    kesEquivalent: "You will receive KES {amount} in cash",
    buttonRedeem: "Redeem Cash",
    confirmTitle: "Confirm Request",
    confirmDesc: "Please verify the redemption details below before submitting your cash pool request.",
    confirmPrompt: "Redeem KES {kes} via Dira Circle",
    confirmCoordinator: "Cash will be distributed locally by {coordinator} ({phone})",
    deductionWarning: "Tokens will be deducted immediately from your wallet ledger. Cash will be distributed at the next county Circle event.",
    buttonConfirm: "Confirm & Submit",
    buttonCancel: "Cancel",
    processingTitle: "Submitting Request...",
    processingDesc: "Deducting tokens and registering your cash pool request in the county ledger...",
    successTitle: "Request Submitted!",
    successDesc: "Your request has been successfully registered. You can track its progress below.",
    stepPending: "Request Registered",
    stepProcessing: "Transfer Sent",
    stepCompleted: "Cash Distributed",
    stepPendingDesc: "Your request is registered in the county ledger.",
    stepProcessingDesc: "Dira has processed the monthly pool and sent the funds to your coordinator.",
    stepCompletedDesc: "Your coordinator has distributed the cash. Reference: {ref}",
    failureTitle: "Redemption Failed",
    failureDesc: "The request could not be processed at this time.",
    failureReason: "Reason",
    refundNotice: "Your tokens have been automatically refunded to your wallet ledger.",
    buttonRetry: "Try Again",
    insufficientBalance: "Insufficient token balance.",
    minTokensError: "Minimum redemption is 100 Climate Tokens.",
    requestNew: "Request Another Cashout",
  },
  sw: {
    back: "Rudi",
    redeemTitle: "Dira Circle Pool",
    balance: "Salio la Climate Token",
    noCoordinatorTitle: "Hakuna Mratibu Hai",
    noCoordinatorDesc: "Dira Circle bado haijaanza katika wilaya/kaunti yako ({county}). Huduma ya M-Pesa ya kawaida na Muda wa Maongezi bado zinapatikana.",
    buttonDone: "Rudi kwenye Mkoba",
    statusTitle: "Hali ya Ukombozi",
    activeRequestTitle: "Ukombozi Ulio Hai",
    newRequestTitle: "Ombi Mpya la Ukombozi",
    step1Title: "Weka Maelezo ya Ukombozi",
    step1Desc: "Badilisha Climate Tokens zako kuwa pesa taslimu. Maombi yote ya kaunti yanakusanywa na kugawanywa na mratibu wako.",
    coordinatorLabel: "Mratibu wa Kaunti",
    distributionRulesLabel: "Ratiba ya Malipo",
    distributionRulesVal: "Kila Ijumaa ya mwisho wa mwezi",
    tokenAmountLabel: "Chagua Kiasi cha Tokeni",
    customAmount: "Kiasi Unachotaka (Kima cha chini 100)",
    kesEquivalent: "Utapokea KES {amount} za pesa taslimu",
    buttonRedeem: "Komboa Pesa",
    confirmTitle: "Thibitisha Ombi",
    confirmDesc: "Tafadhali kagua maelezo ya ukombozi hapa chini kabla ya kutuma ombi lako la mzunguko wa pesa.",
    confirmPrompt: "Komboa KES {kes} kupitia Dira Circle",
    confirmCoordinator: "Pesa zitatolewa na mratibu {coordinator} ({phone})",
    deductionWarning: "Tokeni zitakatwa mara moja kwenye salio lako. Pesa zitakabidhiwa kwako katika mkutano ujao wa Dira Circle.",
    buttonConfirm: "Thibitisha na Utume",
    buttonCancel: "Ghairi",
    processingTitle: "Inatuma Ombi...",
    processingDesc: "Tunakata tokeni na kusajili ombi lako katika daftari la kaunti...",
    successTitle: "Ombi Limetumwa!",
    successDesc: "Ombi lako limesajiliwa kwa mafanikio. Unaweza kufuatilia maendeleo yake hapa chini.",
    stepPending: "Ombi Limesajiliwa",
    stepProcessing: "Fedha Zimetumwa",
    stepCompleted: "Pesa Zimegawanywa",
    stepPendingDesc: "Ombi lako limesajiliwa katika daftari la kaunti.",
    stepProcessingDesc: "Dira imekusanya michango ya mwezi na kutuma fedha kwa mratibu wako.",
    stepCompletedDesc: "Mratibu wako amekabidhi pesa zako. Rejea: {ref}",
    failureTitle: "Ukombozi Umefeli",
    failureDesc: "Ombi halikuweza kukamilika kwa sasa.",
    failureReason: "Sababu",
    refundNotice: "Tokeni zako zimerudishwa kiotomatiki kwenye salio lako la mkoba.",
    buttonRetry: "Jaribu Tena",
    insufficientBalance: "Salio la tokeni halitoshi.",
    minTokensError: "Kiwango cha chini cha ukombozi ni tokeni 100.",
    requestNew: "Tuma Ombi Jingine la Pesa",
  }
};

type WizardStep = "form" | "confirm" | "processing" | "success" | "failure" | "tracker-only";

export default function CircleRedeemPage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const t = circleTranslations[locale === "sw" ? "sw" : "en"];

  // States
  const [step, setStep] = useState<WizardStep>("form");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Circle Status Details
  const [county, setCounty] = useState<string>("");
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [lastRequest, setLastRequest] = useState<LastRequest | null>(null);

  // Form Values
  const [tokenAmount, setTokenAmount] = useState<string>("100");
  const [amountError, setAmountError] = useState<string | null>(null);

  // Submission Statuses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");

  const rate = 0.50;

  // Load Balance & Circle status info
  useEffect(() => {
    async function loadCircleDetails() {
      try {
        const [balRes, statusRes] = await Promise.all([
          apiClient.get<BalanceData & { success: boolean }>("/api/tokens/balance"),
          apiClient.get<CircleStatusResponse>("/api/tokens/redeem/circle/status")
        ]);

        if (balRes.success) {
          setBalance(balRes.balance);
        }

        if (statusRes.success) {
          setCounty(statusRes.county || "");
          setCoordinator(statusRes.coordinator);
          setLastRequest(statusRes.lastRequest);

          // If there is an active request in pending/processing/completed state, go straight to tracker view
          if (statusRes.lastRequest && (statusRes.lastRequest.status === "pending" || statusRes.lastRequest.status === "processing")) {
            setStep("tracker-only");
          }
        }
      } catch (err) {
        console.error("Failed to load Dira Circle details:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadCircleDetails();
  }, []);

  const calculateKes = (tokens: string) => {
    const val = parseFloat(tokens) || 0;
    return (val * rate).toFixed(2);
  };

  const validateForm = (): boolean => {
    const amt = parseInt(tokenAmount, 10);
    if (isNaN(amt) || amt < 100) {
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

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const handleConfirmRedemption = async () => {
    setStep("processing");
    setIsSubmitting(true);

    const tokensToRedeem = parseInt(tokenAmount, 10);

    try {
      const res = await apiClient.post<RedeemResponse>("/api/tokens/redeem/circle", {
        tokenAmount: tokensToRedeem
      });

      if (res.success) {
        // Refresh details after successfully registering
        const statusRes = await apiClient.get<CircleStatusResponse>("/api/tokens/redeem/circle/status");
        if (statusRes.success) {
          setLastRequest(statusRes.lastRequest);
        }
        
        // Adjust local balance state
        if (balance !== null) {
          setBalance(balance - tokensToRedeem);
        }

        setStep("success");
      } else {
        throw new Error("Redemption response returned success false.");
      }
    } catch (err: any) {
      console.error("Dira Circle pool registration failure:", err);
      const reason = err.responseData?.error?.message || err.message || "CIRCLE_POOL_REGISTRATION_FAILED";
      setErrorDetails(reason);
      setStep("failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("form");
    } else {
      router.back();
    }
  };

  const getTrackerStep = (status: string): number => {
    switch (status) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "completed":
        return 3;
      default:
        return 1;
    }
  };

  const renderStatusTracker = (req: LastRequest) => {
    const activeStep = getTrackerStep(req.status);
    
    return (
      <div className="space-y-6 bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-inner backdrop-blur-md">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider text-center border-b border-white/5 pb-2">
          {t.statusTitle}
        </h3>

        {/* Amount & Date Summary */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/50">{locale === "en" ? "Tokens Spent" : "Tokeni Zilizotumika"}:</span>
          <span className="font-extrabold text-white">{req.tokensSpent} DIRA</span>
        </div>
        <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
          <span className="text-white/50">{locale === "en" ? "Payout Amount" : "Kiasi cha Malipo"}:</span>
          <span className="font-extrabold text-emerald-400">KES {req.amountKes.toFixed(2)}</span>
        </div>

        {/* Stepper Timeline */}
        <div className="relative pl-7 space-y-7 border-l border-white/10 mt-2">
          {/* STEP 1: Pending */}
          <div className="relative">
            {/* Indicator Node */}
            <div className={`absolute -left-[35px] top-0.5 h-4 w-4 rounded-full flex items-center justify-center border font-bold text-[8px] transition-all duration-300 ${
              activeStep >= 1 
                ? "bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20" 
                : "bg-white/5 border-white/10 text-white/40"
            }`}>
              {activeStep > 1 ? "✓" : "1"}
            </div>
            <div className="space-y-0.5">
              <h4 className={`text-xs font-bold ${activeStep >= 1 ? "text-white" : "text-white/40"}`}>
                {t.stepPending}
              </h4>
              <p className="text-[10px] text-white/50 leading-relaxed">
                {t.stepPendingDesc}
              </p>
            </div>
          </div>

          {/* STEP 2: Processing */}
          <div className="relative">
            {/* Indicator Node */}
            <div className={`absolute -left-[35px] top-0.5 h-4 w-4 rounded-full flex items-center justify-center border font-bold text-[8px] transition-all duration-300 ${
              activeStep >= 2 
                ? "bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20" 
                : "bg-white/5 border-white/10 text-white/40"
            }`}>
              {activeStep > 2 ? "✓" : "2"}
            </div>
            <div className="space-y-0.5">
              <h4 className={`text-xs font-bold ${activeStep >= 2 ? "text-white" : "text-white/40"}`}>
                {t.stepProcessing}
              </h4>
              <p className="text-[10px] text-white/50 leading-relaxed">
                {t.stepProcessingDesc}
              </p>
            </div>
          </div>

          {/* STEP 3: Completed */}
          <div className="relative">
            {/* Indicator Node */}
            <div className={`absolute -left-[35px] top-0.5 h-4 w-4 rounded-full flex items-center justify-center border font-bold text-[8px] transition-all duration-300 ${
              activeStep >= 3 
                ? "bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20" 
                : "bg-white/5 border-white/10 text-white/40"
            }`}>
              3
            </div>
            <div className="space-y-0.5">
              <h4 className={`text-xs font-bold ${activeStep >= 3 ? "text-white" : "text-white/40"}`}>
                {t.stepCompleted}
              </h4>
              <p className="text-[10px] text-white/50 leading-relaxed">
                {activeStep >= 3 
                  ? t.stepCompletedDesc.replace("{ref}", req.mpesaReceipt || "") 
                  : locale === "en" 
                    ? "Pending coordinator distribution." 
                    : "Inasubiri ugawaji wa mratibu."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingData) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-teal-400 animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  // Handle case where county coordinator is not active/available
  if (!coordinator) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
          <header className="flex items-center space-x-2 py-2 border-b border-white/5">
            <button onClick={() => router.back()} className="p-1 text-white/60 hover:text-white transition-all text-lg font-bold">
              ←
            </button>
            <h1 className="font-extrabold text-lg tracking-wide text-white leading-tight">
              {t.redeemTitle}
            </h1>
          </header>

          <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/5 animate-pulse">
              ⚠️
            </div>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-base font-black text-amber-400">{t.noCoordinatorTitle}</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                {t.noCoordinatorDesc.replace("{county}", county || "your location")}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/wallet")}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
          >
            {t.buttonDone}
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
            {(step === "form" || step === "confirm") && (
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
        {step !== "processing" && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner backdrop-blur-md">
            <div className="space-y-0.5">
              <p className="text-[10px] text-white/50 tracking-wider font-bold uppercase">
                {t.balance}
              </p>
              <p className="text-xl font-black text-emerald-400">
                {balance !== null ? `${balance.toFixed(2)} DIRA` : "0.00 DIRA"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-lg shadow-md border border-primary/20">
              🪙
            </div>
          </section>
        )}

        {/* Wizard step views */}
        {step === "form" && (
          <form onSubmit={handleRedeemSubmit} className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.newRequestTitle}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.step1Desc}</p>
            </div>

            {/* Coordinator Details Card */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">{t.coordinatorLabel}:</span>
                <span className="font-bold text-white">{coordinator.name} ({coordinator.mpesaNumber})</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2 text-xs">
                <span className="text-white/50">{t.distributionRulesLabel}:</span>
                <span className="font-bold text-teal-400">{t.distributionRulesVal}</span>
              </div>
            </div>

            {/* Token Selector presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/80">{t.tokenAmountLabel}</label>
              
              <div className="grid grid-cols-3 gap-2">
                {["100", "200", "500"].map((preset) => (
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
                  min="100"
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
              className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] hover:from-teal-500 hover:to-[#085a46] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-teal-500/10 transition-all duration-300 active:scale-[0.99]"
            >
              {t.buttonRedeem}
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.confirmTitle}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.confirmDesc}</p>
            </div>

            {/* Confirmation details card */}
            <div className="bg-[#0A6E56]/15 border border-[#0A6E56]/30 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="text-center py-2 space-y-1">
                <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">
                  {locale === "en" ? "Circle Payout Summary" : "Muhtasari wa Malipo ya Circle"}
                </p>
                <p className="text-2xl font-black text-white">{tokenAmount} DIRA</p>
                <p className="text-sm text-teal-400 font-extrabold px-1">
                  {t.confirmPrompt.replace("{kes}", calculateKes(tokenAmount))}
                </p>
                <p className="text-[11px] text-white/75 font-semibold pt-1">
                  {t.confirmCoordinator.replace("{coordinator}", coordinator.name).replace("{phone}", coordinator.mpesaNumber)}
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
                onClick={handleConfirmRedemption}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-teal-500/10 transition-all duration-300 active:scale-[0.99]"
              >
                {t.buttonConfirm}
              </button>
              <button
                onClick={() => setStep("form")}
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

            {/* Render Status tracker */}
            {lastRequest && renderStatusTracker(lastRequest)}

            <button
              onClick={() => setStep("tracker-only")}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
            >
              {locale === "en" ? "View Status Tracker" : "Angalia Mfuatiliaji Hali"}
            </button>
          </div>
        )}

        {step === "tracker-only" && lastRequest && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-white/95">{t.activeRequestTitle}</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                {locale === "en" 
                  ? `Your cash pool request is active under county coordinator ${coordinator.name}.`
                  : `Ombi lako la fedha linafanyiwa kazi chini ya mratibu wa kaunti ${coordinator.name}.`}
              </p>
            </div>

            {/* Coordinator Details Card */}
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">{t.coordinatorLabel}:</span>
                <span className="font-bold text-white">{coordinator.name} ({coordinator.mpesaNumber})</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2 text-xs">
                <span className="text-white/50">{t.distributionRulesLabel}:</span>
                <span className="font-bold text-teal-400">{t.distributionRulesVal}</span>
              </div>
            </div>

            {/* Render Status tracker */}
            {renderStatusTracker(lastRequest)}

            <div className="flex flex-col space-y-2 pt-2">
              {/* Allow request new only if the previous request is completed or failed */}
              {(lastRequest.status === "completed" || lastRequest.status === "failed") && (
                <button
                  onClick={() => setStep("form")}
                  className="w-full bg-gradient-to-r from-teal-600 to-[#0A6E56] hover:from-teal-500 hover:to-[#085a46] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl transition-all duration-300"
                >
                  {t.requestNew}
                </button>
              )}
              <button
                onClick={() => router.push("/wallet")}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
              >
                {t.buttonDone}
              </button>
            </div>
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
                onClick={() => setStep("form")}
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
