import React from 'react';
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

export function SensorDetailsPanel({ buoy, actionLogs = [], buoys = [], onClose, onNavigateToActionLog }: SensorDetailsPanelProps) {
  // Export sensor data to CSV
  const exportSensorData = () => {
    try {
      // Generate comprehensive CSV data
      const csvHeader = 'Date,Time,Buoy Name,Zone,Status,Turbidity (NTU),pH Level,TSS (mg/L),Phosphate (mg/L),Temperature (°C)\n';
      
      // Current reading
      const now = new Date();
      const currentData = `${now.toLocaleDateString()},${now.toLocaleTimeString()},${buoy.name},${buoy.zone},${buoy.status},${buoy.sensors.do},${buoy.sensors.ph},${buoy.sensors.tss},${buoy.sensors.phosphate},${buoy.sensors.temperature}\n`;
      
      // Add 7-day historical trend data
      const trendData = generateTrendData();
      const historicalData = trendData.map(data => {
        const date = new Date(data.date);
        return `${date.toLocaleDateString()},12:00:00,${buoy.name},${buoy.zone},${buoy.status},${data.do},${data.ph},${data.tss},${data.phosphate},${data.temperature}`;
      }).join('\n');
      
      const csvContent = csvHeader + currentData + historicalData;
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${buoy.name.replace(/\s+/g, '_')}_SensorData_${now.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export Complete', {
        description: `Sensor data for ${buoy.name} has been exported successfully.`
      });
    } catch (error) {
      toast.error('Export Failed', {
        description: 'Unable to export sensor data. Please try again.'
      });
    }
  };

  // Generate 7-day trend data for the selected buoy
  const generateTrendData = () => {
    const days = ['2024-09-25', '2024-09-26', '2024-09-27', '2024-09-28', '2024-09-29', '2024-09-30', '2024-10-01'];
    
    // Create realistic trend data based on current values
    const currentValues = buoy.sensors;
    
    return days.map((date, index) => {
      // Add some realistic variation to the data
      const variation = 0.85 + (Math.sin(index * 0.5) * 0.3); // Creates realistic fluctuation
      const dayFactor = 1 - (index * 0.02); // Slight decline over time
      
      return {
        date,
        do: Math.round((currentValues.do * variation * dayFactor) * 10) / 10,
        ph: Math.round((currentValues.ph * (0.95 + (Math.cos(index * 0.7) * 0.1))) * 10) / 10,
        tss: Math.round(currentValues.tss * (1.2 - (index * 0.05)) * (0.9 + Math.random() * 0.2)),
        phosphate: Math.round((currentValues.phosphate * (0.8 + (index * 0.05)) * (0.9 + Math.random() * 0.2)) * 100) / 100,
        temperature: Math.round((currentValues.temperature * (0.95 + (Math.sin(index * 0.3) * 0.1))) * 10) / 10
      };
    });
  };

  const trendData = generateTrendData();

  // Debug: Log the trend data to ensure it's being generated
  console.log('Trend data for', buoy.name, ':', trendData);

  // Generate 24-hour hourly data for detailed view
  const generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return `${hour}:00`;
    });

    const currentValues = buoy.sensors;
    
    return hours.map((time, index) => {
      const hourlyVariation = 0.9 + (Math.sin(index * 0.3) * 0.2);
      return {
        time,
        do: Math.round((currentValues.do * hourlyVariation) * 10) / 10,
        ph: Math.round((currentValues.ph * (0.98 + (Math.cos(index * 0.2) * 0.04))) * 10) / 10,
        temperature: Math.round((currentValues.temperature * (0.96 + (Math.sin(index * 0.15) * 0.08))) * 10) / 10
      };
    });
  };

  const hourlyData = generateHourlyData();

  // Debug: Log the hourly data
  console.log('Hourly data for', buoy.name, ':', hourlyData);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensorStatus = (value: number, type: string) => {
    // Define thresholds for different sensor types
    switch (type) {
      case 'do': // Turbidity
        if (value >= 7) return 'good';
        if (value >= 5) return 'warning';
        return 'critical';
      case 'ph':
        if (value >= 7.0 && value <= 8.0) return 'good';
        if (value >= 6.5 && value <= 8.5) return 'warning';
        return 'critical';
      case 'tss': // Total Dissolved Solids
        if (value <= 3000) return 'good';
        if (value <= 5000) return 'warning';
        return 'critical';
      case 'phosphate':
        if (value <= 0.2) return 'good';
        if (value <= 0.3) return 'warning';
        return 'critical';
      case 'temperature':
        if (value >= 20 && value <= 25) return 'good';
        if (value >= 18 && value <= 28) return 'warning';
        return 'critical';
      default:
        return 'good';
    }
  };

  const getTrendIcon = () => {
    // Mock trend data - in a real app this would come from historical data
    const trends = ['up', 'down', 'stable'];
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    
    switch (randomTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleNotificationSetup = () => {
    toast.success('Notification Alert Setup', {
      description: `Smart alerts activated for ${buoy.name}. You'll be notified of critical changes in water quality parameters.`,
      duration: 4000,
    });
  };

  const getAlertButtonStyle = () => {
    if (buoy.status === 'critical') {
      return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    } else if (buoy.status === 'warning') {
      return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
    }
    return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
  };

  const getNotificationIcon = () => {
    if (buoy.status === 'critical' || buoy.status === 'warning') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Bell className="w-4 h-4" />;
  };

  const getNotificationLabel = () => {
    if (buoy.status === 'critical') {
      return 'Critical Alert Setup';
    } else if (buoy.status === 'warning') {
      return 'Warning Alert Setup';
    }
    return 'Setup Notifications';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl text-gray-900">{buoy.name}</h2>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusBadge(buoy.status)}`}>
                {buoy.status}
              </span>
              <span className="text-sm text-gray-500">
                Last updated: {buoy.lastUpdate}
              </span>
            </div>
          </div>
          
          {/* Notification Button - Top Center */}
          <div className="flex-1 flex justify-center">
            <Button
              onClick={() => {
                const statusMessages = {
                  critical: `Critical alert monitoring enabled for ${buoy.name}. You'll receive immediate notifications for oxygen depletion, pH extremes, and water quality emergencies.`,
                  warning: `Warning alert monitoring enabled for ${buoy.name}. You'll receive notifications for parameter trends that require attention.`,
                  good: `Notification monitoring enabled for ${buoy.name}. You'll receive alerts if water quality parameters change significantly.`
                };
                
                toast.success('Alert Setup Complete', {
                  description: statusMessages[buoy.status] || statusMessages.good
                });
              }}
              variant={buoy.status === 'critical' ? 'destructive' : buoy.status === 'warning' ? 'outline' : 'default'}
              size="sm"
              className={`flex items-center space-x-2 transition-all duration-200 ${
                buoy.status === 'critical' 
                  ? 'gradient-danger text-white shadow-lg hover:shadow-xl' 
                  : buoy.status === 'warning'
                    ? 'border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {buoy.status === 'critical' || buoy.status === 'warning' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {buoy.status === 'critical' 
                  ? 'Critical Alerts' 
                  : buoy.status === 'warning' 
                    ? 'Warning Alerts' 
                    : 'Notifications'
                }
              </span>
            </Button>
          </div>
          
          <div className="flex-1 flex justify-end">
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Contextual Information for Warning/Critical Status */}
        {(buoy.status === 'warning' || buoy.status === 'critical') && (
          <div className={`mt-4 p-3 rounded-lg border ${
            buoy.status === 'critical' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {buoy.status === 'critical' 
                  ? 'Critical monitoring recommended for immediate response to water quality emergencies.' 
                  : 'Enhanced monitoring recommended to track parameter trends and prevent issues.'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current Readings */}
      <div className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">Current Readings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Turbidity */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Turbidity</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(buoy.sensors.do, 'do'))}`}>
                {getSensorStatus(buoy.sensors.do, 'do')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Essential for aquatic life</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{buoy.sensors.do} mg/L</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* pH Level */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">pH Level</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(buoy.sensors.ph, 'ph'))}`}>
                {getSensorStatus(buoy.sensors.ph, 'ph')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water acidity/alkalinity</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{buoy.sensors.ph}</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Total Dissolved Solids */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Total Disolved Solids</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(buoy.sensors.tss, 'tss'))}`}>
                {getSensorStatus(buoy.sensors.tss, 'tss')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water clarity indicator</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{buoy.sensors.tss.toLocaleString()} mg/L</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Phosphate */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Phosphate</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(buoy.sensors.phosphate, 'phosphate'))}`}>
                {getSensorStatus(buoy.sensors.phosphate, 'phosphate')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Nutrient levels</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{buoy.sensors.phosphate} mg/L</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm text-gray-700">Temperature</h4>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(getSensorStatus(buoy.sensors.temperature, 'temperature'))}`}>
                {getSensorStatus(buoy.sensors.temperature, 'temperature')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-2">Water temperature</p>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">{buoy.sensors.temperature}°C</span>
              {getTrendIcon()}
            </div>
          </div>

          {/* Nitrogen */}
          {buoy.sensors.nitrogen !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-700">Total Nitrogen</h4>
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(buoy.sensors.nitrogen > 2 ? 'Warning' : 'Good')}`}>
                  {buoy.sensors.nitrogen > 2 ? 'Warning' : 'Good'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Nitrogen content</p>
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-900">{buoy.sensors.nitrogen.toFixed(1)} mg/L</span>
                {getTrendIcon()}
              </div>
            </div>
          )}

          {/* Nitrate */}
          {buoy.sensors.nitrate !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-700">Nitrate</h4>
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(buoy.sensors.nitrate > 1.5 ? 'Warning' : 'Good')}`}>
                  {buoy.sensors.nitrate > 1.5 ? 'Warning' : 'Good'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Nitrate levels</p>
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-900">{buoy.sensors.nitrate.toFixed(1)} mg/L</span>
                {getTrendIcon()}
              </div>
            </div>
          )}

          {/* Ammonia */}
          {buoy.sensors.ammonia !== undefined && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-700">Ammonia</h4>
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(buoy.sensors.ammonia > 0.15 ? 'Warning' : 'Good')}`}>
                  {buoy.sensors.ammonia > 0.15 ? 'Warning' : 'Good'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">Ammonia content</p>
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-900">{buoy.sensors.ammonia.toFixed(2)} mg/L</span>
                {getTrendIcon()}
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Trend Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turbidity 7-Day Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">7-Day Turbidity Trend</h4>
            <div className="h-40 bg-white rounded border">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="doGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4a7c59" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4a7c59" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <YAxis 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d4e6d4',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      formatter={(value: number) => [`${value} mg/L`, 'Turbidity']}
                    />
                    <Area
                      type="monotone"
                      dataKey="do"
                      stroke="#4a7c59"
                      strokeWidth={2}
                      fill="url(#doGradient)"
                      dot={{ fill: '#4a7c59', strokeWidth: 1, r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm">Loading chart data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* pH Level 7-Day Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">7-Day pH Level Trend</h4>
            <div className="h-40 bg-white rounded border">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <YAxis 
                      domain={[6.5, 8.5]}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d4e6d4',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      formatter={(value: number) => [`${value}`, 'pH Level']}
                    />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      stroke="#7ba05b"
                      strokeWidth={2}
                      dot={{ fill: '#7ba05b', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5, stroke: '#7ba05b', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm">Loading pH data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TSS 7-Day Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">7-Day TSS Trend</h4>
            <div className="h-40 bg-white rounded border">
              {trendData && trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="tssGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9cb86f" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9cb86f" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <YAxis 
                      domain={['dataMin - 200', 'dataMax + 200']}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d4e6d4',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      formatter={(value: number) => [`${value.toLocaleString()} mg/L`, 'Total Dissolved Solids']}
                    />
                    <Area
                      type="monotone"
                      dataKey="tss"
                      stroke="#9cb86f"
                      strokeWidth={2}
                      fill="url(#tssGradient)"
                      dot={{ fill: '#9cb86f', strokeWidth: 1, r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm">Loading TSS data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Temperature 24-Hour Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-3">24-Hour Temperature Trend</h4>
            <div className="h-40 bg-white rounded border">
              {hourlyData && hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#5c6b5c"
                      fontSize={10}
                      interval={3}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="#5c6b5c"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d4e6d4',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value}°C`, 'Temperature']}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#5d8233"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#5d8233', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm">Loading temperature data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={exportSensorData}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => {
              if (onNavigateToActionLog) {
                onNavigateToActionLog(buoy.id);
                toast.success('Action Logger', {
                  description: `Opening Action Logger for ${buoy.name}`
                });
              } else {
                toast.info('Action Logger', {
                  description: 'Navigate to Action Logging page to record interventions'
                });
              }
            }}
          >
            <FileText className="w-4 h-4" />
            <span>Log Action</span>
          </Button>
        </div>

        {/* Diagnostics: Probable Causes & Recommended Actions */}
        <div className="mt-6">
          <DiagnosticsPanel buoy={buoy} />
        </div>
      </div>

      {/* Recent Actions */}
      <div className="border-t border-gray-200">
        <RecentActionsPanel actionLogs={actionLogs} buoys={buoys} showTitle={false} />
      </div>
    </div>
  );
}