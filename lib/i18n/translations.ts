export type TranslationKey =
  | "nav.onboarding"
  | "nav.home"
  | "nav.wallet"
  | "nav.settings"
  | "nav.leaderboard"
  | "error.network"
  | "error.barometer"
  | "error.gps"
  | "error.daraja";

export const translations: Record<"en" | "sw", Record<TranslationKey, string>> = {
  en: {
    "nav.onboarding": "Onboarding",
    "nav.home": "Home",
    "nav.wallet": "Wallet",
    "nav.settings": "Settings",
    "nav.leaderboard": "Leaderboard",
    "error.network": "A network error occurred. Please check your internet connection and try again.",
    "error.barometer": "Unable to access barometric sensor. Passive sync is unavailable.",
    "error.gps": "GPS location permission denied. Geo-tagged crops require active location services.",
    "error.daraja": "B2C M-Pesa cashout failed. The Daraja production gateway is currently inactive.",
  },
  sw: {
    "nav.onboarding": "Usajili",
    "nav.home": "Nyumbani",
    "nav.wallet": "Mkoba",
    "nav.settings": "Mipangilio",
    "nav.leaderboard": "Bao la Viongozi",
    "error.network": "Itifaki ya mtandao imefeli. Tafadhali kagua mtandao wako na ujaribu tena.",
    "error.barometer": "Hatuwezi kusoma kipima hewa (barometer). Usawazishaji wa data hauwezekani.",
    "error.gps": "Ruhusa ya GPS imekataliwa. Picha za mazao zinahitaji huduma ya eneo ifanye kazi.",
    "error.daraja": "Ulipaji wa M-Pesa umefeli. Lango la uzalishaji la Daraja halijawashwa kwa sasa.",
  },
};
