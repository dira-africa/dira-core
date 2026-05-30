"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function OnboardingPage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"farmer" | "agent">("farmer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    
    // Simulate updating user profile in backend API
    try {
      // In a real implementation, we would make a POST /users/profile request.
      // For now, update our local sessionStorage to reflect completed onboarding
      const userStr = sessionStorage.getItem("dira_auth_user");
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        user.isNewUser = false;
        user.name = fullName;
        user.role = selectedRole;
        sessionStorage.setItem("dira_auth_user", JSON.stringify(user));
      }
      
      // Redirect to home based on selected role
      router.push(`/${selectedRole}/home`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
            {locale === "en" ? "Profile Setup" : "Usajili"}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {locale === "en" ? "Welcome to Dira" : "Karibu Dira"}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            {locale === "en" 
              ? "Join Kenya's distributed weather network. Choose your role to begin."
              : "Jiunge na mtandao wa hali ya hewa Kenya. Chagua jukumu lako ili uanze."}
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70">
              {locale === "en" ? "Full Name" : "Majina Kamili"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={locale === "en" ? "e.g., Juma Kibet" : "mfano Juma Kibet"}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/30 text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Role Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70">
              {locale === "en" ? "Choose Role" : "Chagua Jukumu"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Farmer Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("farmer")}
                className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${
                  selectedRole === "farmer"
                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-2xl mb-1">🌾</span>
                <span className="text-xs font-bold text-white">
                  {locale === "en" ? "Farmer" : "Mkulima"}
                </span>
                <span className="text-[10px] text-white/50 mt-1">
                  {locale === "en" ? "Submit crop photos" : "Tuma picha za mazao"}
                </span>
              </button>

              {/* Data Agent Option */}
              <button
                type="button"
                onClick={() => setSelectedRole("agent")}
                className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${
                  selectedRole === "agent"
                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-2xl mb-1">🌡️</span>
                <span className="text-xs font-bold text-white">
                  {locale === "en" ? "Data Agent" : "Wakala"}
                </span>
                <span className="text-[10px] text-white/50 mt-1">
                  {locale === "en" ? "Passive sync sensors" : "Sawazisha sensor hewa"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isSubmitting 
              ? (locale === "en" ? "Completing..." : "Inakamilisha...")
              : (locale === "en" ? "Complete Registration" : "Kamilisha Usajili")}
          </button>
        </form>

        {/* Language Selection */}
        <div className="flex justify-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 w-24 mx-auto mt-2">
          <button
            onClick={() => setLocale("en")}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              locale === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("sw")}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${
              locale === "sw" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            SW
          </button>
        </div>
      </div>
    </main>
  );
}
