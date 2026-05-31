"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding";

export default function OnboardingCoordinator() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const state = getOnboardingState();
    
    if (state.step === "complete") {
      const userStr = sessionStorage.getItem("dira_auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          router.replace(user.role === "farmer" ? "/farmer/home" : "/agent/home");
        } catch {
          router.replace("/");
        }
      } else {
        router.replace("/");
      }
    } else {
      router.replace(`/onboarding/${state.step}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#051c1c] to-[#04120f] text-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 rounded-full border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
        <p className="text-sm text-white/50 tracking-wider">Loading onboarding...</p>
      </div>
    </div>
  );
}
