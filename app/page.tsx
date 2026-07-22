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

import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Dira Africa — Decentralised Physical Weather Sensing Network",
  description: "Dira Africa is a DePIN network converting smartphones into weather sensors across Kenya. Earn Climate Tokens for verified crop reports and pressure tracking.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dira Africa — Decentralised Physical Weather Sensing Network",
    description: "Participate in Kenya's smartphone weather DePIN. Verify crops, share barometric telemetry, and earn Climate Tokens.",
    url: "https://dira.africa",
    siteName: "Dira Africa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dira Africa — Decentralised Physical Weather Sensing Network",
    description: "Participate in Kenya's smartphone weather DePIN. Verify crops, share barometric telemetry, and earn Climate Tokens.",
  },
};

export default function Page() {
  return <HomeClient />;
}
