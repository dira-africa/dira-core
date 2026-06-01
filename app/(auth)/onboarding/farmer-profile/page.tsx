"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getOnboardingState, saveOnboardingState } from "@/lib/onboarding";
import { apiClient } from "@/lib/api-client";
import type { Map, Marker } from "leaflet";

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

const CROPS = [
  { id: "Maize", en: "Maize", sw: "Mahindi" },
  { id: "Beans", en: "Beans", sw: "Maharage" },
  { id: "Wheat", en: "Wheat", sw: "Ngano" },
  { id: "Tea", en: "Tea", sw: "Chai" },
  { id: "Coffee", en: "Coffee", sw: "Kahawa" },
  { id: "Vegetables", en: "Vegetables", sw: "Mboga mboga" },
  { id: "Other", en: "Other", sw: "Nyinginezo" }
];

interface FarmerProfileResponse {
  success: boolean;
  user?: {
    name?: string;
  };
}

export default function FarmerProfileStep() {
  const router = useRouter();
  const { locale } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [latitude, setLatitude] = useState(-1.2921); // Nairobi default
  const [longitude, setLongitude] = useState(36.8219);
  const [farmSize, setFarmSize] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // Load state on mount
  useEffect(() => {
    const state = getOnboardingState();
    if (state.role !== "farmer") {
      router.replace("/onboarding/role");
      return;
    }

    if (state.farmerProfile) {
      const profile = state.farmerProfile;
      setFullName(profile.fullName);
      setCounty(profile.county);
      setSubCounty(profile.subCounty);
      setLatitude(profile.latitude);
      setLongitude(profile.longitude);
      setFarmSize(profile.farmSizeAcres);
      setSelectedCrops(profile.cropTypes);
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
    if (!fullName && !county && !subCounty && !farmSize && selectedCrops.length === 0) return;
    saveOnboardingState({
      farmerProfile: {
        fullName,
        county,
        subCounty,
        latitude,
        longitude,
        farmSizeAcres: farmSize,
        cropTypes: selectedCrops
      }
    });
  }, [fullName, county, subCounty, latitude, longitude, farmSize, selectedCrops]);

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

      // Initialize map using current state for coordinates on first render
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

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLatitude(Number(pos.lat.toFixed(6)));
        setLongitude(Number(pos.lng.toFixed(6)));
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

        if (leafletMap.current && markerRef.current) {
          leafletMap.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }
      },
      (error) => {
        console.error(error);
        alert(locale === "en" ? "Failed to access device location." : "Imeshindwa kupata eneo lako la GPS.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCropToggle = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  const handleBack = () => {
    saveOnboardingState({ step: "role" });
    router.push("/onboarding/role");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !county || !subCounty || !farmSize || selectedCrops.length === 0) {
      alert(locale === "en" ? "Please fill in all profile fields." : "Tafadhali jaza sehemu zote za wasifu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName,
        county,
        subCounty,
        latitude,
        longitude,
        farmSizeAcres: parseFloat(farmSize),
        cropTypes: selectedCrops
      };

      const res = await apiClient.post<FarmerProfileResponse>("/api/farmers/profile", payload);
      
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
            {locale === "en" ? "Farmer Profile" : "Wasifu wa Mkulima"}
          </h1>
          <p className="text-xs text-white/50">
            {locale === "en"
              ? "Setup your crop region and location map coordinates."
              : "Weka mipaka ya shamba na eneo lako la GPS."}
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
              placeholder="e.g. Mary Atieno"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/30 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Location details */}
          <div className="grid grid-cols-2 gap-3">
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

            {/* Sub-county */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {locale === "en" ? "Sub-County" : "Wilaya"}
              </label>
              <input
                type="text"
                required
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
                placeholder="e.g. Likuyani"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/30 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Map Draggable Pin */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {locale === "en" ? "Farm GPS Location" : "Eneo la GPS la Shamba"}
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
            
            {/* Location coordinates display */}
            <div className="flex justify-between text-[10px] text-white/40 font-mono bg-black/25 p-2 rounded-xl border border-white/5">
              <span>Lat: {latitude}</span>
              <span>Lng: {longitude}</span>
            </div>
          </div>

          {/* Farm Size */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {locale === "en" ? "Farm Size (Acres)" : "Ukubwa wa Shamba (Ekari)"}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/30 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Crop Types checkboxes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {locale === "en" ? "Crop Types" : "Aina ya Mazao"}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
              {CROPS.map((crop) => (
                <label key={crop.id} className="flex items-center space-x-2 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    checked={selectedCrops.includes(crop.id)}
                    onChange={() => handleCropToggle(crop.id)}
                    className="h-4 w-4 bg-white/5 border-white/10 rounded focus:ring-0 text-primary"
                  />
                  <span className="text-xs text-white/80">
                    {locale === "en" ? crop.en : crop.sw}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy Policy Disclosure */}
          <p className="text-[10px] text-white/40 text-center leading-relaxed py-1">
            {locale === "en" ? (
              <>
                By continuing, you agree to Dira&apos;s{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                regarding farm GPS location.
              </>
            ) : (
              <>
                Kwa kuendelea, unakubaliana na{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Sera ya Faragha
                </Link>{" "}
                ya Dira kuhusu eneo la GPS la shamba.
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
