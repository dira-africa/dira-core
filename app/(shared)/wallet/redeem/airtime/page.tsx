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
import BackButton from "@/components/ui/BackButton";


// Interface definitions
interface BalanceData {
  balance: number;
}

interface RedeemResponse {
  success: boolean;
  kes_disbursed: number;
  phone: string;
  transactionId: string;
}

// Local translation dictionary
const airtimeTranslations = {
  en: {
    back: "Back",
    redeemTitle: "Redeem Airtime",
    balance: "Climate Token Balance",
    step1Title: "Enter Redemption Details",
    step1Desc: "Convert your Climate Tokens into instant mobile airtime. Supported on Safaricom, Airtel, and Telkom Kenya.",
    tokenAmountLabel: "Select Token Amount",
    customAmount: "Custom Amount (Min 20)",
    kesEquivalent: "You will receive KES {amount} airtime",
    phoneLabel: "Kenyan Phone Number",
    phonePlaceholder: "e.g., 0712345678 or +254...",
    phoneHelper: "Must be a valid Kenyan mobile number starting with 01, 07, or +254.",
    buttonRedeem: "Redeem Airtime",
    confirmTitle: "Confirm Redemption",
    confirmDesc: "Please verify the redemption details below before completing your transaction.",
    confirmPrompt: "You will receive KES {kes} airtime to {phone}",
    deductionWarning: "Tokens will be deducted immediately from your wallet ledger.",
    buttonConfirm: "Confirm & Disburse",
    buttonCancel: "Cancel",
    processingTitle: "Processing Transaction...",
    processingDesc: "We are deducting tokens from your ledger and requesting airtime disbursement from Africa's Talking API...",
    successTitle: "Redemption Successful!",
    successDesc: "Your airtime has been sent successfully. Please check your SMS or mobile account balance shortly.",
    successReceipt: "Received KES {kes} airtime to {phone}",
    transactionId: "Transaction ID",
    buttonDone: "Return to Wallet",
    failureTitle: "Redemption Failed",
    failureDesc: "The disbursement could not be completed at this time.",
    failureReason: "Reason",
    refundNotice: "Your tokens have been automatically refunded to your wallet ledger.",
    buttonRetry: "Try Again",
    insufficientBalance: "Insufficient token balance.",
    minTokensError: "Minimum redemption is 20 Climate Tokens.",
    invalidPhoneError: "Please enter a valid Kenyan phone number (e.g. 0712345678).",
  },
  sw: {
    back: "Rudi",
    redeemTitle: "Komboa Muda wa Maongezi",
    balance: "Salio la Climate Token",
    step1Title: "Weka Maelezo ya Ukombozi",
    step1Desc: "Badilisha Climate Tokens zako kuwa muda wa maongezi wa simu mara moja. Inasaidiwa kwenye Safaricom, Airtel, na Telkom Kenya.",
    tokenAmountLabel: "Chagua Kiasi cha Tokeni",
    customAmount: "Kiasi Unachotaka (Kima cha chini 20)",
    kesEquivalent: "Utapokea KES {amount} muda wa maongezi",
    phoneLabel: "Nambari ya Simu ya Kenya",
    phonePlaceholder: "mfano, 0712345678 au +254...",
    phoneHelper: "Lazima iwe nambari halali ya Kenya inayoanza na 01, 07, au +254.",
    buttonRedeem: "Komboa Muda wa Maongezi",
    confirmTitle: "Thibitisha Ukombozi",
    confirmDesc: "Tafadhali kagua maelezo ya ukombozi hapa chini kabla ya kukamilisha shughuli yako.",
    confirmPrompt: "Utapokea KES {kes} za muda wa maongezi kwenye nambari {phone}",
    deductionWarning: "Tokeni zitakatwa mara moja kwenye salio lako la mkoba.",
    buttonConfirm: "Thibitisha na Ulipe",
    buttonCancel: "Ghairi",
    processingTitle: "Shughuli Inashughulikiwa...",
    processingDesc: "Tunakata tokeni kwenye salio lako na kuomba malipo ya muda wa maongezi kutoka Africa's Talking API...",
    successTitle: "Ukombozi Umefaulu!",
    successDesc: "Muda wa maongezi umetumwa kwa mafanikio. Tafadhali angalia ujumbe wa SMS au salio la simu yako hivi karibuni.",
    successReceipt: "Kipokea hewani cha KES {kes} kimetumwa kwa {phone}",
    transactionId: "Kitambulisho cha Muamala",
    buttonDone: "Rudi kwenye Mkoba",
    failureTitle: "Ukombozi Umefeli",
    failureDesc: "Malipo hayakuweza kukamilika kwa sasa.",
    failureReason: "Sababu",
    refundNotice: "Tokeni zako zimerudishwa kiotomatiki kwenye salio lako la mkoba.",
    buttonRetry: "Jaribu Tena",
    insufficientBalance: "Salio la tokeni halitoshi.",
    minTokensError: "Kiwango cha chini cha ukombozi ni tokeni 20.",
    invalidPhoneError: "Tafadhali weka nambari halali ya simu ya Kenya (mfano, 0712345678).",
  }
};

type WizardStep = "form" | "confirm" | "processing" | "success" | "failure";

export default function AirtimeRedeemPage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const t = airtimeTranslations[locale === "sw" ? "sw" : "en"];

  // States
  const [step, setStep] = useState<WizardStep>("form");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  const [tokenAmount, setTokenAmount] = useState<string>("20");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [kesDisbursed, setKesDisbursed] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<string>("");

  // Rates
  const rate = 0.55;

  // Prefill phone number from localStorage on load if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedPhone = localStorage.getItem("dira_phone_number");
      if (cachedPhone) {
        setPhoneNumber(cachedPhone);
      }
    }
  }, []);

  // Fetch token balance
  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await apiClient.get<BalanceData & { success: boolean }>("/api/tokens/balance");
        if (res.success) {
          setBalance(res.balance);
        }
      } catch (err) {
        console.error("Failed to load balance:", err);
      } finally {
        setLoadingBalance(false);
      }
    }
    loadBalance();
  }, []);

  const calculateKes = (tokens: string) => {
    const val = parseFloat(tokens) || 0;
    return (val * rate).toFixed(2);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Amount validation
    const amt = parseInt(tokenAmount, 10);
    if (isNaN(amt) || amt < 20) {
      setAmountError(t.minTokensError);
      isValid = false;
    } else if (balance !== null && amt > balance) {
      setAmountError(t.insufficientBalance);
      isValid = false;
    } else {
      setAmountError(null);
    }

    // Phone validation
    const phoneRegex = /^(\+?254|0)[17][0-9]{8}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber.trim())) {
      setPhoneError(t.invalidPhoneError);
      isValid = false;
    } else {
      setPhoneError(null);
    }

    return isValid;
  };

  const handleRedeemClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const handleConfirmDisbursement = async () => {
    setStep("processing");
    setIsSubmitting(true);

    const tokensToRedeem = parseInt(tokenAmount, 10);
    const cleanedPhone = phoneNumber.trim();

    try {
      const res = await apiClient.post<RedeemResponse>("/api/tokens/redeem/airtime", {
        token_amount: tokensToRedeem,
        phone_number: cleanedPhone
      });

      if (res.success) {
        setTransactionId(res.transactionId);
        setKesDisbursed(res.kes_disbursed);
        
        // Cache successful phone number
        if (typeof window !== "undefined") {
          localStorage.setItem("dira_phone_number", cleanedPhone);
        }
        
        // Refresh balance
        if (balance !== null) {
          setBalance(balance - tokensToRedeem);
        }
        
        setStep("success");
      } else {
        throw new Error("Redemption response returned success false.");
      }
    } catch (err: any) {
      console.error("Airtime disbursement failure:", err);
      // Retrieve safe failure reason
      const reason = err.responseData?.error?.message || err.message || "AIRTIME_SEND_FAILED";
      setErrorDetails(reason);
      setStep("failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* Header */}
        <header className="flex justify-between items-center py-2 border-b border-white/5">
          <div className="flex items-center space-x-2">
            {step === "form" && (
              <BackButton fallbackHref="/wallet" />
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

        {/* 1. Current Token Balance display */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-inner">
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

        {/* Wizard step views */}
        {step === "form" && (
          <form onSubmit={handleRedeemClick} className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-sm font-black text-white/95">{t.step1Title}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.step1Desc}</p>
            </div>

            {/* Token Selector Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/80">{t.tokenAmountLabel}</label>
              
              <div className="grid grid-cols-3 gap-2">
                {["20", "50", "100"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTokenAmount(preset);
                      setAmountError(null);
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-sm transition-all duration-200 ${
                      tokenAmount === preset
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {preset} DIRA
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="space-y-1">
                <input
                  type="number"
                  min="20"
                  value={tokenAmount}
                  onChange={(e) => {
                    setTokenAmount(e.target.value);
                    setAmountError(null);
                  }}
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                    amountError ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                  }`}
                  placeholder={t.customAmount}
                />
                
                {/* KES Equivalent Indicator */}
                <p className="text-[11px] text-emerald-400 font-bold tracking-wide mt-1">
                  💡 {t.kesEquivalent.replace("{amount}", calculateKes(tokenAmount))}
                </p>
                
                {amountError && (
                  <p className="text-xs font-semibold text-red-400 mt-1">{amountError}</p>
                )}
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 flex items-center space-x-1">
                <span>📱 {t.phoneLabel}</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError(null);
                }}
                className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                  phoneError ? "border-red-500/50 focus:ring-red-500" : "border-white/10"
                }`}
                placeholder={t.phonePlaceholder}
              />
              <p className="text-[10px] text-white/40 leading-snug">{t.phoneHelper}</p>
              {phoneError && (
                <p className="text-xs font-semibold text-red-400 mt-1">{phoneError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingBalance}
              className="w-full bg-gradient-to-r from-primary to-[#0A6E56] hover:from-primary/95 hover:to-[#0A6E56]/95 text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-primary/10 transition-all duration-300 disabled:opacity-50 active:scale-[0.99]"
            >
              {t.buttonRedeem}
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm font-black text-white/95">{t.confirmTitle}</h2>
              <p className="text-xs text-white/65 leading-relaxed">{t.confirmDesc}</p>
            </div>

            {/* Confirmation Box */}
            <div className="bg-[#0A6E56]/15 border border-[#0A6E56]/30 rounded-2xl p-5 space-y-4">
              <div className="text-center py-2 space-y-1">
                <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">
                  {locale === "en" ? "Redemption Summary" : "Muhtasari wa Ukombozi"}
                </p>
                <p className="text-2xl font-black text-white">{tokenAmount} DIRA</p>
                <p className="text-sm text-emerald-400 font-extrabold">
                  {t.confirmPrompt.replace("{kes}", calculateKes(tokenAmount)).replace("{phone}", phoneNumber)}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3">
                <p className="text-[10px] text-amber-300/80 font-bold leading-relaxed text-center">
                  ⚠️ {t.deductionWarning}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleConfirmDisbursement}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-[#0A6E56] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl shadow-primary/10 transition-all duration-300 active:scale-[0.99]"
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
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* Spinning & pulsing processing animation */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-primary/10 animate-ping pointer-events-none" />
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
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {/* Checkmark animation */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <svg
                  className="w-8 h-8 text-emerald-400 animate-bounce"
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
                <h2 className="text-lg font-black text-emerald-400">{t.successTitle}</h2>
                <p className="text-xs text-white/70 max-w-xs">
                  {t.successDesc}
                </p>
              </div>
            </div>

            {/* Success Summary Box */}
            <div className="bg-[#0A6E56]/10 border border-[#0A6E56]/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">{locale === "en" ? "Receipt" : "Stakabadhi"}:</span>
                <span className="font-bold text-white">
                  {t.successReceipt.replace("{kes}", kesDisbursed.toFixed(2)).replace("{phone}", phoneNumber)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                <span className="text-white/50">{t.transactionId}:</span>
                <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/90">
                  {transactionId}
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
              {/* Error icon animation */}
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

            {/* Error & Refund Message Box */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start text-xs">
                <span className="text-white/50">{t.failureReason}:</span>
                <span className="font-semibold text-red-300 max-w-[200px] text-right">
                  {errorDetails}
                </span>
              </div>
              <div className="border-t border-white/5 pt-2 text-center">
                <p className="text-[11px] text-emerald-400 font-bold">
                  🛡️ {t.refundNotice}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setStep("form")}
                className="w-full bg-gradient-to-r from-primary to-[#0A6E56] text-white py-3 px-4 rounded-xl font-black text-sm tracking-wide shadow-xl transition-all duration-300"
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
