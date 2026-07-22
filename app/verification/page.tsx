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
import VerificationClient from "./VerificationClient";

export const metadata: Metadata = {
  title: "Data Verification — Dira Africa",
  description: "Verify crop submissions and barometer sync entries anchored on the Hedera ledger. Learn about Dira's climate data provenance pipeline.",
  alternates: {
    canonical: "/verification",
  },
};

export default function Page() {
  return <VerificationClient />;
}
