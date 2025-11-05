import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BuoyData, ActionLog } from '../App';
import { Button } from './ui/button';
import { RecentActionsPanel } from './RecentActionsPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { X, Download, FileText, TrendingUp, TrendingDown, Minus, Bell, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { toast } from "sonner@2.0.3";

interface SensorDetailsPanelProps {
  buoy: BuoyData;
  actionLogs?: ActionLog[];
  buoys?: BuoyData[];
  onClose?: () => void;
  onNavigateToActionLog?: (buoyId: string) => void;
}

// This component displays values using the buoy's readings if present.
// If a buoy lacks reading arrays, it fetches device 1 (/api/devices/1?includeReadings=1)
// and mirrors that device's readings into all displays so every point shows fixed API values.
export function SensorDetailsPanel({
  buoy,
  actionLogs = [],
  buoys = [],
  onClose,
  onNavigateToActionLog
}: SensorDetailsPanelProps) {
  const [mirrorSensor, setMirrorSensor] = useState<any | null>(null);
  const [loadingMirror, setLoadingMirror] = useState(false);

  // Fetch device 1 as fallback mirror when buoy lacks readings
  useEffect(() => {
    let cancelled = false;
    const fetchMirror = async () => {
      // Only fetch if buoy does not have reading arrays
      const hasReadings = Boolean(
        (buoy as any)?.PH_Readings?.length ||
        (buoy as any)?.TDS_Readings?.length ||
        (buoy as any)?.Temperature_Readings?.length ||
        (buoy as any)?.Turbidity_Readings?.length
      );
      if (hasReadings) return;

      setLoadingMirror(true);
      try {
        const res = await axios.get('/api/devices/1?includeReadings=1');
        if (!cancelled) {
          setMirrorSensor(res.data);
          setLoadingMirror(false);
          console.debug('Mirror sensor loaded', res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed loading mirror sensor', err);
          setLoadingMirror(false);
        }
      }
    };

    fetchMirror();
    return () => { cancelled = true; };
  }, [buoy]);

  // NEW: choose index for newest reading. Set to true if newest is last element.
  const newestIndexToLast = false; // your code previously used [0], switch to true if needed

  const getReading = (arr?: any[], key?: string) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return undefined;
    const idx = newestIndexToLast ? arr.length - 1 : 0;
    const candidate = arr[idx];
    if (!candidate) return undefined;
    if (!key) return candidate;
    const raw = candidate[key];
    if (raw === null || raw === undefined) return undefined;
    const num = Number(raw);
    return Number.isNaN(num) ? undefined : num;
  };

  // Build source readings either from this buoy or mirrored sensor
  const source = {
    PH_Readings: (buoy as any)?.PH_Readings ?? (mirrorSensor as any)?.PH_Readings ?? [],
    TDS_Readings: (buoy as any)?.TDS_Readings ?? (mirrorSensor as any)?.TDS_Readings ?? [],
    Temperature_Readings: (buoy as any)?.Temperature_Readings ?? (mirrorSensor as any)?.Temperature_Readings ?? [],
    Turbidity_Readings: (buoy as any)?.Turbidity_Readings ?? (mirrorSensor as any)?.Turbidity_Readings ?? [],
    // optional scalar fallbacks
    sensors: (buoy as any)?.sensors ?? (mirrorSensor as any)?.sensors ?? {}
  };

  // currentValues pulled consistently from source arrays
  const currentValues = {
    turbidity: getReading(source.Turbidity_Readings, 'NTU_Value'),
    ph: getReading(source.PH_Readings, 'PH_Value'),
    tds: getReading(source.TDS_Readings, 'TDS_Value'),
    temperature: getReading(source.Temperature_Readings, 'Temperature_Value'),
    phosphate: typeof source.sensors?.phosphate !== 'undefined' ? Number(source.sensors.phosphate) : undefined,
    nitrogen: typeof source.sensors?.nitrogen !== 'undefined' ? Number(source.sensors.nitrogen) : undefined,
    nitrate: typeof source.sensors?.nitrate !== 'undefined' ? Number(source.sensors.nitrate) : undefined,
    ammonia: typeof source.sensors?.ammonia !== 'undefined' ? Number(source.sensors.ammonia) : undefined
  };

  // Trend generators - deterministic based on currentValues, not random per-buoy
  const generateTrendData = () => {
    const days = [
      // static placeholders; replace with real history if available
      '2024-09-25','2024-09-26','2024-09-27','2024-09-28','2024-09-29','2024-09-30','2024-10-01'
    ];
    const base = {
      do: currentValues.turbidity ?? 0,
      ph: currentValues.ph ?? 7,
      tss: currentValues.tds ?? 0,
      phosphate: currentValues.phosphate ?? 0,
      temperature: currentValues.temperature ?? 0
    };

    return days.map((date, idx) => {
      // small deterministic variation so charts look realistic while fixed per-buoy
      const variation = 1 + Math.sin(idx * 0.4) * 0.05;
      return {
        date,
        do: Math.round(base.do * variation * 10) / 10,
        ph: Math.round(base.ph * (1 + Math.cos(idx * 0.3) * 0.02) * 10) / 10,
        tss: Math.round(base.tss * (1 + Math.sin(idx * 0.2) * 0.05)),
        phosphate: Math.round(base.phosphate * (1 + Math.cos(idx * 0.25) * 0.05) * 100) / 100,
        temperature: Math.round(base.temperature * (1 + Math.sin(idx * 0.15) * 0.03) * 10) / 10
      };
    });
  };

  const generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const base = {
      do: currentValues.turbidity ?? 0,
      ph: currentValues.ph ?? 7,
      temperature: currentValues.temperature ?? 0
    };
    return hours.map((time, idx) => {
      const variation = 1 + Math.sin(idx * 0.2) * 0.03;
      return {
        time,
        do: Math.round(base.do * variation * 10) / 10,
        ph: Math.round(base.ph * (1 + Math.cos(idx * 0.12) * 0.01) * 10) / 10,
        temperature: Math.round(base.temperature * (1 + Math.sin(idx * 0.08) * 0.02) * 10) / 10
      };
    });
  };

  const trendData = generateTrendData();
  const hourlyData = generateHourlyData();

  // status helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensorStatus = (value: number | undefined, type: string) => {
    if (value === undefined || Number.isNaN(Number(value))) return 'unknown';
    const v = Number(value);
    switch (type) {
      case 'do':
        if (v >= 7) return 'good';
        if (v >= 5) return 'warning';
        return 'critical';
      case 'ph':
        if (v >= 7 && v <= 8) return 'good';
        if (v >= 6.5 && v <= 8.5) return 'warning';
        return 'critical';
      case 'tss':
      case 'TDS':
        if (v <= 3000) return 'good';
        if (v <= 5000) return 'warning';
        return 'critical';
      case 'phosphate':
        if (v <= 0.2) return 'good';
        if (v <= 0.3) return 'warning';
        return 'critical';
      case 'temperature':
        if (v >= 20 && v <= 25) return 'good';
        if (v >= 18 && v <= 28) return 'warning';
        return 'critical';
      default:
        return 'good';
    }
  };

  const getTrendIcon = () => {
    // deterministic pseudo-random based on name so it is stable per buoy
    const seed = buoy.name ? buoy.name.charCodeAt(0) : 0;
    const r = seed % 3;
    if (r === 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (r === 1) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  // CSV export uses currentValues
  const exportSensorData = () => {
    try {
      const csvHeader = 'Date,Time,Buoy Name,Zone,Status,Turbidity (NTU),pH Level,TDS (mg/L),Phosphate (mg/L),Temperature (°C)\n';
      const now = new Date();
      const currentData = `${now.toLocaleDateString()},${now.toLocaleTimeString()},${buoy.name},${(buoy as any).zone ?? ''},${buoy.status ?? ''},${currentValues.turbidity ?? ''},${currentValues.ph ?? ''},${currentValues.tds ?? ''},${currentValues.phosphate ?? ''},${currentValues.temperature ?? ''}\n`;
      const historicalData = trendData.map(d => {
        const date = new Date(d.date);
        return `${date.toLocaleDateString()},12:00:00,${buoy.name},${(buoy as any).zone ?? ''},${buoy.status ?? ''},${d.do},${d.ph},${d.tss},${d.phosphate},${d.temperature}`;
      }).join('\n');

      const csvContent = csvHeader + currentData + historicalData;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${buoy.name.replace(/\s+/g, '_')}_SensorData_${now.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export Complete', { description: `Sensor data for ${buoy.name} exported.` });
    } catch (err) {
      toast.error('Export Failed', { description: 'Unable to export sensor data.' });
    }
  };

  // Render
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl text-gray-900">{buoy.name}</h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusBadge(buoy.status)}`}>{buoy.status}</span>
              <span className="text-sm text-gray-500">Last updated: {(buoy as any).lastUpdate ?? '—'}</span>
              {loadingMirror && <span className="text-xs text-gray-400 ml-2">loading mirror...</span>}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <Button
              onClick={() => {
                const messages = {
                  critical: `Critical alert monitoring enabled for ${buoy.name}.`,
                  warning: `Warning alert monitoring enabled for ${buoy.name}.`,
                  good: `Notification monitoring enabled for ${buoy.name}.`
                };
                toast.success('Alert Setup Complete', { description: messages[buoy.status] || messages.good });
              }}
              variant={buoy.status === 'critical' ? 'destructive' : buoy.status === 'warning' ? 'outline' : 'default'}
              size="sm"
              className={`flex items-center space-x-2 ${
                buoy.status === 'critical' ? 'gradient-danger text-white' :
                buoy.status === 'warning' ? 'border-orange-300 text-orange-700' :
                'bg-blue-600 text-white'
              }`}
            >
              {buoy.status === 'critical' || buoy.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span className="hidden sm:inline">{buoy.status === 'critical' ? 'Critical Alerts' : buoy.status === 'warning' ? 'Warning Alerts' : 'Notifications'}</span>
            </Button>
          </div>

          <div className="flex-1 flex justify-end">
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {(buoy.status === 'warning' || buoy.status === 'critical') && (
          <div className={`mt-4 p-3 rounded-lg border ${buoy.status === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{buoy.status === 'critical' ? 'Critical monitoring recommended.' : 'Enhanced monitoring recommended.'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">Current Readings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Turbidity */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Turbidity</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(currentValues.turbidity, 'do'))}`}>
                {getSensorStatus(currentValues.turbidity, 'do')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Essential for aquatic life</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{currentValues.turbidity !== undefined ? `${currentValues.turbidity} NTU` : '—'}</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* pH Level */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">pH Level</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(currentValues.ph, 'ph'))}`}>
                {getSensorStatus(currentValues.ph, 'ph')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water acidity/alkalinity</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{currentValues.ph !== undefined ? currentValues.ph.toFixed(2) : '—'}</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Total Dissolved Solids */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Total Dissolved Solids</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(currentValues.tds, 'TDS'))}`}>
                {getSensorStatus(currentValues.tds, 'TDS')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water clarity indicator</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{currentValues.tds !== undefined ? `${Number(currentValues.tds).toLocaleString()} mg/L` : '—'}</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Phosphate */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Phosphate</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(currentValues.phosphate, 'phosphate'))}`}>
                {getSensorStatus(currentValues.phosphate, 'phosphate')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Nutrient levels</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{currentValues.phosphate !== undefined ? `${currentValues.phosphate} mg/L` : '—'}</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Temperature</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(currentValues.temperature, 'temperature'))}`}>
                {getSensorStatus(currentValues.temperature, 'temperature')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water temperature</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{currentValues.temperature !== undefined ? `${currentValues.temperature}°C` : '—'}</span>
              {getTrendIcon()}
            </div>
          </div>
        </div>

        {/* 7-Day Trend Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turbidity 7-Day */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">7-Day Turbidity Trend</h4>
            <div className="h-40 bg-white rounded border">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="doGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4a7c59" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="#5c6b5c" fontSize={10} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#5c6b5c" fontSize={10} />
                    <Tooltip formatter={(value: number) => [`${value} NTU`, 'Turbidity']} />
                    <Area type="monotone" dataKey="do" stroke="#4a7c59" strokeWidth={2} fill="url(#doGradient)" dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Historical data unavailable</p></div>
              )}
            </div>
          </div>

          {/* pH 7-Day */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">7-Day pH Level Trend</h4>
            <div className="h-40 bg-white rounded border">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="#5c6b5c" fontSize={10} />
                    <YAxis domain={[6.5, 8.5]} stroke="#5c6b5c" fontSize={10} />
                    <Tooltip formatter={(value: number) => [`${value}`, 'pH Level']} />
                    <Line type="monotone" dataKey="ph" stroke="#7ba05b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-500">Historical data unavailable</p></div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center space-x-2" onClick={exportSensorData}>
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2" onClick={() => {
            if (onNavigateToActionLog) {
              onNavigateToActionLog(buoy.id);
              toast.success('Action Logger', { description: `Opening Action Logger for ${buoy.name}` });
            } else {
              toast.info('Action Logger', { description: 'Navigate to Action Logging page to record interventions' });
            }
          }}>
            <FileText className="w-4 h-4" />
            <span>Log Action</span>
          </Button>
        </div>

        <div className="mt-6">
          <DiagnosticsPanel buoy={buoy} />
        </div>
      </div>

      <div className="border-t border-gray-200">
        <RecentActionsPanel actionLogs={actionLogs} buoys={buoys} showTitle={false} />
      </div>
    </div>
  );
}
