/*
 * Copyright 2026 Blockchain & Climate Institute
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

import { readAtmosphericData, AtmosphericData } from "./sensors";
import { apiClient } from "./api-client";

const DB_NAME = "dira_offline_sync";
const DB_VERSION = 1;
const STORE_NAME = "readings";
const LAST_SYNC_KEY = "dira-last-sync-time";

interface OfflineReading extends AtmosphericData {
  id?: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this device."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function saveOfflineReading(reading: AtmosphericData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(reading);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOfflineReadings(): Promise<OfflineReading[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteOfflineReading(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function syncPendingOfflineReadings(): Promise<void> {
  try {
    const readings = await getOfflineReadings();
    if (readings.length === 0) return;

    for (const reading of readings) {
      const { id, ...payload } = reading;
      try {
        const res = await apiClient.post<any>("/api/atmospheric/submit", payload);
        if (res.success || res.error?.code === "DAILY_LIMIT_REACHED" || res.error?.code === "PRESSURE_OUT_OF_RANGE" || res.error?.code === "LOCATION_OUTSIDE_KENYA") {
          if (id !== undefined) {
            await deleteOfflineReading(id);
          }
        }
      } catch (err) {
        console.error("Failed to upload offline reading item:", err);
      }
    }
  } catch (err) {
    console.error("Failed to sync pending offline readings:", err);
  }
}

/**
 * Triggers barometer read and syncs reading online or saves offline if no connectivity.
 */
export async function performSync(): Promise<{ success: boolean; status: "synced_online" | "saved_offline"; data: AtmosphericData }> {
  // 1. Debounce Check: 90 minutes limit
  if (typeof window !== "undefined") {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
      const diffMs = Date.now() - new Date(lastSync).getTime();
      const waitMs = 90 * 60 * 1000;
      if (diffMs < waitMs) {
        const remainingMinutes = Math.ceil((waitMs - diffMs) / (60 * 1000));
        throw new Error(`COOLDOWN:${remainingMinutes}`);
      }
    }
  }

  // 2. Read atmospheric sensor data
  const data = await readAtmosphericData();

  // 3. Connectivity check
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (isOnline) {
    // Sync online
    const res = await apiClient.post<{ success: boolean }>("/api/atmospheric/submit", data);
    if (!res.success) {
      throw new Error("Failed to submit reading to the server.");
    }
    
    // Save last sync time only on successful online sync
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    // Flush any pending offline syncs in background
    syncPendingOfflineReadings();

    return { success: true, status: "synced_online", data };
  } else {
    // Save offline
    await saveOfflineReading(data);
    return { success: true, status: "saved_offline", data };
  }
}

// Attach auto-sync triggers on online reconnection
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Connectivity restored. Starting offline queue upload...");
    syncPendingOfflineReadings();
  });
}
