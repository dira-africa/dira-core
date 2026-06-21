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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getOnboardingState, saveOnboardingState, clearOnboardingState } from "@/lib/onboarding";
import { apiClient } from "@/lib/api-client";

export default function WelcomeStep() {
  const router = useRouter();
  const { locale } = useTranslation();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"farmer" | "agent" | null>(null);
  
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const state = getOnboardingState();
    if (state.role) {
      setRole(state.role);
      
      const profile = state.role === "farmer" ? state.farmerProfile : state.agentProfile;
      if (profile?.fullName) {
        setUserName(profile.fullName);
      }
    }

    if (!state.role) {
      // Direct back if no role exists
      router.replace("/onboarding/role");
    }
  }, [router]);

  const handleBack = () => {
    const prevStep = role === "farmer" ? "farmer-profile" : "agent-profile";
    saveOnboardingState({ step: prevStep });
    router.push(`/onboarding/${prevStep}`);
  };

  const handleGetStarted = async () => {
    if (!accepted) return;
    setLoading(true);
    setErrorMsg("");
    
    try {
      // Store consent timestamp in database (DPA 2019 requirement)
      await apiClient.post("/api/auth/consent");

      // Mark onboarding as complete in state
      saveOnboardingState({ step: "complete" });

      // Clear state from localStorage
      clearOnboardingState();

      // Push to home screen based on role
      router.push(role === "farmer" ? "/farmer/home" : "/agent/home");
    } catch (err: any) {
      console.error("Consent tracking registration failed:", err);
      setErrorMsg(err.message || "Failed to record privacy policy consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl -z-10" />

        {/* Header */}
        <div className="flex justify-between items-center text-xs text-white/40">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 hover:text-white transition-all font-semibold"
          >
            <span>←</span>
            <span>{locale === "en" ? "Back" : "Nyuma"}</span>
          </button>
          <span>{locale === "en" ? "Step 4 of 4" : "Hatua ya 4 kati ya 4"}</span>
        </div>

        {/* Success Icon */}
        <div className="relative mx-auto mt-4">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-full border border-primary/30 bg-[#0A6E56]/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {locale === "en" ? `Welcome, ${userName || "User"}!` : `Karibu, ${userName || "Mtumiaji"}!`}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
            {locale === "en"
              ? "Your profile is active, and you are connected to the weather network."
              : "Wasifu wako umewashwa, na umeunganishwa kwenye mtandao wa hali ya hewa."}
          </p>
        </div>

        {/* Starting Tokens Balance Card */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl -z-10" />
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
            {locale === "en" ? "Initial Balance" : "Salio la Kuanzia"}
          </p>
          <p className="text-3xl font-extrabold text-white tracking-tight">0.00 DIRA</p>
          <div className="pt-2 border-t border-white/5 text-[11px] text-white/60 leading-relaxed text-left space-y-1">
            <p className="font-semibold text-primary">
              {locale === "en" ? "How to earn Climate Tokens:" : "Jinsi ya kuvuna Tokens:"}
            </p>
            {role === "farmer" ? (
              <p className="text-white/50">
                {locale === "en"
                  ? "Submit geo-tagged crop photos bi-weekly. Each verified crop submission adds Climate Tokens to your wallet."
                  : "Tuma picha za mazao kila baada ya wiki mbili. Kila picha inayothibitishwa inakuletea Climate Tokens."}
              </p>
            ) : (
              <p className="text-white/50">
                {locale === "en"
                  ? "Sync weather readings from your phone 4x daily in the background to earn regular token yields."
                  : "Sawazisha data ya sensor ya hewa mara 4 kila siku kwa nyuma ili kuvuna Climate Tokens mara kwa mara."}
              </p>
            )}
          </div>
        </div>

        {/* Privacy Policy and Consent (Kenya DPA 2019) */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 text-left">
          <h3 className="text-xs font-bold text-primary tracking-widest uppercase">
            {locale === "en" ? "Privacy Policy (Kenya DPA 2019)" : "Sera ya Faragha (DPA 2019)"}
          </h3>
          <div className="h-24 overflow-y-auto pr-1 text-[11px] text-white/50 space-y-2 border border-white/5 rounded-lg p-2 bg-black/10 scrollbar-thin scrollbar-thumb-white/10">
            <p>
              {locale === "en"
                ? "Dira Africa is committed to protecting your personal data in accordance with the Kenya Data Protection Act 2019."
                : "Dira Africa imejitolea kulinda data yako ya kibinafsi kwa mujibu wa Sheria ya Kulinda Data ya Kenya 2019."}
            </p>
            <p>
              {locale === "en"
                ? "We collect and store your mobile phone number securely encrypted using pgcrypto. This phone number is used exclusively to facilitate Climate Token redemptions (airtime, vouchers, cash pools, and M-Pesa payouts) and prevent double-spending."
                : "Tunakusanya na kuhifadhi nambari yako ya simu ya rununu ikiwa imesimbwa kwa usalama kwa kutumia pgcrypto. Nambari hii inatumiwa tu kurahisisha ukoboaji wa Climate Tokens (salio la simu, vocha, na M-Pesa) na kuzuia matumizi mabaya."}
            </p>
            {role === "farmer" ? (
              <p>
                {locale === "en"
                  ? "As a Farmer, we collect and analyze your crop photos and GPS coordinates to verify your agricultural yields and calculate token rewards."
                  : "Kama Mkulima, tunakusanya na kuchambua picha zako za mazao na eneo la GPS ili kuthibitisha mazao yako na kukupatia zawadi za tokens."}
              </p>
            ) : (
              <p>
                {locale === "en"
                  ? "As a Data Agent, we collect barometric pressure and GPS readings in the background to build Kenya's weather sensing network."
                  : "Kama Data Agent, tunakusanya shinikizo la hewa na eneo la GPS kwa nyuma ili kujenga mtandao wa hali ya hewa wa Kenya."}
              </p>
            )}
            <p>
              {locale === "en"
                ? "You have the right to access, export, or request deletion of your account. Deletion requests will anonymise your personal profile after a 30-day grace period, while retaining anonymised logs for financial audit."
                : "Una haki ya kufikia, kusafirisha, au kuomba kufutwa kwa akaunti yako. Maombi ya kufuta yatabadilisha maelezo yako ya kibinafsi baada ya siku 30, huku tukihifadhi kumbukumbu zisizotambulika kwa ukaguzi wa kifedha."}
            </p>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-[#0e0e26]"
            />
            <span className="text-[11px] leading-tight text-white/70 select-none">
              {locale === "en"
                ? "I accept the Dira Privacy Policy and consent to the secure collection of my phone number and sensor data."
                : "Ninakubali Sera ya Faragha ya Dira na kutoa idhini ya kukusanywa kwa nambari yangu ya simu na data ya sensor."}
            </span>
          </label>
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-red-400">{errorMsg}</p>
        )}

        {/* Action Button */}
        <button
          onClick={handleGetStarted}
          disabled={!accepted || loading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all transform mt-2 ${
            accepted && !loading
              ? "bg-primary text-white shadow-primary/20 hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {loading
            ? (locale === "en" ? "Processing..." : "Inachakatwa...")
            : (locale === "en" ? "Get Started" : "Anza Sasa")}
        </button>

        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}
