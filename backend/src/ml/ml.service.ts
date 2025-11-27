import { Injectable } from '@nestjs/common';

// If you're on Node 18+ you can use the built-in fetch.
// If not, install node-fetch and import it instead.

@Injectable()
export class MLService {
  // Base URL of your FastAPI app
  private readonly fastApiBaseUrl =
    process.env.ML_API_URL ?? 'http://127.0.0.1:8000';

  async getHyacinthForecast(limit = 30) {
    const url = `${this.fastApiBaseUrl}/forecast?limit=${limit}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`FastAPI /forecast error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    // data is the array of rows from hyacinth_forecast.csv
    return data;
  }

  // Optional: risk endpoint if you want it later
  async getBloomRisk(input: {
    EC_Phys_Water: number;
    pH_Diss_Water: number;
    PO4_P_Diss_Water: number;
    NO3_NO2_N_Diss_Water: number;
    NH4_N_Diss_Water: number;
  }) {
    const url = `${this.fastApiBaseUrl}/predict/risk`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`FastAPI /predict/risk error: ${res.status} ${res.statusText}`);
    }

    return res.json(); // { bloom_probability, bloom_class, interpretation }
  }
}
