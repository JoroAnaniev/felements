import { BuoyData } from '../App';

export interface SimulationConfig {
  updateInterval: number; // milliseconds
  variabilityFactor: number; // 0-1, how much data can vary
  enableAnomalies: boolean;
  alertThresholds: {
    do: { critical: number; warning: number };
    ph: { critical: [number, number]; warning: [number, number] };
    tss: { critical: number; warning: number };
    phosphate: { critical: number; warning: number };
  };
}

export interface DataTrend {
  buoyId: string;
  parameter: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number;
  confidence: number;
}

export interface AnomalyDetection {
  buoyId: string;
  parameter: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  likelihood: number;
}

export interface PredictiveInsight {
  id: string;
  buoyId: string;
  type: 'warning' | 'recommendation' | 'forecast';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

export class DataSimulationEngine {
  private config: SimulationConfig;
  private historicalData: Map<string, Array<{ timestamp: Date; data: any }>> = new Map();
  private trends: Map<string, DataTrend[]> = new Map();
  private anomalies: AnomalyDetection[] = [];
  private insights: PredictiveInsight[] = [];
  private simulationTimer: NodeJS.Timeout | null = null;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.initializeHistoricalData();
  }

  private initializeHistoricalData() {
    // Generate 30 days of historical data for trend analysis
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Initialize with baseline data for each buoy
    }
  }

  public startSimulation(buoys: BuoyData[], onUpdate: (buoys: BuoyData[]) => void, onInsight: (insight: PredictiveInsight) => void) {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
    }

    // Store current buoys to prevent stale closure issues
    let currentBuoys = buoys;

    this.simulationTimer = setInterval(() => {
      try {
        const updatedBuoys = this.simulateDataUpdate(currentBuoys);
        currentBuoys = updatedBuoys; // Update reference
        
        // Throttle insight generation to prevent performance issues
        const shouldGenerateInsights = Math.random() < 0.3; // 30% chance per update
        if (shouldGenerateInsights) {
          const newInsights = this.generatePredictiveInsights(updatedBuoys);
          newInsights.forEach(insight => onInsight(insight));
        }
        
        onUpdate(updatedBuoys);
      } catch (error) {
        console.error('Simulation error:', error);
        // Continue simulation despite errors
      }
    }, this.config.updateInterval);
  }

  public stopSimulation() {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  public updateBuoys(buoys: BuoyData[]) {
    // This method allows external updates to buoy data (like positions)
    // while preserving the simulation state
    // The next simulation cycle will use the updated buoy data
  }

  private simulateDataUpdate(buoys: BuoyData[]): BuoyData[] {
    return buoys.map(buoy => {
      const updatedSensors = { ...buoy.sensors };
      const newAlerts: string[] = [];

      // Simulate natural variations with slight trends
      Object.keys(updatedSensors).forEach(key => {
        const currentValue = updatedSensors[key as keyof typeof updatedSensors];
        const variation = this.generateRealisticVariation(key, currentValue, buoy.id);
        updatedSensors[key as keyof typeof updatedSensors] = Math.round(variation * 100) / 100;
      });

      // Advanced anomaly detection
      const detectedAnomalies = this.detectAnomalies(buoy.id, updatedSensors);
      detectedAnomalies.forEach(anomaly => {
        this.anomalies.push(anomaly);
        if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
          newAlerts.push(anomaly.description);
        }
      });

      // Dynamic status calculation based on multiple parameters
      const newStatus = this.calculateDynamicStatus(updatedSensors, newAlerts);

      // Store historical data
      this.storeHistoricalData(buoy.id, updatedSensors);

      return {
        ...buoy,
        sensors: updatedSensors,
        status: newStatus,
        alerts: newAlerts,
        lastUpdate: new Date().toLocaleString('en-ZA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });
  }

  private generateRealisticVariation(parameter: string, currentValue: number, buoyId: string): number {
    const time = Date.now();
    const hourOfDay = new Date().getHours();
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    // Realistic environmental patterns
    let baseVariation = 0;
    let seasonalEffect = 0;
    let dailyPattern = 0;

    switch (parameter) {
      case 'do': // Dissolved Oxygen - affected by temperature, photosynthesis
        dailyPattern = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.8; // Peak at noon
        seasonalEffect = Math.sin(dayOfYear * 2 * Math.PI / 365) * 1.2; // Seasonal variation
        baseVariation = (Math.random() - 0.5) * 0.3;
        break;
      
      case 'ph': // pH - more stable but affected by biological activity
        dailyPattern = Math.sin((hourOfDay - 6) * Math.PI / 12) * 0.05;
        baseVariation = (Math.random() - 0.5) * 0.1;
        break;
      
      case 'tss': // Total Suspended Solids - affected by weather, flow
        const weatherEffect = Math.sin(time / (1000 * 60 * 60 * 6)) * 0.15; // 6-hour weather cycles
        baseVariation = (Math.random() - 0.5) * 0.2 + weatherEffect;
        break;
      
      case 'phosphate': // Phosphate - gradual changes, affected by runoff
        const weeklyPattern = Math.sin(dayOfYear * 2 * Math.PI / 7) * 0.02; // Weekly agricultural cycles
        baseVariation = (Math.random() - 0.5) * 0.05 + weeklyPattern;
        break;
      
      case 'temperature': // Temperature - strong daily and seasonal patterns
        dailyPattern = Math.sin((hourOfDay - 6) * Math.PI / 12) * 3; // 6°C daily variation
        seasonalEffect = Math.sin((dayOfYear - 90) * 2 * Math.PI / 365) * 8; // 16°C seasonal range
        baseVariation = (Math.random() - 0.5) * 0.5;
        break;
      
      case 'hyacinth': // Water hyacinth - affected by nutrients, temperature, and interventions
        // More likely to increase in warm, nutrient-rich conditions
        const nutrientFactor = currentValue > 30 ? 0.03 : 0.01; // Faster growth at higher densities
        const temperatureFactor = hourOfDay > 10 && hourOfDay < 18 ? 0.02 : 0; // Growth during warm daylight hours
        // Small random chance of sudden increase (new infestation from upstream)
        const suddenIncrease = Math.random() < 0.01 ? Math.random() * 5 : 0;
        baseVariation = (Math.random() - 0.6) * 0.5 + nutrientFactor + temperatureFactor + suddenIncrease; // Bias toward increase
        break;
      
      case 'nitrogen': // Total nitrogen - affected by runoff and biological processes
        const rainfallEffect = Math.sin(dayOfYear * 2 * Math.PI / 30) * 0.1; // Monthly rainfall patterns
        baseVariation = (Math.random() - 0.5) * 0.08 + rainfallEffect;
        break;
      
      case 'nitrate': // Nitrate levels - related to nitrogen, affected by agricultural runoff
        const agriculturalPattern = Math.sin(dayOfYear * 2 * Math.PI / 14) * 0.05; // Bi-weekly patterns
        baseVariation = (Math.random() - 0.5) * 0.06 + agriculturalPattern;
        break;
      
      case 'ammonia': // Ammonia - affected by decomposition and biological processes
        dailyPattern = Math.sin((hourOfDay - 12) * Math.PI / 12) * 0.01; // Peak in afternoon
        baseVariation = (Math.random() - 0.5) * 0.02;
        break;
    }

    const totalVariation = baseVariation + dailyPattern + seasonalEffect;
    const newValue = currentValue + totalVariation * this.config.variabilityFactor;

    // Apply realistic bounds
    switch (parameter) {
      case 'do': return Math.max(0, Math.min(15, newValue));
      case 'ph': return Math.max(4, Math.min(11, newValue));
      case 'tss': return Math.max(0, Math.min(20000, newValue));
      case 'phosphate': return Math.max(0, Math.min(2, newValue));
      case 'temperature': return Math.max(5, Math.min(35, newValue));
      case 'hyacinth': return Math.max(0, Math.min(100, newValue)); // Percentage 0-100
      case 'nitrogen': return Math.max(0, Math.min(10, newValue)); // mg/L, typical range 0-10
      case 'nitrate': return Math.max(0, Math.min(5, newValue)); // mg/L, typical range 0-5
      case 'ammonia': return Math.max(0, Math.min(1, newValue)); // mg/L, typical range 0-1
      default: return newValue;
    }
  }

  private detectAnomalies(buoyId: string, sensors: any): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const now = new Date();

    // Advanced pattern-based anomaly detection
    const historical = this.historicalData.get(buoyId) || [];
    
    if (historical.length > 24) { // Need at least 24 hours of data
      // Detect rapid changes
      const recentData = historical.slice(-24);
      
      Object.keys(sensors).forEach(param => {
        const currentValue = sensors[param];
        const recentValues = recentData.map(d => d.data[param]);
        const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
        const deviation = Math.abs(currentValue - avgRecent) / avgRecent;

        if (deviation > 0.5) { // 50% deviation from recent average
          anomalies.push({
            buoyId,
            parameter: param,
            severity: deviation > 1 ? 'critical' : 'high',
            description: `Unusual ${param} reading: ${deviation > 1 ? 'extreme' : 'significant'} deviation from normal patterns`,
            timestamp: now,
            likelihood: Math.min(0.95, deviation)
          });
        }
      });
    }

    // Cross-parameter correlation anomalies
    if (sensors.do < 4 && sensors.temperature > 25) {
      anomalies.push({
        buoyId,
        parameter: 'correlation',
        severity: 'high',
        description: 'High temperature with low oxygen detected - potential thermal stratification',
        timestamp: now,
        likelihood: 0.85
      });
    }

    if (sensors.ph < 6.5 && sensors.phosphate > 0.3) {
      anomalies.push({
        buoyId,
        parameter: 'correlation',
        severity: 'medium',
        description: 'Low pH with high phosphate may indicate algal decomposition',
        timestamp: now,
        likelihood: 0.7
      });
    }

    // Water hyacinth anomalies
    if (sensors.hyacinth) {
      if (sensors.hyacinth >= 60) {
        anomalies.push({
          buoyId,
          parameter: 'hyacinth',
          severity: 'critical',
          description: 'Critical hyacinth infestation detected - immediate intervention required',
          timestamp: now,
          likelihood: 1.0
        });
      } else if (sensors.hyacinth >= 35) {
        anomalies.push({
          buoyId,
          parameter: 'hyacinth',
          severity: 'high',
          description: 'Elevated hyacinth levels - increased monitoring recommended',
          timestamp: now,
          likelihood: 0.9
        });
      }

      // Check for rapid growth
      if (historical.length > 6) {
        const recentHyacinth = historical.slice(-6).map(d => d.data.hyacinth || 0);
        const avgRecent = recentHyacinth.reduce((a, b) => a + b, 0) / recentHyacinth.length;
        const growth = sensors.hyacinth - avgRecent;
        
        if (growth > 3) { // More than 3% increase in recent period
          anomalies.push({
            buoyId,
            parameter: 'hyacinth',
            severity: 'high',
            description: 'Rapid hyacinth growth detected - early intervention recommended',
            timestamp: now,
            likelihood: 0.85
          });
        }
      }
    }

    return anomalies;
  }

  private calculateDynamicStatus(sensors: any, alerts: string[]): 'good' | 'warning' | 'critical' {
    let score = 100; // Start with perfect score

    // Deduct points for each parameter outside optimal range
    if (sensors.do < 6) score -= (6 - sensors.do) * 10;
    if (sensors.do < 4) score -= 30; // Critical oxygen depletion

    if (sensors.ph < 6.5 || sensors.ph > 8.5) score -= Math.abs(7.5 - sensors.ph) * 15;
    if (sensors.ph < 6 || sensors.ph > 9) score -= 25; // Critical pH

    if (sensors.tss > 3000) score -= (sensors.tss - 3000) / 100;
    if (sensors.tss > 6000) score -= 20; // Critical turbidity

    if (sensors.phosphate > 0.25) score -= (sensors.phosphate - 0.25) * 80;
    if (sensors.phosphate > 0.4) score -= 25; // Critical eutrophication risk

    // Water hyacinth deductions
    if (sensors.hyacinth) {
      if (sensors.hyacinth > 20) score -= (sensors.hyacinth - 20) * 0.5;
      if (sensors.hyacinth > 40) score -= 20; // Elevated hyacinth
      if (sensors.hyacinth > 60) score -= 30; // Critical infestation
    }

    // Multiple alerts compound the severity
    score -= alerts.length * 15;

    if (score < 30) return 'critical';
    if (score < 70) return 'warning';
    return 'good';
  }

  private storeHistoricalData(buoyId: string, sensors: any) {
    if (!this.historicalData.has(buoyId)) {
      this.historicalData.set(buoyId, []);
    }
    
    const data = this.historicalData.get(buoyId)!;
    data.push({
      timestamp: new Date(),
      data: { ...sensors }
    });

    // Keep only last 7 days of data
    if (data.length > 7 * 24 * 6) { // 6 readings per hour * 24 hours * 7 days
      data.shift();
    }
  }

  private generatePredictiveInsights(buoys: BuoyData[]): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const now = new Date();

    // Limit insights generation to prevent performance issues
    const maxInsightsPerRun = 2;
    let insightCount = 0;

    buoys.forEach(buoy => {
      if (insightCount >= maxInsightsPerRun) return;
      
      const historical = this.historicalData.get(buoy.id) || [];
      
      if (historical.length > 12) { // Need sufficient data for predictions
        // Trend analysis for dissolved oxygen
        const recentDO = historical.slice(-12).map(d => d.data.do);
        const doTrend = this.calculateTrend(recentDO);
        
        if (doTrend.direction === 'decreasing' && doTrend.rate > 0.1) {
          insights.push({
            id: `insight-${buoy.id}-do-${now.getTime()}`,
            buoyId: buoy.id,
            type: 'warning',
            title: 'Oxygen Depletion Trend Detected',
            description: `Dissolved oxygen levels are declining at ${doTrend.rate.toFixed(2)} mg/L per hour. At this rate, critical levels may be reached within ${Math.floor((buoy.sensors.do - 4) / doTrend.rate)} hours.`,
            confidence: doTrend.confidence,
            timeframe: 'Next 6-12 hours',
            impact: doTrend.rate > 0.3 ? 'high' : 'medium',
            actionRequired: doTrend.rate > 0.2
          });
          insightCount++;
        }

        // Algae bloom prediction
        if (insightCount < maxInsightsPerRun && buoy.sensors.phosphate > 0.3 && buoy.sensors.temperature > 24) {
          const riskScore = (buoy.sensors.phosphate - 0.2) * (buoy.sensors.temperature - 20) * 10;
          insights.push({
            id: `insight-${buoy.id}-algae-${now.getTime()}`,
            buoyId: buoy.id,
            type: 'forecast',
            title: 'Algae Bloom Risk Assessment',
            description: `Current conditions (phosphate: ${buoy.sensors.phosphate} mg/L, temp: ${buoy.sensors.temperature}°C) indicate ${riskScore > 50 ? 'high' : 'moderate'} risk of algae bloom development.`,
            confidence: Math.min(0.9, riskScore / 100),
            timeframe: 'Next 3-7 days',
            impact: riskScore > 50 ? 'high' : 'medium',
            actionRequired: riskScore > 60
          });
          insightCount++;
        }

        // Equipment maintenance predictions
        if (insightCount < maxInsightsPerRun) {
          const tssVariability = this.calculateVariability(historical.slice(-24).map(d => d.data.tss));
          if (tssVariability > 500) {
            insights.push({
              id: `insight-${buoy.id}-maintenance-${now.getTime()}`,
              buoyId: buoy.id,
              type: 'recommendation',
              title: 'Sensor Calibration Recommended',
              description: `High variability in TSS readings suggests potential sensor drift or contamination. Calibration may improve data accuracy.`,
              confidence: 0.75,
              timeframe: 'Next maintenance window',
              impact: 'medium',
              actionRequired: false
            });
            insightCount++;
          }
        }
      }
    });

    return insights;
  }

  private calculateTrend(values: number[]): { direction: 'increasing' | 'decreasing' | 'stable'; rate: number; confidence: number } {
    if (values.length < 3) return { direction: 'stable', rate: 0, confidence: 0 };

    // Simple linear regression
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const totalSumSquares = values.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const residualSumSquares = values.reduce((sum, yi, i) => {
      const predicted = slope * i + (sumY - slope * sumX) / n;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    return {
      direction: Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing',
      rate: Math.abs(slope),
      confidence: Math.max(0, Math.min(1, rSquared))
    };
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  public getRecentAnomalies(limit: number = 10): AnomalyDetection[] {
    return this.anomalies
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getInsights(): PredictiveInsight[] {
    return this.insights;
  }

  public getHistoricalData(buoyId: string, hours: number = 24): Array<{ timestamp: Date; data: any }> {
    const data = this.historicalData.get(buoyId) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return data.filter(d => d.timestamp > cutoff);
  }
}