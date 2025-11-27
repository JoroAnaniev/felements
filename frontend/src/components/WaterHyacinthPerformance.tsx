// src/components/WaterHyacinthPerformance.tsx
import React, { useEffect, useState } from 'react';
import { BuoyData, User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Zone } from './MainDashboard';
import { Leaf, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { HyacinthThresholdAlerts } from './HyacinthThresholdAlerts';

/**
 * NOTE:
 * - This component forces a single API-driven hyacinth percent across entire UI.
 * - If API fails it falls back to local buoys average.
 * - Ensure VITE_API_URL is set in your frontend .env (e.g. VITE_API_URL=http://127.0.0.1:8000)
 */

function YourCardComponent() {
  const [overallHyacinth, setOverallHyacinth] = useState<number>(0);

  useEffect(() => {
    const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://127.0.0.1:8000';
    let mounted = true;
    const controller = new AbortController();

    async function fetchCoverage() {
      try {
        // POST zeros — backend expects water-quality payload; adapt if needed
        const res = await fetch(`${API_BASE}/predict/coverage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            EC_Phys_Water: 0.0,
            pH_Diss_Water: 7.0,
            PO4_P_Diss_Water: 0.0,
            NO3_NO2_N_Diss_Water: 0.0,
            NH4_N_Diss_Water: 0.0,
          }),
        });

        if (!res.ok) throw new Error(`Coverage endpoint returned ${res.status}`);

        const data = await res.json();
        if (data && typeof data.predicted_coverage_percent === 'number' && data.predicted_coverage_percent >= 0) {
          if (mounted) setOverallHyacinth(Number(data.predicted_coverage_percent));
          return;
        }

        // fallback to forecast endpoint (no-payload)
        const f = await fetch(`${API_BASE}/forecast?limit=1`, { signal: controller.signal });
        if (f.ok) {
          const arr = await f.json();
          if (Array.isArray(arr) && arr.length > 0) {
            const last = arr[arr.length - 1];
            const yhat = (typeof last.yhat === 'number') ? last.yhat : (typeof last.predicted_coverage === 'number' ? last.predicted_coverage : null);
            if (mounted && typeof yhat === 'number') {
              setOverallHyacinth(Number(yhat));
              return;
            }
          }
        }
      } catch (err) {
        console.warn('YourCardComponent: coverage fetch failed, leaving current value', err);
      }
    }

    fetchCoverage();
    const interval = setInterval(fetchCoverage, 30_000); // refresh 30s

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <span className="text-2xl">
      {overallHyacinth.toFixed(1)}%
    </span>
  );
}

export default YourCardComponent;

interface WaterHyacinthPerformanceProps {
  buoys: BuoyData[];
  selectedZone: Zone;
  currentUser: User | null;
  isGuestMode: boolean;
}

export function WaterHyacinthPerformance({ buoys, selectedZone, currentUser, isGuestMode }: WaterHyacinthPerformanceProps) {
  // local fallback overall computed from buoys (if API unreachable)
  const localOverallHyacinth = buoys.length > 0
    ? buoys.reduce((acc, buoy) => acc + (buoy.sensors.hyacinth || 0), 0) / buoys.length
    : 0;

  // API-driven overall value
  const [apiOverallHyacinth, setApiOverallHyacinth] = useState<number | null>(null);

  useEffect(() => {
    const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://127.0.0.1:8000';
    let mounted = true;
    const controller = new AbortController();

    async function fetchOverall() {
      try {
        const res = await fetch(`${API_BASE}/predict/coverage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            EC_Phys_Water: 0.0,
            pH_Diss_Water: 7.0,
            PO4_P_Diss_Water: 0.0,
            NO3_NO2_N_Diss_Water: 0.0,
            NH4_N_Diss_Water: 0.0,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.predicted_coverage_percent === 'number' && data.predicted_coverage_percent >= 0) {
            if (mounted) setApiOverallHyacinth(Number(data.predicted_coverage_percent));
            return;
          }
        }

        // fallback to forecast
        const f = await fetch(`${API_BASE}/forecast?limit=1`, { signal: controller.signal });
        if (f.ok) {
          const arr = await f.json();
          if (Array.isArray(arr) && arr.length > 0) {
            const last = arr[arr.length - 1];
            const yhat = (typeof last.yhat === 'number') ? last.yhat : (typeof last.predicted_coverage === 'number' ? last.predicted_coverage : null);
            if (mounted && typeof yhat === 'number') {
              setApiOverallHyacinth(Number(yhat));
              return;
            }
          }
        }
      } catch (err) {
        console.warn('fetchOverall failed', err);
      }
    }

    fetchOverall();
    const id = setInterval(fetchOverall, 30_000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, [buoys]);

  // final displayed overall: prefer API value, otherwise local fallback
  const displayedOverall = selectedZone === 'overall'
    ? (apiOverallHyacinth ?? localOverallHyacinth)
    : (apiOverallHyacinth ?? localOverallHyacinth);

  // IMPORTANT: you asked every zone and sensor to display the same API number.
  // So we force zoneAvg and buoy hyacinth to displayedOverall below.

  const zoneData = {
    zone1: buoys.filter(b => b.zone === 'zone1'),
    zone2: buoys.filter(b => b.zone === 'zone2'),
    zone3: buoys.filter(b => b.zone === 'zone3'),
    zone4: buoys.filter(b => b.zone === 'zone4'),
    zone5: buoys.filter(b => b.zone === 'zone5')
  };

  const getZoneAverage = (_zoneBuoys: BuoyData[]) => {
    // ignore actual buoys; always return the universal number
    return displayedOverall;
  };

  const getHyacinthStatus = (level: number) => {
    if (level >= 60) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical', icon: AlertTriangle };
    if (level >= 35) return { status: 'warning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Warning', icon: TrendingUp };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Good', icon: CheckCircle };
  };

  const getTrend = (buoy: BuoyData) => {
    if (!buoy.historicalData || buoy.historicalData.length < 2) return null;
    const current = displayedOverall; // forced
    const previous = buoy.historicalData[buoy.historicalData.length - 2].hyacinth ?? current;
    const change = current - previous;
    return { change, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
  };

  const overallStatus = getHyacinthStatus(displayedOverall);
  const StatusIcon = overallStatus.icon;

  const zoneNames = {
    zone1: 'Zone 1 - North',
    zone2: 'Zone 2 - Northeast',
    zone3: 'Zone 3 - Central',
    zone4: 'Zone 4 - West',
    zone5: 'Zone 5 - South'
  };

  return (
    <div className="space-y-6">
      <HyacinthThresholdAlerts
        currentUser={currentUser}
        buoys={buoys}
        isGuestMode={isGuestMode}
      />

      <Card className={`${overallStatus.bg} border-2 ${overallStatus.border}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className={`w-5 h-5 ${overallStatus.color}`} />
              <span>Water Hyacinth Coverage</span>
            </div>
            <div className={`flex items-center space-x-2 ${overallStatus.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="text-sm">{overallStatus.label}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">
                  {selectedZone === 'overall' ? 'Overall Coverage' : zoneNames[selectedZone]}
                </span>
                <span className={`text-2xl ${overallStatus.color}`}>
                  {displayedOverall.toFixed(1)}%
                </span>
              </div>
              <Progress value={displayedOverall} className="h-3" />
            </div>
            <p className="text-sm text-gray-600">
              {displayedOverall >= 60
                ? 'Critical levels detected. Immediate intervention required.'
                : displayedOverall >= 35
                  ? 'Elevated levels. Increased monitoring and intervention recommended.'
                  : 'Levels within acceptable range. Continue routine monitoring.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {selectedZone === 'overall' && (
        <Card className="glass-card border-0 shadow-professional">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <span>Zone Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(zoneData).map(([zoneKey, zoneBuoys]) => {
                const zoneAvg = getZoneAverage(zoneBuoys); // forced to API number
                const zoneStatus = getHyacinthStatus(zoneAvg);
                const ZoneIcon = zoneStatus.icon;

                return (
                  <div key={zoneKey} className={`p-4 rounded-lg border ${zoneStatus.border} ${zoneStatus.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ZoneIcon className={`w-4 h-4 ${zoneStatus.color}`} />
                        <span className="text-sm text-gray-700">{zoneNames[zoneKey as keyof typeof zoneNames]}</span>
                      </div>
                      <span className={`${zoneStatus.color}`}>
                        {zoneAvg.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={zoneAvg} className="h-2" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{zoneBuoys.length} sensors</span>
                      <span className={`text-xs ${zoneStatus.color}`}>{zoneStatus.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-0 shadow-professional">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Sensor Readings & Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {buoys.map(buoy => {
              const hyacinth = displayedOverall; // force same number
              const status = getHyacinthStatus(hyacinth);
              const trend = getTrend(buoy);
              const BuoyIcon = status.icon;

              return (
                <div
                  key={buoy.id}
                  className={`p-4 rounded-lg border ${status.border} ${status.bg} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <BuoyIcon className={`w-4 h-4 ${status.color}`} />
                      <div>
                        <h4 className="text-sm text-gray-900">{buoy.name}</h4>
                        <p className="text-xs text-gray-500">{zoneNames[buoy.zone]}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {trend && (
                        <div className={`flex items-center space-x-1 ${
                          trend.direction === 'up' ? 'text-red-600' :
                          trend.direction === 'down' ? 'text-green-600' :
                          'text-gray-500'
                        }`}>
                          {trend.direction === 'up' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : trend.direction === 'down' ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : null}
                          <span className="text-xs">
                            {Math.abs(trend.change).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <span className={`${status.color}`}>
                        {hyacinth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={hyacinth} className="h-2 mb-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last update: {buoy.lastUpdate}</span>
                    {trend && trend.direction === 'up' && trend.change >= 3 && (
                      <span className="text-xs text-amber-600 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Rapid increase detected</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
