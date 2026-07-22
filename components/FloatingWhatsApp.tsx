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

import { useTranslation } from "@/lib/i18n/useTranslation";

export default function FloatingWhatsApp() {
  const { locale } = useTranslation();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
  const messageEn = "Hello Dira Africa! I'd like to get more information.";
  const messageSw = "Habari Dira Africa! Ningependa kupata habari zaidi.";
  
  const text = encodeURIComponent(locale === "sw" ? messageSw : messageEn);
  const url = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={locale === "sw" ? "Wasiliana nasi kwenye WhatsApp" : "Contact us on WhatsApp"}
      className="fixed bottom-24 md:bottom-8 right-6 z-40 flex items-center justify-center h-14 w-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
    >
      {/* Icon */}
      <svg
        className="w-7 h-7"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.528 1.97 14.071.945 11.454.945 6.015.945 1.59 5.315 1.586 10.746c-.001 1.638.431 3.238 1.252 4.654L1.87 21.037l5.777-1.883zm12.39-7.228c-.303-.153-1.8-.888-2.077-.989-.279-.101-.481-.153-.684.153-.201.304-.781.989-.957 1.193-.178.203-.355.228-.658.077-1.124-.563-1.922-.979-2.69-2.298-.203-.346-.203-.667-.078-.973.125-.306.279-.472.418-.634.14-.162.186-.279.279-.465.093-.188.047-.35-.024-.502-.07-.152-.684-1.65-.937-2.26-.247-.59-.499-.51-.684-.52-.178-.008-.38-.01-.582-.01-.203 0-.532.077-.81.381-.279.305-1.062 1.04-1.062 2.54 0 1.5 1.089 2.946 1.241 3.149.153.203 2.144 3.273 5.193 4.59.724.313 1.29.5 1.73.64.727.23 1.39.198 1.916.12.585-.088 1.8-.737 2.053-1.448.254-.71.254-1.32.178-1.448-.076-.128-.279-.203-.582-.356z" />
      </svg>

      {/* Tooltip / Label */}
      <span className="absolute right-16 bg-[#1A1A6E] border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl pointer-events-none">
        {locale === "sw" ? "Sogoa nasi" : "Chat with us"}
      </span>
    </a>
  );
}
