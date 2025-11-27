// src/components/SystemOverview.tsx
import React, { useEffect, useState } from 'react';
import { BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Zone } from './MainDashboard';

/**
 * Use Vite env if available; cast import.meta to any to avoid TS complaints
 * when Vite types aren't configured in the project.
 */
const API_BASE: string = ((import.meta as any)?.env?.VITE_API_URL as string) ?? 'http://127.0.0.1:8000';

interface SystemOverviewProps {
  buoys: BuoyData[];
  selectedZone: Zone;
}

/**
 * SystemOverview
 * - Shows a set of small summary cards
 * - Fetches Bloom Risk from backend and displays it in the "Bloom Risk" card
 */
export function SystemOverview({ buoys, selectedZone }: SystemOverviewProps) {
  // --- Filter buoys by selected zone
  const filteredBuoys = selectedZone === 'overall'
    ? buoys
    : buoys.filter(b => b.zone === selectedZone);

  // --- Basic counts & aggregated metrics
  const goodBuoys = filteredBuoys.filter(b => b.status === 'good').length;
  const warningBuoys = filteredBuoys.filter(b => b.status === 'warning').length;
  const criticalBuoys = filteredBuoys.filter(b => b.status === 'critical').length;
  const totalAlerts = filteredBuoys.reduce((acc, buoy) => acc + (buoy.alerts?.length || 0), 0);

  const avgTemperature = filteredBuoys.length > 0
    ? filteredBuoys.reduce((acc, buoy) => acc + (buoy.sensors?.temperature ?? 0), 0) / filteredBuoys.length
    : 0;
  const avgPH = filteredBuoys.length > 0
    ? filteredBuoys.reduce((acc, buoy) => acc + (buoy.sensors?.ph ?? 0), 0) / filteredBuoys.length
    : 0;
  const avgDO = filteredBuoys.length > 0
    ? filteredBuoys.reduce((acc, buoy) => acc + (buoy.sensors?.do ?? 0), 0) / filteredBuoys.length
    : 0;

  // Robust extractor to average different key names that might exist in your buoys
  const meanOf = (keys: string[]) => {
    if (filteredBuoys.length === 0) return 0;
    const vals = filteredBuoys.map(b => {
      for (const k of keys) {
        const v = (b.sensors as any)?.[k];
        if (typeof v === 'number' && Number.isFinite(v)) return v;
      }
      return 0;
    });
    return vals.reduce((a, c) => a + c, 0) / vals.length;
  };

  const avgEC = meanOf(['EC_Phys_Water', 'ec', 'conductivity']);
  const avgPO4 = meanOf(['PO4_P_Diss_Water', 'po4']);
  const avgNO3 = meanOf(['NO3_NO2_N_Diss_Water', 'no3']);
  const avgNH4 = meanOf(['NH4_N_Diss_Water', 'nh4']);

  // --- Bloom risk state (from API)
  const [bloomProbability, setBloomProbability] = useState<number | null>(null);
  const [bloomInterpretation, setBloomInterpretation] = useState<string | null>(null);
  const [bloomClass, setBloomClass] = useState<number | null>(null);

  // Fetch bloom risk periodically and on dependencies change
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function fetchRisk() {
      const payload = {
        EC_Phys_Water: Number.isFinite(avgEC) ? avgEC : 0,
        pH_Diss_Water: Number.isFinite(avgPH) ? avgPH : 7.0,
        PO4_P_Diss_Water: Number.isFinite(avgPO4) ? avgPO4 : 0,
        NO3_NO2_N_Diss_Water: Number.isFinite(avgNO3) ? avgNO3 : 0,
        NH4_N_Diss_Water: Number.isFinite(avgNH4) ? avgNH4 : 0,
      };

      try {
        const resp = await fetch(`${API_BASE}/predict/risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

        const data = await resp.json();

        // expected: { bloom_probability: number, bloom_class: number, interpretation: string }
        const prob = typeof data?.bloom_probability === 'number' ? data.bloom_probability : null;
        const interp = typeof data?.interpretation === 'string' ? data.interpretation : null;
        const cls = typeof data?.bloom_class === 'number' ? data.bloom_class : null;

        if (!mounted) return;

        if (prob !== null) setBloomProbability(Number(prob));
        if (interp !== null) setBloomInterpretation(interp);
        if (cls !== null) setBloomClass(cls);
      } catch (err) {
        // graceful fallback: derive a simple guess if API fails
        console.warn('Failed to fetch /predict/risk — falling back to heuristic', err);
        if (!mounted) return;
        const localProbGuess = (avgPH && (avgPH >= 8 || avgPH <= 6.5)) ? 0.55 : 0.2;
        setBloomProbability(localProbGuess);
        setBloomInterpretation(localProbGuess > 0.6 ? 'High bloom risk' : localProbGuess > 0.3 ? 'Moderate bloom risk' : 'Low bloom risk');
        setBloomClass(localProbGuess >= 0.5 ? 1 : 0);
      }
    }

    fetchRisk();
    const id = setInterval(fetchRisk, 30 * 1000); // refresh every 30s

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, buoys]);

  // convert probability to UI styles + label
  const getRiskStyle = (prob?: number | null) => {
    if (prob == null) return { color: 'text-gray-600', border: 'border-gray-200', bg: 'bg-gray-50', label: 'Unknown' };
    if (prob >= 0.7) return { color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50', label: 'High bloom risk' };
    if (prob >= 0.4) return { color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', label: 'Moderate bloom risk' };
    return { color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', label: 'Low bloom risk' };
  };

  const riskStyle = getRiskStyle(bloomProbability);

  // --- Build cards: keep the original ones; last card is Bloom Risk
  const cards = [
    {
      title: 'System Status',
      value: `${goodBuoys}/${filteredBuoys.length} Good`,
      description: `${criticalBuoys} critical, ${warningBuoys} warnings`,
      icon: (
        <svg className={`w-6 h-6 ${criticalBuoys > 0 ? 'text-red-600' : warningBuoys > 0 ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: criticalBuoys > 0 ? 'border-red-200 bg-red-50' : warningBuoys > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
    },
    {
      title: 'Active Alerts',
      value: totalAlerts.toString(),
      description: 'Across all monitoring points',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: totalAlerts > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
    },
    {
      title: 'Avg Temperature',
      value: `${avgTemperature.toFixed(1)}°C`,
      description: 'Current water temperature',
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'border-orange-200 bg-orange-50'
    },
    {
      title: 'Avg pH Level',
      value: avgPH.toFixed(1),
      description: 'Water acidity level',
      icon: (
        <svg className={`w-6 h-6 ${avgPH < 6.5 || avgPH > 8.5 ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color: avgPH < 6.5 || avgPH > 8.5 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
    },
    {
      title: 'Avg Dissolved O₂',
      value: `${avgDO.toFixed(1)} mg/L`,
      description: 'Oxygen levels in water',
      icon: (
        <svg className={`w-6 h-6 ${avgDO < 5 ? 'text-red-600' : avgDO < 7 ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: avgDO < 5 ? 'border-red-200 bg-red-50' : avgDO < 7 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
    },
    // Bloom Risk card (the one you requested)
    {
      title: 'Bloom Risk',
      value: bloomInterpretation ?? 'Unknown',
      description: bloomProbability != null ? `Probability: ${(bloomProbability * 100).toFixed(0)}%` : 'Probability: N/A',
      icon: (
        <svg className={`w-6 h-6 ${riskStyle.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-3 0-5 2.7-5 6s2 6 5 6 5-2.7 5-6-2-6-5-6z" />
        </svg>
      ),
      color: `${riskStyle.border} ${riskStyle.bg}`
    }
  ];

  // --- Render grid of cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.color} border`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 mb-1">{card.value}</div>
            <p className="text-xs text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SystemOverview;
