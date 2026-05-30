export type TranslationKey =
  | "nav.onboarding"
  | "nav.home"
  | "nav.wallet"
  | "nav.settings"
  | "nav.leaderboard"
  | "error.network"
  | "error.barometer"
  | "error.gps"
  | "error.daraja"
  | "auth.authenticating"
  | "auth.pleaseOpenTelegram"
  | "auth.authFailed"
  | "auth.retry";

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
    "auth.authenticating": "Securing connection to Dira Network...",
    "auth.pleaseOpenTelegram": "Please open this app inside Telegram to access the Dira Network.",
    "auth.authFailed": "Authentication failed. Make sure you are using a valid Telegram account.",
    "auth.retry": "Try Again",
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
    "auth.authenticating": "Tunatengeneza muunganisho salama wa Dira...",
    "auth.pleaseOpenTelegram": "Tafadhali fungua programu hii ndani ya Telegram ili kufikia Mtandao wa Dira.",
    "auth.authFailed": "Uthibitishaji umefeli. Hakikisha unatumia akaunti halali ya Telegram.",
    "auth.retry": "Jaribu Tena",
  },
};

