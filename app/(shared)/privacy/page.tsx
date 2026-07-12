"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();

  const handleBack = () => {
    // If the browser has history, go back, otherwise redirect to onboarding
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        
        {/* Sticky/Fixed Header inside the card */}
        <div className="flex justify-between items-center text-xs text-white/40 pb-2 border-b border-white/5">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 hover:text-white transition-all font-semibold"
          >
            <span>←</span>
            <span>{locale === "en" ? "Back" : "Nyuma"}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex space-x-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                locale === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("sw")}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                locale === "sw" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
            >
              SW
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          {locale === "en" ? (
            <div className="space-y-4 text-xs text-white/70 leading-relaxed">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Dira Africa Privacy Policy
              </h1>
              <p className="text-[10px] text-primary font-semibold">
                Last updated: May 2026
              </p>
              <p>
                Dira Africa Limited (&ldquo;Dira&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates a Decentralised Physical Infrastructure Network (DePIN) that turns smartphones into a distributed weather sensing network across Kenya. We are committed to protecting your privacy and complying with the Data Protection Act, 2019 of Kenya.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                1. Introduction
              </h2>
              <p>
                This Privacy Policy describes how we collect, use, process, and protect your personal information when you use the Dira Telegram Mini App. By using Dira, you consent to the practices described in this policy.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                2. Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>
                  <strong className="text-white/95">GPS Location Data:</strong> We collect precise latitude and longitude coordinates of your farm (for Farmers) or coverage center (for Data Agents) to map weather patterns and agricultural zones.
                </li>
                <li>
                  <strong className="text-white/95">Barometric Pressure Readings:</strong> For Data Agents, we collect passive atmospheric pressure logs from your device&apos;s barometric sensor 4x daily.
                </li>
                <li>
                  <strong className="text-white/95">Crop Photo Metadata:</strong> For Farmers, we collect crop photos along with geographic metadata (latitude, longitude, timestamp) to verify crop health.
                </li>
                <li>
                  <strong className="text-white/95">Device Details:</strong> Device models are collected to calibrate barometric readings and optimize background sync processes.
                </li>
                <li>
                  <strong className="text-white/95">Telegram Account Data:</strong> We retrieve your Telegram User ID, first name, last name, and username to authenticate you securely.
                </li>
                <li>
                  <strong className="text-white/95">Phone Numbers:</strong> Encrypted immediately at rest using pgCrypto symmetric encryption. We never store phone numbers in plaintext.
                </li>
              </ul>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                3. How We Use Your Information
              </h2>
              <p>
                We use collected information solely for:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Establishing micro-climate data networks and localized weather patterns.</li>
                <li>Verifying agricultural conditions for climate index insurance mapping.</li>
                <li>Calculating and awarding Climate Token (DIRA) rewards to your wallet.</li>
                <li>Processing selected redemptions (Airtime, Agro-Dealer Vouchers, Circle distributions, M-Pesa).</li>
              </ul>
              <p className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-[11px] text-white/90">
                <strong>Zero Marketing Sale:</strong> We <strong>never</strong> sell, trade, or share your raw personal information with third parties for commercial marketing or advertising.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                4. Data Protection & Hedera Blockchain
              </h2>
              <p>
                Data integrity is anchored weekly to the Hedera blockchain via the Hedera Consensus Service (HCS). This anchoring creates immutable, timestamped records of weather datasets without exposing any personal identifiers, names, or GPS locations publicly. All phone numbers are locked using encryption keys kept strictly off-database.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                5. Your Rights & ODPC Compliance
              </h2>
              <p>
                In compliance with the Office of the Data Protection Commissioner (ODPC) of Kenya, you have the right to request access to, correction of, or deletion of your personal profile. You can withdraw consent to background sensor synching inside the app settings.
              </p>
              <p>
                For data access requests or privacy concerns, reach out to our Data Protection Team at{" "}
                <a href="mailto:privacy@diraafrica.org" className="text-primary hover:underline">
                  privacy@diraafrica.org
                </a>.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-white/70 leading-relaxed">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Sera ya Faragha ya Dira Africa
              </h1>
              <p className="text-[10px] text-primary font-semibold">
                Ilisasishwa mwisho: Mei 2026
              </p>
              <p>
                Dira Africa Limited (&ldquo;Dira&rdquo;, &ldquo;sisi&rdquo;, au &ldquo;yetu&rdquo;) inaendesha Mtandao wa Ugatuzi wa Miundombinu ya Kimwili (DePIN) unaogeuza simu kuwa mtandao wa kupima hali ya hewa nchini Kenya. Tumejitolea kulinda faragha yako na kufuata Sheria ya Ulinzi wa Data ya mwaka 2019 nchini Kenya.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                1. Utangulizi
              </h2>
              <p>
                Sera hii ya Faragha inaelezea jinsi tunavyokusanya, kutumia, kuchakata, na kulinda taarifa zako za kibinafsi unapotumia Programu ya Dira kwenye Telegram. Kwa kutumia Dira, unakubaliana na sera hii.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                2. Data Tunayokusanya
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>
                  <strong className="text-white/95">Kuratibu za GPS:</strong> Tunakusanya eneo halisi (latitude na longitude) la shamba lako (kwa Mkulima) au eneo lako la uwakala (kwa Wakala wa Data) ili kuainisha maeneo ya hali ya hewa.
                </li>
                <li>
                  <strong className="text-white/95">Shinikizo la Hewa (Barometer):</strong> Kwa Wakala wa Data, tunakusanya passive atmospheric pressure logs mara 4 kila siku kutoka kwenye kifaa chako.
                </li>
                <li>
                  <strong className="text-white/95">Picha na Metadata za Mazao:</strong> Kwa Mkulima, tunakusanya picha za mazao pamoja na kuratibu za GPS na muda picha ilipopigwa ili kuthibitisha afya ya mazao.
                </li>
                <li>
                  <strong className="text-white/95">Maelezo ya Simu:</strong> Tunakusanya aina ya simu ili kusaidia kurekebisha usomaji wa barometer na kuboresha matumizi ya data ya nyuma.
                </li>
                <li>
                  <strong className="text-white/95">Maelezo ya Akaunti ya Telegram:</strong> Tunatumia ID yako ya Telegram, jina la kwanza, jina la mwisho, na jina la mtumiaji kwa ajili ya uthibitishaji salama.
                </li>
                <li>
                  <strong className="text-white/95">Nambari za Simu:</strong> Zinasimbwa (encrypted) mara moja kwa usalama kwa kutumia algoriti ya pgCrypto na hazihifadhiwi kama maandishi wazi.
                </li>
              </ul>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                3. Jinsi Tunavyotumia Taarifa Zako
              </h2>
              <p>
                Tunatumia taarifa tunazokusanya kwa madhumuni yafuatayo pekee:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Kuweka mitandao ya data ya hewa na mifumo ya hali ya hewa nchini Kenya.</li>
                <li>Kuthibitisha ukuaji wa mazao kwa ajili ya ramani ya bima ya kilimo.</li>
                <li>Kuhesabu na kutoa zawadi za Climate Tokens (DIRA) kwenye mkoba wako.</li>
                <li>Kuwezesha malipo na ukombozi wa tokens (Airtime, Vocha za pembejeo, Dira Circle, au M-Pesa).</li>
              </ul>
              <p className="bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-[11px] text-white/90">
                <strong>Hakuna Uuzaji wa Data:</strong> Hatusambazi wala <strong>hatuuzi</strong> data yako kwa mashirika mengine kwa madhumuni ya matangazo au biashara.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                4. Ulinzi wa Data & Hedera Blockchain
              </h2>
              <p>
                Uaminifu wa data unathibitishwa kila wiki kwenye blockchain ya Hedera kwa kutumia Hedera Consensus Service (HCS). Mchakato huu haufichui jina, nambari ya simu, au eneo halisi la GPS la mtumiaji yeyote kwa umma.
              </p>

              <h2 className="text-sm font-bold text-white pt-2 border-t border-white/5">
                5. Haki Zako na Kuzingatia Mwongozo wa ODPC
              </h2>
              <p>
                Kulingana na Ofisi ya Kamishna wa Ulinzi wa Data nchini Kenya (ODPC), una haki ya kuona, kusahihisha au kufuta wasifu wako. Unaweza kuzima usawazishaji wa sensorer wakati wowote kwenye mipangilio ya programu.
              </p>
              <p>
                Kwa maswali yoyote kuhusu sera yetu ya faragha au usalama wa data, wasiliana na Timu yetu ya Ulinzi wa Data kupitia{" "}
                <a href="mailto:privacy@diraafrica.org" className="text-primary hover:underline">
                  privacy@diraafrica.org
                </a>.
              </p>
            </div>
          )}
        </div>

        {/* Footer/Accept button */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleBack}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {locale === "en" ? "I Understand" : "Nimeelewa"}
          </button>
        </div>
      </div>
    </main>
  );
}
