"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { apiClient } from "@/lib/api-client";
import { AuthResponse } from "@/lib/auth";

export default function RoleStep() {
  const router = useRouter();
  const { locale } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<"farmer" | "agent" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = getOnboardingState();
    if (state.role) {
      setSelectedRole(state.role);
    }
  }, []);

  const handleBack = () => {
    saveOnboardingState({ step: "language" });
    router.push("/onboarding/language");
  };

  const handleSelectRole = async (role: "farmer" | "agent") => {
    setSelectedRole(role);
    setIsSubmitting(true);
    try {
      // 1. Sync role update to backend API
      const res = await apiClient.put<AuthResponse>("/api/auth/profile", { role });
      if (res.token && res.user) {
        sessionStorage.setItem("dira_auth_token", res.token);
        sessionStorage.setItem("dira_auth_user", JSON.stringify(res.user));
      }

      // 2. Determine next step path
      const nextStep = role === "farmer" ? "farmer-profile" : "agent-profile";

      // 3. Save progress locally
      saveOnboardingState({
        step: nextStep,
        role: role,
      });

      // 4. Redirect
      router.push(`/onboarding/${nextStep}`);
    } catch (err) {
      console.error("Failed to update user role:", err);
      // Proceed locally on network failure
      const nextStep = role === "farmer" ? "farmer-profile" : "agent-profile";
      saveOnboardingState({
        step: nextStep,
        role: role,
      });
      router.push(`/onboarding/${nextStep}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="flex justify-between items-center text-xs text-white/40">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 hover:text-white transition-all font-semibold"
          >
            <span>←</span>
            <span>{locale === "en" ? "Back" : "Nyuma"}</span>
          </button>
          <span>{locale === "en" ? "Step 2 of 4" : "Hatua ya 2 kati ya 4"}</span>
        </div>

        {/* Step Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {locale === "en" ? "Choose Your Role" : "Chagua Jukumu Lako"}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            {locale === "en"
              ? "Select how you would like to participate in the Dira Climate Network."
              : "Chagua jinsi unavyopenda kushiriki kwenye Mtandao wa Hali ya Hewa wa Dira."}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Farmer Card */}
          <button
            onClick={() => handleSelectRole("farmer")}
            disabled={isSubmitting}
            className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all relative ${
              selectedRole === "farmer"
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/15"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-3xl">🌾</span>
              {selectedRole === "farmer" && (
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </div>
            <h3 className="text-base font-bold mt-4">
              {locale === "en" ? "Mkulima / Farmer" : "Mkulima"}
            </h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              {locale === "en"
                ? "Submit crop photos and earn climate tokens."
                : "Piga picha ya mazao na upate tokens."}
            </p>
          </button>

          {/* Data Agent Card */}
          <button
            onClick={() => handleSelectRole("agent")}
            disabled={isSubmitting}
            className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all relative ${
              selectedRole === "agent"
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/15"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-3xl">🌡️</span>
              {selectedRole === "agent" && (
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </div>
            <h3 className="text-base font-bold mt-4">
              {locale === "en" ? "Wakala wa Data / Data Agent" : "Wakala wa Data"}
            </h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              {locale === "en"
                ? "Sync weather data automatically from your phone."
                : "Sawazisha data ya hali ya hewa kiotomatiki kutoka kwa simu yako."}
            </p>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-2/4 rounded-full" />
        </div>
      </div>
    </main>
  );
}
