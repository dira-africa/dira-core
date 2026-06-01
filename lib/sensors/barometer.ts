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

export interface BarometerReading {
  pressureHpa: number;
  altitudeM: number;
  temperatureC: number;
  humidityPct: number;
  simulated: boolean;
}

export class BarometerSensor {
  /**
   * Reads barometric pressure, falling back to a mathematically accurate simulation
   * based on altitude if the hardware sensor is unavailable.
   */
  static async getReading(altitudeM?: number | null): Promise<BarometerReading> {
    const targetAltitude = altitudeM !== undefined && altitudeM !== null ? altitudeM : 1795.0; // Default to Nairobi's altitude
    const temperature = 20.0 + (Math.random() * 4 - 2); // 18 to 22 degrees Celsius
    const humidity = 60.0 + (Math.random() * 10 - 5);    // 55% to 65% humidity

    // 1. Try to read from HTML5 Barometer Generic Sensor API
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
        if (!BarometerClass) throw new Error("Barometer constructor not found on window");
        const sensor = new BarometerClass({ frequency: 1 });
        
        const reading = await new Promise<number>((resolve, reject) => {
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
          pressureHpa: Number(reading.toFixed(2)),
          altitudeM: Number(targetAltitude.toFixed(1)),
          temperatureC: Number(temperature.toFixed(1)),
          humidityPct: Number(humidity.toFixed(1)),
          simulated: false
        };
      } catch (err) {
        console.warn("Hardware barometer read failed, falling back to simulation:", err);
      }
    }

    // 2. Fallback to mathematically accurate pressure simulation based on altitude
    // Standard sea level pressure is around 1013.25 hPa + small diurnal and random weather variation
    const baseSeaLevel = 1013.25;
    
    // Add diurnal weather cycle variation (max 1.5 hPa) + small random fluctuation (max 0.5 hPa)
    const hour = new Date().getHours();
    const diurnalVar = 1.2 * Math.sin((2 * Math.PI * (hour - 4)) / 12) + 0.3 * Math.sin((2 * Math.PI * hour) / 24);
    const randomVar = Math.random() * 1.0 - 0.5;
    const currentSeaLevel = baseSeaLevel + diurnalVar + randomVar;

    // Standard barometric formula: P = P_sea * (1 - (0.0065 * h) / (T + 0.0065 * h + 273.15))^5.257
    const lapseRate = 0.0065;
    const kelvinOffset = 273.15;
    const exponent = 5.257;

    const base = 1 - (lapseRate * targetAltitude) / (temperature + lapseRate * targetAltitude + kelvinOffset);
    const stationPressure = currentSeaLevel * Math.pow(base, exponent);

    return {
      pressureHpa: Number(stationPressure.toFixed(2)),
      altitudeM: Number(targetAltitude.toFixed(1)),
      temperatureC: Number(temperature.toFixed(1)),
      humidityPct: Number(humidity.toFixed(1)),
      simulated: true
    };
  }
}
