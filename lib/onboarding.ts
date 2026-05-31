export type OnboardingStep =
  | "language"
  | "role"
  | "farmer-profile"
  | "agent-profile"
  | "welcome"
  | "complete";

export interface OnboardingState {
  step: OnboardingStep;
  language: "en" | "sw" | null;
  role: "farmer" | "agent" | null;
  farmerProfile: {
    fullName: string;
    county: string;
    subCounty: string;
    latitude: number;
    longitude: number;
    farmSizeAcres: string;
    cropTypes: string[];
  } | null;
  agentProfile: {
    fullName: string;
    county: string;
    latitude: number;
    longitude: number;
    coverageRadiusKm: number;
  } | null;
}

const STORAGE_KEY = "dira_onboarding_state";

const DEFAULT_STATE: OnboardingState = {
  step: "language",
  language: null,
  role: null,
  farmerProfile: null,
  agentProfile: null,
};

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveOnboardingState(state: Partial<OnboardingState>): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const current = getOnboardingState();
  const updated = { ...current, ...state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearOnboardingState(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
