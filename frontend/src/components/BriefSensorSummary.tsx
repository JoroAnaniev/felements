import React from 'react';
import { BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Droplets, 
  ThermometerSun, 
  Waves, 
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BriefSensorSummaryProps {
  buoy: BuoyData;
  onViewFullAnalysis: () => void;
}

export function BriefSensorSummary({ buoy, onViewFullAnalysis }: BriefSensorSummaryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSensorStatus = (value: number, type: string) => {
    switch (type) {
      case 'do':
        if (value < 4) return 'critical';
        if (value < 6) return 'warning';
        return 'good';
      case 'ph':
        if (value < 6.0 || value > 9.0) return 'critical';
        if (value < 6.5 || value > 8.5) return 'warning';
        return 'good';
      case 'tss':
        if (value > 8000) return 'critical';
        if (value > 5000) return 'warning';
        return 'good';
      case 'phosphate':
        if (value > 0.5) return 'critical';
        if (value > 0.3) return 'warning';
        return 'good';
      case 'temperature':
        if (value > 30 || value < 15) return 'critical';
        if (value > 27 || value < 18) return 'warning';
        return 'good';
      default:
        return 'good';
    }
  };

  const readings = [
    {
      name: 'Dissolved Oxygen',
      description: 'Essential for aquatic life',
      value: `${buoy.sensors.do} mg/L`,
      status: getSensorStatus(buoy.sensors.do, 'do'),
      icon: Droplets
    },
    {
      name: 'pH Level',
      description: 'Water acidity/alkalinity',
      value: buoy.sensors.ph.toString(),
      status: getSensorStatus(buoy.sensors.ph, 'ph'),
      icon: Activity
    },
    {
      name: 'Total Suspended Solids',
      description: 'Water clarity indicator',
      value: `${buoy.sensors.tss.toLocaleString()} mg/L`,
      status: getSensorStatus(buoy.sensors.tss, 'tss'),
      icon: Waves
    },
    {
      name: 'Phosphate',
      description: 'Nutrient levels',
      value: `${buoy.sensors.phosphate} mg/L`,
      status: getSensorStatus(buoy.sensors.phosphate, 'phosphate'),
      icon: TrendingUp
    },
    {
      name: 'Temperature',
      description: 'Water temperature',
      value: `${buoy.sensors.temperature}°C`,
      status: getSensorStatus(buoy.sensors.temperature, 'temperature'),
      icon: ThermometerSun
    }
  ];

  return (
    <Card className="glass-card border-0 shadow-professional">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-lg">{buoy.name}</span>
          </CardTitle>
          <Badge className={`${getStatusColor(buoy.status)} border`}>
            {getStatusIcon(buoy.status)}
            <span className="ml-1 capitalize">{buoy.status}</span>
          </Badge>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Last updated: {buoy.lastUpdate}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h4 className="font-semibold text-gray-900">Current Readings</h4>
        
        <div className="space-y-3">
          {readings.map((reading, index) => {
            const Icon = reading.icon;
            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(reading.status).replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{reading.name}</p>
                    <p className="text-xs text-gray-500">{reading.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{reading.value}</p>
                  <Badge className={`text-xs ${getStatusColor(reading.status)} border-0`}>
                    {reading.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placeholder for 7-day trend - simplified */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-sm text-gray-700">7-Day Trend - Dissolved Oxygen</h5>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="h-8 bg-gradient-to-r from-blue-100 via-green-100 to-emerald-100 rounded-md flex items-end justify-between px-2">
            <div className="text-xs text-gray-500">Sep 25</div>
            <div className="text-xs text-gray-500">Sep 26</div>
            <div className="text-xs text-gray-500">Sep 27</div>
            <div className="text-xs text-gray-500">Sep 28</div>
            <div className="text-xs text-gray-500">Sep 29</div>
            <div className="text-xs text-gray-500">Sep 30</div>
            <div className="text-xs text-gray-500">Oct 01</div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>5.2</span>
            <span>6.0</span>
            <span>6.8</span>
            <span>8.3</span>
          </div>
        </div>

        <Button 
          onClick={onViewFullAnalysis}
          className="w-full mt-4"
          size="sm"
        >
          View Full Analysis
        </Button>
      </CardContent>
    </Card>
  );
}