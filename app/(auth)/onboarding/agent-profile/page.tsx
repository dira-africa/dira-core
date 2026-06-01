"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { apiClient } from "@/lib/api-client";
import type { Map, Marker, Circle } from "leaflet";

const KENYAN_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
  "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
].sort();

interface AgentProfileResponse {
  success: boolean;
  user?: {
    name?: string;
  };
}

export default function AgentProfileStep() {
  const router = useRouter();
  const { locale } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [latitude, setLatitude] = useState(-1.2921); // Nairobi default
  const [longitude, setLongitude] = useState(36.8219);
  const [radiusKm, setRadiusKm] = useState(5); // Default 5km radius
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);

  // Load state on mount
  useEffect(() => {
    const state = getOnboardingState();
    if (state.role !== "agent") {
      router.replace("/onboarding/role");
      return;
    }

    if (state.agentProfile) {
      const profile = state.agentProfile;
      setFullName(profile.fullName);
      setCounty(profile.county);
      setLatitude(profile.latitude);
      setLongitude(profile.longitude);
      setRadiusKm(profile.coverageRadiusKm);
    } else {
      // Pre-fill user's name if we have it from Telegram
      const userStr = sessionStorage.getItem("dira_auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.name) setFullName(user.name);
        } catch {
          // Ignore JSON parsing errors
        }
      }
    }
  }, [router]);

  // Save changes locally to localStorage for persistence
  useEffect(() => {
    if (!fullName && !county) return;
    saveOnboardingState({
      agentProfile: {
        fullName,
        county,
        latitude,
        longitude,
        coverageRadiusKm: radiusKm
      }
    });
  }, [fullName, county, latitude, longitude, radiusKm]);

  // Initialize map client-side
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    let linkElement: HTMLLinkElement | null = null;

    import("leaflet").then((L) => {
      if (!isMounted) return;

      // Add Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        linkElement = document.createElement("link");
        linkElement.id = "leaflet-css";
        linkElement.rel = "stylesheet";
        linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(linkElement);
      }

      // Initialize map using current state coordinates for initial view
      const map = L.map(mapContainerRef.current!).setView([latitude, longitude], 12);
      leafletMap.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OSM</a> contributors',
      }).addTo(map);

      // Custom icon to prevent asset load issues in production
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });

      const marker = L.marker([latitude, longitude], { icon: defaultIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      // Add Coverage Radius Circle (blue translucent) using initial radiusKm
      const circle = L.circle([latitude, longitude], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        radius: radiusKm * 1000
      }).addTo(map);
      circleRef.current = circle;

      // Markers dragging events
      marker.on("drag", () => {
        const pos = marker.getLatLng();
        setLatitude(Number(pos.lat.toFixed(6)));
        setLongitude(Number(pos.lng.toFixed(6)));
        if (circleRef.current) {
          circleRef.current.setLatLng(pos);
        }
      });
    }).catch((err) => {
      console.error("Leaflet loading failed:", err);
      setMapError("Failed to load map controls.");
    });

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle radius dynamically when slider value changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusKm * 1000);
      
      if (leafletMap.current) {
        const bounds = circleRef.current.getBounds();
        leafletMap.current.fitBounds(bounds, { padding: [10, 10] });
      }
    }
  }, [radiusKm]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(locale === "en" ? "Geolocation not supported by your browser." : "GPS haitumiki kwenye kifaa chako.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        if (leafletMap.current && markerRef.current && circleRef.current) {
          leafletMap.current.setView([lat, lng], 13);
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
        }
      },
      (error) => {
        console.error(error);
        alert(locale === "en" ? "Failed to access device location." : "Imeshindwa kupata eneo lako la GPS.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleBack = () => {
    saveOnboardingState({ step: "role" });
    router.push("/onboarding/role");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !county) {
      alert(locale === "en" ? "Please fill in all profile fields." : "Tafadhali jaza sehemu zote za wasifu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName,
        county,
        latitude,
        longitude,
        coverageRadiusKm: radiusKm
      };

      const res = await apiClient.post<AgentProfileResponse>("/api/agents/profile", payload);
      
      // Update sessionStorage
      if (res.user) {
        const userStr = sessionStorage.getItem("dira_auth_user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.name = res.user.name;
          userObj.isNewUser = false;
          sessionStorage.setItem("dira_auth_user", JSON.stringify(userObj));
        }
      }

      // Save step progress
      saveOnboardingState({ step: "welcome" });

      router.push("/onboarding/welcome");
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Submission failed.";
      alert(locale === "en" ? `Submission failed: ${errMsg}` : `Uwasilishaji umefeli: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center text-xs text-white/40">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 hover:text-white transition-all font-semibold"
          >
            <span>←</span>
            <span>{locale === "en" ? "Back" : "Nyuma"}</span>
          </button>
          <span>{locale === "en" ? "Step 3 of 4" : "Hatua ya 3 kati ya 4"}</span>
        </div>

        {/* Step Info */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight">
            {locale === "en" ? "Data Agent Profile" : "Wasifu wa Wakala"}
          </h1>
          <p className="text-xs text-white/50">
            {locale === "en"
              ? "Setup your weather sensing coverage boundaries."
              : "Weka mipaka ya eneo la usomaji data ya hali ya hewa."}
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {locale === "en" ? "Full Name" : "Majina Kamili"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. David Kiprop"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/30 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* County */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {locale === "en" ? "County" : "Kaunti"}
            </label>
            <select
              required
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#18182b] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-primary transition-all"
            >
              <option value="">-- {locale === "en" ? "Select" : "Chagua"} --</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Map Draggable Center Pin */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {locale === "en" ? "Coverage Center Map" : "Ramani ya Eneo la Wakala"}
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-lg font-bold transition-all hover:bg-primary/35"
              >
                📍 {locale === "en" ? "Use My Location" : "Eneo Langu Sasa"}
              </button>
            </div>
            
            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#141426] h-44 z-0">
              {mapError ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 p-4 text-center">
                  {mapError}
                </div>
              ) : (
                <div ref={mapContainerRef} className="w-full h-full" />
              )}
            </div>
          </div>

          {/* Coverage radius slider (1–10 km) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {locale === "en" ? "Coverage Radius" : "Kipenyo cha Eneo"}
              </span>
              <span className="text-primary font-bold">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Background data sync confirmation */}
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs flex space-x-3 items-start leading-relaxed">
            <span className="text-lg">📱</span>
            <p className="text-white/70">
              {locale === "en"
                ? "Your phone will sync weather data in the background. This uses less than 5MB of data per month."
                : "Simu yako itasawazisha data ya hewa kwa nyuma kiotomatiki. Hii inatumia chini ya MB 5 za data kwa mwezi."}
            </p>
          </div>

          {/* Privacy Policy Disclosure */}
          <p className="text-[10px] text-white/40 text-center leading-relaxed py-1">
            {locale === "en" ? (
              <>
                By continuing, you agree to Dira&apos;s{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                regarding sensor location data.
              </>
            ) : (
              <>
                Kwa kuendelea, unakubaliana na{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Sera ya Faragha
                </Link>{" "}
                ya Dira kuhusu eneo la sensorer.
              </>
            )}
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isSubmitting
              ? (locale === "en" ? "Submitting..." : "Inatuma...")
              : (locale === "en" ? "Submit & Continue" : "Tuma na Uendelee")}
          </button>
        </form>

        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-3/4 rounded-full" />
        </div>
      </div>
    </main>
  );
}
