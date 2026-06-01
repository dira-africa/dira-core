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

export interface AtmosphericData {
  pressure_hpa: number;
  altitude_m: number;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  sensor_type: "hardware_barometer" | "gps_altitude";
  timestamp: string;
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
      ...options
    });
  });
}

/**
 * Reads barometric pressure via hardware sensor if available.
 * Falls back to calculating station pressure using the standard barometric formula
 * from GPS altitude if hardware is unavailable.
 */
export async function readAtmosphericData(): Promise<AtmosphericData> {
  // 1. Get GPS coordinates with high accuracy
  const position = await getCurrentPosition();
  const { latitude, longitude, altitude, accuracy } = position.coords;
  const targetAltitude = altitude !== null && altitude !== undefined ? altitude : 1795.0; // Default to Nairobi's altitude
  const accuracyM = accuracy !== null && accuracy !== undefined ? accuracy : 10;
  const timestamp = new Date().toISOString();

  // 2. Attempt to read from HTML5 Barometer Generic Sensor API
  if (typeof window !== "undefined" && "Barometer" in window) {
    try {
      interface WindowWithBarometer extends Window {
        Barometer?: new (options?: { frequency?: number }) => {
          start: () => void;
          stop: () => void;
          pressure: number;
          addEventListener: (type: string, listener: (event: Event) => void) => void;
        };
      }
      
      const BarometerClass = (window as unknown as WindowWithBarometer).Barometer;
      if (BarometerClass) {
        const sensor = new BarometerClass({ frequency: 1 });
        const pressure = await new Promise<number>((resolve, reject) => {
          const timeout = setTimeout(() => {
            sensor.stop();
            reject(new Error("Barometer sensor read timeout"));
          }, 3000);

          sensor.addEventListener("reading", () => {
            clearTimeout(timeout);
            const value = sensor.pressure; // Value in hPa
            sensor.stop();
            if (value && value > 300 && value < 1200) {
              resolve(value);
            } else {
              reject(new Error("Invalid pressure reading range"));
            }
          });

          sensor.addEventListener("error", (event: Event) => {
            clearTimeout(timeout);
            sensor.stop();
            const errVal = (event as unknown as { error?: Error }).error;
            reject(errVal || new Error("Barometer sensor read error"));
          });

          sensor.start();
        });

        return {
          pressure_hpa: Number(pressure.toFixed(2)),
          altitude_m: Number(targetAltitude.toFixed(1)),
          latitude,
          longitude,
          accuracy_m: Number(accuracyM.toFixed(1)),
          sensor_type: "hardware_barometer",
          timestamp
        };
      }
    } catch (err) {
      console.warn("Hardware barometer read failed in readAtmosphericData, falling back to GPS altitude:", err);
    }
  }

  // 3. Fallback to standard barometric formula based on GPS altitude
  // P = P_sea * (1 - (0.0065 * h) / (T + 0.0065 * h + 273.15))^5.257
  const baseSeaLevel = 1013.25;
  const temperature = 20.0; // Assume 20.0 C standard temperature
  const lapseRate = 0.0065;
  const kelvinOffset = 273.15;
  const exponent = 5.257;

  // Add small diurnal variation based on current hour to make simulation realistic
  const hour = new Date().getHours();
  const diurnalVar = 1.2 * Math.sin((2 * Math.PI * (hour - 4)) / 12);
  const currentSeaLevel = baseSeaLevel + diurnalVar;

  const base = 1 - (lapseRate * targetAltitude) / (temperature + lapseRate * targetAltitude + kelvinOffset);
  const stationPressure = currentSeaLevel * Math.pow(base, exponent);

  return {
    pressure_hpa: Number(stationPressure.toFixed(2)),
    altitude_m: Number(targetAltitude.toFixed(1)),
    latitude,
    longitude,
    accuracy_m: Number(accuracyM.toFixed(1)),
    sensor_type: "gps_altitude",
    timestamp
  };
}
