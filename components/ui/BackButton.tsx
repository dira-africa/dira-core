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

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  /**
   * Explicit href to navigate to. If omitted, uses router.back() to go
   * to the previous history entry (falls back to fallbackHref).
   */
  href?: string;
  /** Fallback route used with router.back() when there is no previous history. */
  fallbackHref?: string;
  /** Optional label shown next to the chevron icon. */
  label?: string;
  className?: string;
}

/**
 * Reusable back-navigation button.
 *
 * Usage (with explicit destination):
 *   <BackButton href="/farmer/home" label="Home" />
 *
 * Usage (browser history):
 *   <BackButton fallbackHref="/farmer/home" />
 */
export default function BackButton({
  href,
  fallbackHref = "/",
  label,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const chevronIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-5 h-5 flex-shrink-0"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
      />
    </svg>
  );

  const baseClass =
    `inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors duration-150 ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClass} aria-label={label ?? "Go back"}>
        {chevronIcon}
        {label && <span className="text-sm font-semibold">{label}</span>}
      </Link>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button onClick={handleBack} className={baseClass} aria-label={label ?? "Go back"}>
      {chevronIcon}
      {label && <span className="text-sm font-semibold">{label}</span>}
    </button>
  );
}
