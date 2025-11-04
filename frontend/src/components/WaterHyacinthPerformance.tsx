import React from 'react';
import { BuoyData, User } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Zone } from './MainDashboard';
import { Leaf, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { HyacinthThresholdAlerts } from './HyacinthThresholdAlerts';

interface WaterHyacinthPerformanceProps {
  buoys: BuoyData[];
  selectedZone: Zone;
  currentUser: User | null;
  isGuestMode: boolean;
}

export function WaterHyacinthPerformance({ buoys, selectedZone, currentUser, isGuestMode }: WaterHyacinthPerformanceProps) {
  // Filter buoys based on selected zone
  const filteredBuoys = selectedZone === 'overall' 
    ? buoys 
    : buoys.filter(b => b.zone === selectedZone);

  // Calculate overall hyacinth coverage
  const overallHyacinth = filteredBuoys.length > 0
    ? filteredBuoys.reduce((acc, buoy) => acc + (buoy.sensors.hyacinth || 0), 0) / filteredBuoys.length
    : 0;

  // Calculate zone-specific data
  const zoneData = {
    zone1: buoys.filter(b => b.zone === 'zone1'),
    zone2: buoys.filter(b => b.zone === 'zone2'),
    zone3: buoys.filter(b => b.zone === 'zone3'),
    zone4: buoys.filter(b => b.zone === 'zone4'),
    zone5: buoys.filter(b => b.zone === 'zone5')
  };

  const getZoneAverage = (zoneBuoys: BuoyData[]) => {
    if (zoneBuoys.length === 0) return 0;
    return zoneBuoys.reduce((acc, b) => acc + (b.sensors.hyacinth || 0), 0) / zoneBuoys.length;
  };

  const getHyacinthStatus = (level: number) => {
    if (level >= 60) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical', icon: AlertTriangle };
    if (level >= 35) return { status: 'warning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Warning', icon: TrendingUp };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Good', icon: CheckCircle };
  };

  const getTrend = (buoy: BuoyData) => {
    if (!buoy.historicalData || buoy.historicalData.length < 2) return null;
    const current = buoy.sensors.hyacinth || 0;
    const previous = buoy.historicalData[buoy.historicalData.length - 2].hyacinth;
    const change = current - previous;
    return { change, direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
  };

  const overallStatus = getHyacinthStatus(overallHyacinth);
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
      {/* Custom Threshold Alerts */}
      <HyacinthThresholdAlerts 
        currentUser={currentUser}
        buoys={buoys}
        isGuestMode={isGuestMode}
      />

      {/* Overall Status Card */}
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
                  {overallHyacinth.toFixed(1)}%
                </span>
              </div>
              <Progress value={overallHyacinth} className="h-3" />
            </div>
            <p className="text-sm text-gray-600">
              {overallHyacinth >= 60 
                ? 'Critical levels detected. Immediate intervention required.'
                : overallHyacinth >= 35
                ? 'Elevated levels. Increased monitoring and intervention recommended.'
                : 'Levels within acceptable range. Continue routine monitoring.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Zone Breakdown (only show when 'overall' is selected) */}
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
                const zoneAvg = getZoneAverage(zoneBuoys);
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

      {/* Sensor Details (filtered by zone) */}
      <Card className="glass-card border-0 shadow-professional">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Sensor Readings & Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBuoys.map(buoy => {
              const hyacinth = buoy.sensors.hyacinth || 0;
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
