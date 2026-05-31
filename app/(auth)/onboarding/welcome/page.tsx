"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getOnboardingState, saveOnboardingState, clearOnboardingState } from "@/lib/onboarding";

export default function WelcomeStep() {
  const router = useRouter();
  const { locale } = useTranslation();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"farmer" | "agent" | null>(null);

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

  const handleGetStarted = () => {
    // 1. Mark onboarding as complete in state
    saveOnboardingState({ step: "complete" });

    // 2. Clear state from localStorage (or retain 'complete' status)
    clearOnboardingState();

    // 3. Push to home screen based on role
    router.push(role === "farmer" ? "/farmer/home" : "/agent/home");
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
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
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

        {/* Action Button */}
        <button
          onClick={handleGetStarted}
          className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-2"
        >
          {locale === "en" ? "Get Started" : "Anza Sasa"}
        </button>

        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}
