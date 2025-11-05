import React, { useState, useEffect, useRef } from 'react';
import { Page, BuoyData, ActionLog } from '../App';
import { MobileLayout } from './MobileLayout';
import { DamMap } from './DamMap';
import { BuoyInfoPanel } from './BuoyInfoPanel';
import { RecentActionsPanel } from './RecentActionsPanel';
import { SystemOverview } from './SystemOverview';
import { SensorDetailsPanel } from './SensorDetailsPanel';
import { BriefSensorSummary } from './BriefSensorSummary';
import { Legend } from './Legend';
import { WaterHyacinthPerformance } from './WaterHyacinthPerformance';
import { ZoneContextPanel } from './ZoneContextPanel';
import { HyacinthAlertSystem } from './HyacinthAlertSystem';
import { StatusAlertSystem } from './StatusAlertSystem';
import axios from "axios";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  ChevronDown,
  Filter,
  Activity,
  Shield,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  Leaf
} from 'lucide-react';
import { SensorApiResponse } from '../types/SensorApiResponse.type';

interface MainDashboardProps {
  buoys: BuoyData[];
  actionLogs: ActionLog[];
  onNavigate: (page: Page) => void;
  selectedSensorForDetails?: BuoyData | null;
  onClearSensorDetails?: () => void;
  onSensorSelect?: (buoy: BuoyData) => void;
  onLogout: () => void;
  currentUser: any | null;
  isGuestMode: boolean;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  onAddLog?: (log: Omit<ActionLog, 'id'>) => void;
}

export type Zone = 'overall' | 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5';

export function MainDashboard({
  buoys,
  actionLogs,
  onNavigate,
  selectedSensorForDetails,
  onClearSensorDetails,
  onSensorSelect,
  onLogout,
  currentUser,
  isGuestMode,
  onToggleDarkMode,
  isDarkMode,
  onAddLog
}: MainDashboardProps) {
  const [selectedBuoy, setSelectedBuoy] = useState<BuoyData | null>(null);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone>('overall');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [activePerformanceTab, setActivePerformanceTab] = useState<'overview' | 'hyacinth'>('overview');
  const [showZoneContext, setShowZoneContext] = useState(false);
  const sensorDetailsRef = useRef<HTMLDivElement>(null);
  const sensorOverviewRef = useRef<HTMLDivElement>(null);
  const sensorItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const zoneContextRef = useRef<HTMLDivElement>(null);



  const [sensor, setSensor] = useState<SensorApiResponse | null>(null);

  const lastReading = (arr?: any[]) => {
    if (!arr || arr.length === 0) return undefined;
    return arr[arr.length - 1]; // assumes newest is last; change to [0] if newest is index 0
  };

  const fmt = (v: any, dec = 1) => {
    if (v === null || v === undefined) return '—';
    const n = Number(v);
    if (Number.isNaN(n)) return '—';
    return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  useEffect(() => {
    const ctrl = new AbortController();
    let timer: number;

    async function load() {
      try {
        const res = await axios.get("/api/devices/1?includeReadings=1", { signal: ctrl.signal });
        const sensorData: SensorApiResponse = res.data;
        setSensor(sensorData);


        console.log(res.data)
      } catch (e) {
        if (axios.isCancel?.(e) || (e as any).name === "CanceledError" || (e as any).code === "ERR_CANCELED") {
          console.debug("Axios request canceled");
        } else {
          console.error("Fout bij ophalen van sensor data:", e);
        }
      } finally {
        timer = window.setTimeout(load, 10_000);
      }
    }

    load();

    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, []);

  // Filter buoys based on selected zone and alert filter
  const filteredBuoys = buoys
    .filter(buoy => {
      // Zone filter
      if (selectedZone !== 'overall' && buoy.zone !== selectedZone) {
        return false;
      }
      // Alert filter
      if (showAlertsOnly && buoy.alerts.length === 0) {
        return false;
      }
      return true;
    });

  // Calculate stats for professional overview
  const stats = {
    total: filteredBuoys.length,
    good: filteredBuoys.filter(b => b.status === 'good').length,
    warning: filteredBuoys.filter(b => b.status === 'warning').length,
    critical: filteredBuoys.filter(b => b.status === 'critical').length,
    activeAlerts: filteredBuoys.reduce((sum, b) => sum + b.alerts.length, 0)
  };

  // Zone display names
  const zoneNames = {
    overall: 'Overall View',
    zone1: 'Zone 1 - North',
    zone2: 'Zone 2 - Northeast',
    zone3: 'Zone 3 - Central',
    zone4: 'Zone 4 - West',
    zone5: 'Zone 5 - South'
  };

  // Handle zone selection - show context panel when a specific zone is selected
  const handleZoneChange = (zone: Zone) => {
    setSelectedZone(zone);
    setShowZoneContext(zone !== 'overall');

    // Scroll to zone context when a specific zone is selected
    if (zone !== 'overall') {
      setTimeout(() => {
        zoneContextRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  };

  const handleBuoyClick = (buoy: BuoyData) => {
    setSelectedBuoy(buoy);
    setShowDetailedView(true);
    if (onSensorSelect) {
      onSensorSelect(buoy);
    }

    // Scroll to the sensor overview section first, then to the specific sensor item
    setTimeout(() => {
      // Scroll to sensor overview container
      sensorOverviewRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Then scroll to the specific sensor in the list
      setTimeout(() => {
        const sensorElement = sensorItemRefs.current[buoy.id];
        if (sensorElement) {
          sensorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 400); // Wait for the first scroll to mostly complete
    }, 100);
  };

  const handleViewDetails = (buoy: BuoyData) => {
    const wasAlreadyInDetailedView = showDetailedView;
    setSelectedBuoy(buoy);
    setShowDetailedView(true);
    if (onSensorSelect) {
      onSensorSelect(buoy);
    }

    // Only scroll to details if we're already in detailed view (sensor overview is visible)
    // This prevents the jerky up-down motion when clicking from the sensor overview
    if (wasAlreadyInDetailedView) {
      // Just scroll to the details panel smoothly
      setTimeout(() => {
        sensorDetailsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100); // Shorter delay since layout isn't changing
    } else {
      // If not in detailed view yet, wait for layout to render then scroll
      setTimeout(() => {
        sensorDetailsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 400); // Longer delay to allow layout changes
    }
  };

  // Handle sensor details from external navigation
  useEffect(() => {
    if (selectedSensorForDetails) {
      setSelectedBuoy(selectedSensorForDetails);
      setShowDetailedView(true);
      // Smooth scroll to sensor overview section first, then to specific sensor
      setTimeout(() => {
        sensorOverviewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Then scroll to the specific sensor in the list
        setTimeout(() => {
          const sensorElement = sensorItemRefs.current[selectedSensorForDetails.id];
          if (sensorElement) {
            sensorElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 400);
      }, 100);
    }
  }, [selectedSensorForDetails]);

  // Professional Status Component
  const StatusIndicator = ({ status, count }: { status: string; count: number }) => {
    const config = {
      good: { color: 'text-green-600', bg: 'bg-green-50', icon: Shield, label: 'Operational' },
      warning: { color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle, label: 'Warning' },
      critical: { color: 'text-red-600', bg: 'bg-red-50', icon: Zap, label: 'Critical' }
    };

    const { color, bg, icon: Icon, label } = config[status as keyof typeof config];

    return (
      <div className={`${bg} rounded-xl p-4 border border-opacity-20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${bg} rounded-lg`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`font-semibold ${color}`}>{count}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MobileLayout
      onNavigate={onNavigate}
      onLogout={onLogout}
      currentPage="dashboard"
      currentUser={currentUser}
      isGuestMode={isGuestMode}
      onToggleDarkMode={onToggleDarkMode}
      isDarkMode={isDarkMode}
    >
      {/* Hyacinth Alert System - monitors for increases and sends notifications */}
      <HyacinthAlertSystem
        buoys={buoys}
        currentUser={currentUser}
        isGuestMode={isGuestMode}
      />

      {/* Status Alert System - monitors for status changes (good/warning/critical) and sends email alerts */}
      <StatusAlertSystem
        buoys={buoys}
        currentUser={currentUser}
        isGuestMode={isGuestMode}
      />

      <div className="min-h-full bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
        {/* Professional Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Monitoring Dashboard</h1>
                    <p className="text-sm text-gray-500">Real-time water quality oversight</p>
                  </div>
                </div>
              </div>

              {/* Professional Controls */}
              <div className="flex items-center space-x-4">
                {/* Zone Selector */}
                <div className="hidden md:flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <Select value={selectedZone} onValueChange={(value: Zone) => handleZoneChange(value)}>
                    <SelectTrigger className="w-48 h-10 bg-white/70 backdrop-blur-sm border-gray-200/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      {Object.entries(zoneNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert Filter */}
                <Button
                  variant={showAlertsOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                  className={`h-10 ${showAlertsOnly
                    ? 'gradient-danger text-white'
                    : 'bg-white/70 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showAlertsOnly ? 'Alerts Only' : 'All Sensors'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Professional Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatusIndicator status="good" count={stats.good} />
            <StatusIndicator status="warning" count={stats.warning} />
            <StatusIndicator status="critical" count={stats.critical} />

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">{stats.activeAlerts}</p>
                    <p className="text-sm text-gray-500">Active Alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance with Tabs */}
          <div className='flex flex-col'>
            <span>{sensor?.DeviceName}</span>
            <span>{sensor?.DeviceID}</span>
            <span>{sensor?.DeviceLocation}</span>
            <span>{sensor?.IPAddress}</span>
            <span>PH: {sensor?.PH_Readings[0]?.PH_Value}</span>
            <span>TDS: {sensor?.TDS_Readings[0]?.TDS_Value}</span>
            <span>GPS: {sensor?.GPS_Readings[0]?.Latitude}, {sensor?.GPS_Readings[0]?.Longitude}</span>
            <span>Temperature: {sensor?.Temperature_Readings[0]?.Temperature_Value}</span>
            <span>Turbidity: {sensor?.Turbidity_Readings[0]?.NTU_Value} NTU, {sensor?.Turbidity_Readings[0]?.Voltage} V</span>
          </div>
          <div className="mb-6">
            <Card className="glass-card border-0 shadow-professional">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activePerformanceTab} onValueChange={(value: string) => setActivePerformanceTab(value as 'overview' | 'hyacinth')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="overview" className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Water Quality</span>
                    </TabsTrigger>
                    <TabsTrigger value="hyacinth" className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4" />
                      <span>Hyacinth Monitoring</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-0">
                    <SystemOverview buoys={filteredBuoys} selectedZone={selectedZone} sensor={sensor} />
                  </TabsContent>
                  <TabsContent value="hyacinth" className="mt-0">
                    <WaterHyacinthPerformance
                      buoys={filteredBuoys}
                      selectedZone={selectedZone}
                      currentUser={currentUser}
                      isGuestMode={isGuestMode}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Zone Context Panel (appears when specific zone is selected) */}
          {showZoneContext && selectedZone !== 'overall' && (
            <div className="mb-6" ref={zoneContextRef}>
              <ZoneContextPanel
                buoys={filteredBuoys}
                zoneName={zoneNames[selectedZone]}
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className={`grid gap-6 ${showDetailedView ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 xl:grid-cols-4'}`}>
            {/* Left Column - Map */}
            <div className={`space-y-6 ${showDetailedView ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
              {/* Professional Map Card */}
              <Card className="glass-card border-0 shadow-professional overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-green-600" />
                      <span>Dam Overview Map</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Auto-updating every 5 seconds</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedZone === 'overall'
                      ? `Displaying all ${filteredBuoys.length} monitoring points`
                      : `${zoneNames[selectedZone]} - ${filteredBuoys.length} sensors`
                    }
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    <DamMap
                      buoys={filteredBuoys}
                      onBuoyClick={handleBuoyClick}
                      selectedBuoy={selectedBuoy}
                    />

                    {/* Map Overlay Controls */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm border-white/50 w-full"
                        onClick={() => onNavigate('fullscreen-map')}
                      >
                        Fullscreen Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Right Column - Brief Summary + Legend */}
            <div className="space-y-6">
              {/* Brief Sensor Summary (when point selected) */}
              {selectedBuoy && !showDetailedView ? (
                <BriefSensorSummary
                  buoy={selectedBuoy}
                  onViewFullAnalysis={() => handleViewDetails(selectedBuoy)}
                />
              ) : !showDetailedView && (
                <Card className="glass-card border-0 shadow-professional">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Select a Monitoring Point
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click on any buoy marker on the map to view detailed sensor readings and trends
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Legend */}
              <Legend />
            </div>
          </div>

          {/* Recent Activities - Full Width Below Map */}
          {!showDetailedView && (
            <div className="mt-6">
              <Card className="glass-card border-0 shadow-professional">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span>Recent Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <RecentActionsPanel
                    actionLogs={actionLogs}
                    buoys={buoys}
                    showTitle={false}
                    onNavigate={onNavigate}
                    isGuestMode={isGuestMode}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Sensor Details - Under the Map (when detailed view is active) */}
          {showDetailedView && selectedBuoy && (
            <div className="mt-6" ref={sensorOverviewRef}>
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left side sensor overview on fullscreen */}
                <div className="xl:col-span-1">
                  <Card className="glass-card border-0 shadow-professional sticky top-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        <span>Sensor Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <BuoyInfoPanel
                        buoys={filteredBuoys}
                        onBuoyClick={handleBuoyClick}
                        onViewDetails={handleViewDetails}
                        selectedBuoy={selectedBuoy}
                        sensorItemRefs={sensorItemRefs}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Main sensor details */}
                <div className="xl:col-span-3 space-y-6" ref={sensorDetailsRef}>
                  <SensorDetailsPanel
                    buoy={selectedBuoy}
                    actionLogs={actionLogs}
                    buoys={buoys}
                    onClose={() => {
                      setShowDetailedView(false);
                      if (onClearSensorDetails) {
                        onClearSensorDetails();
                      }
                    }}
                    onNavigateToActionLog={(buoyId) => {
                      // Store the selected buoy ID in localStorage for the Action Logging page
                      localStorage.setItem('preselectedBuoyId', buoyId);
                      onNavigate('logging');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}