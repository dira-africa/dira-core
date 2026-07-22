/*
 * Copyright 2026 Dira Africa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function ContactClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    trackEvent("contact_form_submit", { email: form.email });

    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    }, 1200);
  };

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    isSw ? "Habari Dira Africa! Ningependa kuwasiliana nanyi." : "Hello Dira Africa! I'd like to get in touch."
  )}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Wasiliana Nasi" : "Contact Dira Africa"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Tutumie ujumbe hapa chini au wasiliana nasi moja kwa moja kupitia WhatsApp au barua pepe." 
                : "Get in touch with our team via our contact form, email, or WhatsApp chat."}
            </p>
          </div>
        </section>

        {/* Contact Layout */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Direct Details */}
            <ScrollReveal className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{isSw ? "Njia za Haraka" : "Direct Channels"}</h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">
                  {isSw 
                    ? "Tuko tayari kujibu maswali yako kuhusu pembejeo za kilimo, malipo ya airtime, au jinsi ya kujiunga." 
                    : "For direct support with token redemptions, airtime payouts, or dealer coordinates, feel free to use our quick channels."}
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-2xl transition-all"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">WhatsApp Chat</h4>
                    <p className="text-xs text-white/50 mt-0.5">+254 700 000 000</p>
                  </div>
                </a>
                <a
                  href="mailto:hello@dira.africa"
                  className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-2xl transition-all"
                >
                  <span className="text-2xl">✉</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">Email Address</h4>
                    <p className="text-xs text-white/50 mt-0.5">hello@dira.africa</p>
                  </div>
                </a>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal>
              <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.01] border border-white/5 p-8 rounded-3xl shadow-xl">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Jina Lako" : "Your Name"}
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Barua Pepe" : "Barua Pepe / Email"}
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Ujumbe" : "Message"}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3 bg-[#0A6E56] hover:bg-[#085a46] disabled:bg-[#0A6E56]/50 text-white font-extrabold rounded-xl transition-all shadow-md uppercase tracking-wider text-xs"
                >
                  {status === "submitting" ? (isSw ? "Inatuma..." : "Sending...") : (isSw ? "Tuma Ujumbe" : "Send Message")}
                </button>

                {status === "success" && (
                  <div role="status" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-bold">
                    {isSw ? "Asante! Ujumbe wako umetumwa." : "Message received! We will reply shortly."}
                  </div>
                )}
              </form>
            </ScrollReveal>

          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
