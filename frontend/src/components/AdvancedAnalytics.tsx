import React, { useState, useMemo, useCallback } from 'react';
import { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Zap, 
  Droplets,
  ThermometerSun,
  Waves,
  FlaskConical,
  Brain,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BuoyData } from '../App';
import { PredictiveInsight } from './DataSimulationEngine';
import { MobileLayout } from './MobileLayout';
import { Page, ActionLog } from '../App';


interface AdvancedAnalyticsProps {
  buoys: BuoyData[];
  actionLogs: ActionLog[];
  insights?: PredictiveInsight[];
  historicalData?: any[];
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentUser: any | null;
  isGuestMode: boolean;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

interface CorrelationData {
  parameter1: string;
  parameter2: string;
  correlation: number;
  strength: 'weak' | 'moderate' | 'strong';
  trend: 'positive' | 'negative';
}

interface WaterQualityIndex {
  buoyId: string;
  buoyName: string;
  wqi: number;
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  contributors: Array<{
    parameter: string;
    score: number;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

interface PredictionModel {
  parameter: string;
  accuracy: number;
  nextHour: number;
  next6Hours: number;
  next24Hours: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'deteriorating';
}

interface HyacinthForecastPoint {
  date: string;
  coverage: number;
  lower: number;
  upper: number;
}


export function AdvancedAnalytics({ 
  buoys, 
  actionLogs,
  insights = [], 
  historicalData = [],
  onNavigate,
  onLogout,
  currentUser,
  isGuestMode,
  onToggleDarkMode,
  isDarkMode
}: AdvancedAnalyticsProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<'overview' | 'correlations' | 'predictions' | 'quality'>('overview');
  const [selectedBuoy, setSelectedBuoy] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [forecast, setForecast] = useState<HyacinthForecastPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  


  // Define calculateCorrelation function first to avoid hoisting issues
  const calculateCorrelation = useCallback((x: number[], y: number[]): number => {
    if (!x || !y || x.length !== y.length || x.length < 2) return 0;
    
    try {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
      
      if (denominator === 0 || isNaN(denominator)) return 0;
      
      const result = numerator / denominator;
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error('Error calculating correlation:', error);
      return 0;
    }
  }, []);

  useEffect(() => {
    async function loadForecast() {
      try {
        setForecastLoading(true);
        setForecastError(null);

        // Adjust this URL if you use a proxy like /api/ml/forecast
        const res = await fetch('/api/forecast?limit=30');


        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        const parsed: HyacinthForecastPoint[] = data.map((row: any) => ({
          date: row.ds,            // column names from hyacinth_forecast.csv
          coverage: row.yhat,
          lower: row.yhat_lower,
          upper: row.yhat_upper,
        }));

        setForecast(parsed);
      } catch (err: any) {
        console.error('Error loading hyacinth forecast', err);
        setForecastError(err.message ?? 'Failed to load forecast');
      } finally {
        setForecastLoading(false);
      }
    }

    loadForecast();
  }, []);

  // Calculate Water Quality Index for each buoy (memoized with simple dependency)
  const waterQualityIndices = useMemo((): WaterQualityIndex[] => {
    if (!buoys || buoys.length === 0) return [];
    
    return buoys.map(buoy => {
      const { sensors } = buoy;
      
      // WQI calculation using weighted parameters
      const weights = {
        do: 0.25,      // Dissolved Oxygen
        ph: 0.20,      // pH
        tss: 0.20,     // Total Suspended Solids
        phosphate: 0.25, // Phosphate
        temperature: 0.10  // Temperature
      };

      // Scoring functions (0-100 scale)
      const scoreCalculations = {
        do: (val: number) => {
          if (val >= 8) return 100;
          if (val >= 6) return 80;
          if (val >= 4) return 60;
          if (val >= 2) return 40;
          return 20;
        },
        ph: (val: number) => {
          if (val >= 7.0 && val <= 8.5) return 100;
          if (val >= 6.5 && val <= 9.0) return 80;
          if (val >= 6.0 && val <= 9.5) return 60;
          return 40;
        },
        tss: (val: number) => {
          if (val <= 1000) return 100;
          if (val <= 2000) return 80;
          if (val <= 4000) return 60;
          if (val <= 6000) return 40;
          return 20;
        },
        phosphate: (val: number) => {
          if (val <= 0.1) return 100;
          if (val <= 0.2) return 80;
          if (val <= 0.3) return 60;
          if (val <= 0.4) return 40;
          return 20;
        },
        temperature: (val: number) => {
          if (val >= 18 && val <= 25) return 100;
          if (val >= 15 && val <= 28) return 80;
          return 60;
        }
      };

      const contributors = Object.entries(weights).map(([param, weight]) => {
        const value = sensors[param as keyof typeof sensors];
        const score = scoreCalculations[param as keyof typeof scoreCalculations](value);
        return {
          parameter: param,
          score,
          weight,
          impact: score >= 80 ? 'positive' : score >= 60 ? 'neutral' : 'negative'
        };
      });

      const wqi = contributors.reduce((sum, contrib) => sum + contrib.score * contrib.weight, 0);
      
      let grade: WaterQualityIndex['grade'];
      if (wqi >= 90) grade = 'Excellent';
      else if (wqi >= 70) grade = 'Good';
      else if (wqi >= 50) grade = 'Fair';
      else if (wqi >= 25) grade = 'Poor';
      else grade = 'Very Poor';

      return {
        buoyId: buoy.id,
        buoyName: buoy.name,
        wqi: Math.round(wqi),
        grade,
        contributors
      };
    });
  }, [buoys]);

  // Generate correlation analysis (optimized)
  const correlationAnalysis = useMemo((): CorrelationData[] => {
    if (!buoys || buoys.length < 2) return [];
    
    const parameters = ['do', 'ph', 'tss', 'phosphate', 'temperature'];
    const correlations: CorrelationData[] = [];

    try {
      for (let i = 0; i < parameters.length; i++) {
        for (let j = i + 1; j < parameters.length; j++) {
          const param1 = parameters[i];
          const param2 = parameters[j];
          
          const values1 = buoys.map(b => b.sensors[param1 as keyof typeof b.sensors]).filter(v => typeof v === 'number' && !isNaN(v));
          const values2 = buoys.map(b => b.sensors[param2 as keyof typeof b.sensors]).filter(v => typeof v === 'number' && !isNaN(v));
          
          if (values1.length > 1 && values2.length > 1 && values1.length === values2.length) {
            const correlation = calculateCorrelation(values1, values2);
            
            if (!isNaN(correlation)) {
              correlations.push({
                parameter1: param1,
                parameter2: param2,
                correlation: Math.round(correlation * 100) / 100,
                strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                         Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
                trend: correlation > 0 ? 'positive' : 'negative'
              });
            }
          }
        }
      }

      return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    } catch (error) {
      console.error('Error calculating correlations:', error);
      return [];
    }
  }, [buoys, calculateCorrelation]);

  // Generate prediction models (optimized)
  const predictionModels = useMemo((): PredictionModel[] => {
    if (!buoys || buoys.length === 0) return [];
    
    const parameters = ['do', 'ph', 'tss', 'phosphate', 'temperature'];
    
    try {
      return parameters.map(param => {
        // Simulate prediction accuracy based on parameter stability
        const values = buoys.map(b => b.sensors[param as keyof typeof b.sensors]).filter(v => typeof v === 'number' && !isNaN(v));
        
        if (values.length === 0) {
          return {
            parameter: param,
            accuracy: 60,
            nextHour: 0,
            next6Hours: 0,
            next24Hours: 0,
            confidence: 60,
            trend: 'stable' as const
          };
        }
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const coefficientOfVariation = mean !== 0 ? Math.sqrt(variance) / Math.abs(mean) : 0;
        
        // Lower variation means higher prediction accuracy
        const accuracy = Math.max(60, Math.min(95, 95 - coefficientOfVariation * 100));
        
        // Simulate predictions with some realistic trends
        const currentMean = mean;
        const trendFactor = (Math.random() - 0.5) * 0.1; // ±10% trend
        
        return {
          parameter: param,
          accuracy: Math.round(accuracy),
          nextHour: Math.round((currentMean * (1 + trendFactor * 0.1)) * 100) / 100,
          next6Hours: Math.round((currentMean * (1 + trendFactor * 0.5)) * 100) / 100,
          next24Hours: Math.round((currentMean * (1 + trendFactor)) * 100) / 100,
          confidence: Math.round(accuracy * 0.9),
          trend: Math.abs(trendFactor) < 0.02 ? 'stable' : 
                 trendFactor > 0 ? 'improving' : 'deteriorating'
        };
      });
    } catch (error) {
      console.error('Error generating prediction models:', error);
      return [];
    }
  }, [buoys]);

  // Generate system overview metrics
  const systemMetrics = useMemo(() => {
    const totalBuoys = buoys.length;
    const criticalBuoys = buoys.filter(b => b.status === 'critical').length;
    const warningBuoys = buoys.filter(b => b.status === 'warning').length;
    const goodBuoys = buoys.filter(b => b.status === 'good').length;
    const averageWQI = Math.round(waterQualityIndices.reduce((sum, wqi) => sum + wqi.wqi, 0) / totalBuoys);
    const activeAlerts = buoys.reduce((sum, b) => sum + b.alerts.length, 0);
    const predictiveAlerts = insights.filter(i => i.actionRequired).length;
    
    // Calculate system health score
    const healthScore = Math.round(
      (goodBuoys / totalBuoys) * 40 +
      (averageWQI / 100) * 30 +
      Math.max(0, (20 - activeAlerts) / 20) * 20 +
      Math.max(0, (10 - predictiveAlerts) / 10) * 10
    );

    return {
      totalBuoys,
      criticalBuoys,
      warningBuoys,
      goodBuoys,
      averageWQI,
      activeAlerts,
      predictiveAlerts,
      healthScore,
      operationalEfficiency: Math.round((goodBuoys + warningBuoys) / totalBuoys * 100),
      dataReliability: Math.round(predictionModels.reduce((sum, p) => sum + p.accuracy, 0) / predictionModels.length)
    };
  }, [buoys, waterQualityIndices, insights, predictionModels]);

  const getParameterIcon = (param: string) => {
    switch (param) {
      case 'do': return <Droplets className="w-4 h-4" />;
      case 'ph': return <FlaskConical className="w-4 h-4" />;
      case 'tss': return <Waves className="w-4 h-4" />;
      case 'phosphate': return <Activity className="w-4 h-4" />;
      case 'temperature': return <ThermometerSun className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getParameterName = (param: string) => {
    switch (param) {
      case 'do': return 'Dissolved Oxygen';
      case 'ph': return 'pH Level';
      case 'tss': return 'Total Suspended Solids';
      case 'phosphate': return 'Phosphate';
      case 'temperature': return 'Temperature';
      default: return param;
    }
  };

  const getWQIColor = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'text-green-700 bg-green-100 border-green-200';
      case 'Good': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'Fair': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Poor': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Very Poor': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <MobileLayout 
      onNavigate={onNavigate} 
      onLogout={onLogout}
      currentPage="analytics"
      currentUser={currentUser}
      isGuestMode={isGuestMode}
      onToggleDarkMode={onToggleDarkMode}
      isDarkMode={isDarkMode}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Advanced Header with System Health */}
          <div className="glass-card border-0 shadow-professional">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>AI-Powered Analytics Dashboard</span>
                </CardTitle>
                <div className="flex items-center space-x-3">
                  <Badge className={`${
                    systemMetrics.healthScore >= 80 ? 'status-good' : 
                    systemMetrics.healthScore >= 60 ? 'status-warning' : 'status-critical'
                  }`}>
                    System Health: {systemMetrics.healthScore}%
              </Badge>
              <Badge variant="outline">
                Live Analysis
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemMetrics.goodBuoys}</div>
              <div className="text-xs text-gray-600">Operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{systemMetrics.warningBuoys}</div>
              <div className="text-xs text-gray-600">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemMetrics.criticalBuoys}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemMetrics.averageWQI}</div>
              <div className="text-xs text-gray-600">Avg WQI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemMetrics.dataReliability}%</div>
              <div className="text-xs text-gray-600">Data Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{systemMetrics.predictiveAlerts}</div>
              <div className="text-xs text-gray-600">AI Alerts</div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={selectedAnalysis} onValueChange={(value: any) => setSelectedAnalysis(value)}>
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Water Quality</span>
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Correlations</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Predictions</span>
          </TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Parameter Trends */}
            <Card className="glass-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="text-lg">Real-time Parameter Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={buoys.map((buoy, index) => ({
                      name: buoy.name.split(' ')[0],
                      do: buoy.sensors.do,
                      ph: buoy.sensors.ph * 2, // Scale for visibility
                      temperature: buoy.sensors.temperature,
                      index
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" stroke="var(--chart-1)" fontSize={10} />
                      <YAxis stroke="var(--chart-1)" fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="do" stroke="var(--chart-1)" strokeWidth={2} name="Dissolved O₂" />
                      <Line type="monotone" dataKey="ph" stroke="var(--chart-3)" strokeWidth={2} name="pH (×2)" />
                      <Line type="monotone" dataKey="temperature" stroke="var(--chart-5)" strokeWidth={2} name="Temperature" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="glass-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="text-lg">System Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: 'Operational', value: systemMetrics.goodBuoys, fill: 'var(--chart-1)' },
                          { name: 'Warning', value: systemMetrics.warningBuoys, fill: 'var(--chart-3)' },
                          { name: 'Critical', value: systemMetrics.criticalBuoys, fill: 'var(--chart-5)' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parameter Radar Chart */}
          <Card className="glass-card border-0 shadow-professional">
            <CardHeader>
              <CardTitle className="text-lg">Multi-Parameter Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    {
                      parameter: 'Dissolved O₂',
                      average: buoys.reduce((sum, b) => sum + b.sensors.do, 0) / buoys.length,
                      optimal: 8,
                      critical: 4
                    },
                    {
                      parameter: 'pH Level',
                      average: buoys.reduce((sum, b) => sum + b.sensors.ph, 0) / buoys.length,
                      optimal: 7.5,
                      critical: 6
                    },
                    {
                      parameter: 'TSS',
                      average: (buoys.reduce((sum, b) => sum + b.sensors.tss, 0) / buoys.length) / 100, // Scale down
                      optimal: 20,
                      critical: 60
                    },
                    {
                      parameter: 'Phosphate',
                      average: (buoys.reduce((sum, b) => sum + b.sensors.phosphate, 0) / buoys.length) * 10, // Scale up
                      optimal: 2,
                      critical: 4
                    },
                    {
                      parameter: 'Temperature',
                      average: buoys.reduce((sum, b) => sum + b.sensors.temperature, 0) / buoys.length,
                      optimal: 22,
                      critical: 30
                    }
                  ]}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="parameter" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 60]} className="text-xs" />
                    <Radar name="Current Average" dataKey="average" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
                    <Radar name="Optimal" dataKey="optimal" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.1} strokeWidth={1} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Water Quality Index Analysis */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {waterQualityIndices.map((wqi) => (
              <motion.div
                key={wqi.buoyId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-card border-0 shadow-professional">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{wqi.buoyName}</CardTitle>
                      <Badge className={getWQIColor(wqi.grade)}>
                        {wqi.grade} ({wqi.wqi})
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* WQI Score Visualization */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full transition-all duration-500 ${
                              wqi.wqi >= 90 ? 'bg-green-500' :
                              wqi.wqi >= 70 ? 'bg-blue-500' :
                              wqi.wqi >= 50 ? 'bg-yellow-500' :
                              wqi.wqi >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${wqi.wqi}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>

                      {/* Parameter Contributions */}
                      <div className="space-y-3">
                        {wqi.contributors.map((contrib) => (
                          <div key={contrib.parameter} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getParameterIcon(contrib.parameter)}
                              <span className="text-sm">{getParameterName(contrib.parameter)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                contrib.impact === 'positive' ? 'bg-green-500' :
                                contrib.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-sm font-medium">{contrib.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Correlation Analysis */}
        <TabsContent value="correlations" className="space-y-6">
          <Card className="glass-card border-0 shadow-professional">
            <CardHeader>
              <CardTitle className="text-lg">Parameter Correlation Matrix</CardTitle>
              <p className="text-sm text-gray-600">
                Understanding relationships between water quality parameters
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {correlationAnalysis.map((corr, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      corr.strength === 'strong' ? 'border-purple-300 bg-purple-50' :
                      corr.strength === 'moderate' ? 'border-blue-300 bg-blue-50' :
                      'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {corr.trend === 'positive' ? 
                          <TrendingUp className="w-4 h-4 text-green-600" /> :
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        }
                        <Badge variant="outline" className="text-xs">
                          {corr.strength}
                        </Badge>
                      </div>
                      <span className="font-bold text-lg">
                        {Math.abs(corr.correlation)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{getParameterName(corr.parameter1)}</div>
                      <div className="text-gray-600">vs</div>
                      <div className="font-medium">{getParameterName(corr.parameter2)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scatter Plot for Strongest Correlation */}
          {correlationAnalysis.length > 0 && (
            <Card className="glass-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="text-lg">
                  Strongest Correlation: {getParameterName(correlationAnalysis[0].parameter1)} vs {getParameterName(correlationAnalysis[0].parameter2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={buoys.map(buoy => ({
                      x: buoy.sensors[correlationAnalysis[0].parameter1 as keyof typeof buoy.sensors],
                      y: buoy.sensors[correlationAnalysis[0].parameter2 as keyof typeof buoy.sensors],
                      name: buoy.name
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis dataKey="x" stroke="var(--chart-1)" name={correlationAnalysis[0].parameter1} />
                      <YAxis dataKey="y" stroke="var(--chart-1)" name={correlationAnalysis[0].parameter2} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Sensors" dataKey="y" fill="var(--chart-1)" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Predictions */}
                {/* AI Predictions – Hyacinth Coverage Forecast */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Summary card */}
          <Card className="glass-card border-0 shadow-professional">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Waves className="w-5 h-5 text-green-600" />
                <span>Hyacinth Coverage Forecast</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Forecast based on historical satellite hyacinth coverage and water quality data.
              </p>
            </CardHeader>
            <CardContent>
              {forecastLoading && (
                <div className="text-sm text-gray-500">Loading forecast…</div>
              )}

              {forecastError && (
                <div className="text-sm text-red-600">
                  Failed to load forecast: {forecastError}
                </div>
              )}

              {!forecastLoading && !forecastError && forecast.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Big metric cards */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <div className="text-xs text-gray-600 mb-1">
                        Next 7 days average
                      </div>
                      <div className="text-3xl font-bold text-green-700">
                        {Math.round(
                          forecast
                            .slice(-7)
                            .reduce((s, p) => s + p.coverage, 0) /
                            Math.min(7, forecast.length)
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-500">
                        Estimated mean surface coverage
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                      <div className="text-xs text-gray-600 mb-1">
                        Maximum predicted
                      </div>
                      <div className="text-3xl font-bold text-yellow-700">
                        {Math.round(
                          Math.max(...forecast.map((p) => p.coverage))
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-500">
                        Worst-case coverage in forecast window
                      </div>
                    </div>
                  </div>

                  {/* Line/area chart */}
                  <div className="lg:col-span-2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                        <XAxis dataKey="date" stroke="var(--chart-1)" fontSize={10} />
                        <YAxis
                          stroke="var(--chart-1)"
                          fontSize={10}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          formatter={(value: any) => `${Math.round(value)}%`}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="coverage"
                          stroke="var(--chart-1)"
                          fill="var(--chart-1)"
                          fillOpacity={0.25}
                          name="Forecast coverage"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table of forecast values */}
          {!forecastLoading && !forecastError && forecast.length > 0 && (
            <Card className="glass-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Forecast Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Expected coverage</th>
                        <th className="py-2 pr-4">Lower bound</th>
                        <th className="py-2 pr-4">Upper bound</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.slice(-14).map((row) => (
                        <tr key={row.date} className="border-b last:border-0">
                          <td className="py-2 pr-4">{row.date}</td>
                          <td className="py-2 pr-4 font-medium">
                            {row.coverage.toFixed(1)}%
                          </td>
                          <td className="py-2 pr-4 text-gray-600">
                            {row.lower.toFixed(1)}%
                          </td>
                          <td className="py-2 pr-4 text-gray-600">
                            {row.upper.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>


      </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}

// ⬇️ add this as the very last line in AdvancedAnalytics.tsx
export default AdvancedAnalytics;
