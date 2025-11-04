import React from 'react';
import { BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Info, Lightbulb, Droplets, Activity, Waves } from 'lucide-react';

interface DiagnosticsPanelProps {
  buoy: BuoyData;
}

export function DiagnosticsPanel({ buoy }: DiagnosticsPanelProps) {
  // Generate probable causes based on sensor readings
  const getProbableCauses = () => {
    const causes: Array<{ icon: React.ReactNode; title: string; description: string; severity: 'high' | 'medium' | 'low' }> = [];

    // Dissolved Oxygen issues
    if (buoy.sensors.do < 6.0) {
      causes.push({
        icon: <Activity className="w-4 h-4" />,
        title: 'Low Dissolved Oxygen',
        description: buoy.sensors.do < 4.5 
          ? 'Critical oxygen depletion - likely caused by algae blooms, high organic load, or thermal stratification'
          : 'Oxygen levels declining - may be due to increased biological activity or reduced water circulation',
        severity: buoy.sensors.do < 4.5 ? 'high' : 'medium'
      });
    }

    // pH issues
    if (buoy.sensors.ph < 6.8 || buoy.sensors.ph > 8.2) {
      causes.push({
        icon: <Droplets className="w-4 h-4" />,
        title: 'pH Imbalance',
        description: buoy.sensors.ph < 6.5 || buoy.sensors.ph > 8.5
          ? 'Severe pH deviation - potential acid rain impact, algae bloom byproducts, or chemical runoff'
          : 'pH trending outside optimal range - monitor for continued deviation',
        severity: buoy.sensors.ph < 6.5 || buoy.sensors.ph > 8.5 ? 'high' : 'medium'
      });
    }

    // TSS issues
    if (buoy.sensors.tss > 4000) {
      causes.push({
        icon: <Waves className="w-4 h-4" />,
        title: 'Elevated Suspended Solids',
        description: buoy.sensors.tss > 6000
          ? 'Critical turbidity - likely erosion, storm water runoff, or resuspension of sediments'
          : 'Increased particulate matter - may indicate upstream erosion or recent weather events',
        severity: buoy.sensors.tss > 6000 ? 'high' : 'medium'
      });
    }

    // Phosphate issues
    if (buoy.sensors.phosphate > 0.25) {
      causes.push({
        icon: <Info className="w-4 h-4" />,
        title: 'Nutrient Enrichment',
        description: buoy.sensors.phosphate > 0.35
          ? 'Critical phosphate levels - agricultural runoff, sewage contamination, or fertilizer leaching'
          : 'Elevated nutrients - potential for algae bloom development if unchecked',
        severity: buoy.sensors.phosphate > 0.35 ? 'high' : 'medium'
      });
    }

    // If everything is good
    if (causes.length === 0) {
      causes.push({
        icon: <Info className="w-4 h-4" />,
        title: 'Normal Operations',
        description: 'All water quality parameters within acceptable ranges. Continue routine monitoring.',
        severity: 'low'
      });
    }

    return causes;
  };

  // Generate recommended actions
  const getRecommendedActions = () => {
    const actions: Array<{ icon: React.ReactNode; title: string; description: string; priority: 'immediate' | 'soon' | 'routine' }> = [];

    // Based on status
    if (buoy.status === 'critical') {
      actions.push({
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Immediate Field Investigation',
        description: 'Deploy field team for water sampling and visual inspection within 2 hours',
        priority: 'immediate'
      });
    }

    // Dissolved Oxygen actions
    if (buoy.sensors.do < 6.0) {
      actions.push({
        icon: <Activity className="w-4 h-4" />,
        title: buoy.sensors.do < 4.5 ? 'Emergency Aeration' : 'Increase Monitoring Frequency',
        description: buoy.sensors.do < 4.5
          ? 'Consider emergency aeration systems to prevent fish kills. Alert environmental authorities.'
          : 'Increase DO monitoring to every 2 hours. Investigate potential sources of oxygen depletion.',
        priority: buoy.sensors.do < 4.5 ? 'immediate' : 'soon'
      });
    }

    // pH actions
    if (buoy.sensors.ph < 6.8 || buoy.sensors.ph > 8.2) {
      actions.push({
        icon: <Droplets className="w-4 h-4" />,
        title: buoy.sensors.ph < 6.5 || buoy.sensors.ph > 8.5 ? 'pH Correction Required' : 'Monitor pH Trend',
        description: buoy.sensors.ph < 6.5 || buoy.sensors.ph > 8.5
          ? 'Assess need for pH buffering. Identify and mitigate source of pH alteration.'
          : 'Track pH changes hourly. Prepare for intervention if trend continues.',
        priority: buoy.sensors.ph < 6.5 || buoy.sensors.ph > 8.5 ? 'immediate' : 'soon'
      });
    }

    // TSS actions
    if (buoy.sensors.tss > 4000) {
      actions.push({
        icon: <Waves className="w-4 h-4" />,
        title: buoy.sensors.tss > 6000 ? 'Sediment Control Urgently Needed' : 'Investigate Turbidity Source',
        description: buoy.sensors.tss > 6000
          ? 'Inspect upstream for erosion sources. Consider temporary sediment barriers or coagulation treatment.'
          : 'Survey catchment area for erosion. Check inlet streams and storm water systems.',
        priority: buoy.sensors.tss > 6000 ? 'immediate' : 'soon'
      });
    }

    // Phosphate actions
    if (buoy.sensors.phosphate > 0.25) {
      actions.push({
        icon: <Info className="w-4 h-4" />,
        title: buoy.sensors.phosphate > 0.35 ? 'Nutrient Management Required' : 'Track Phosphate Levels',
        description: buoy.sensors.phosphate > 0.35
          ? 'Inspect for point sources (sewage, industrial discharge). Assess agricultural runoff controls.'
          : 'Monitor daily. Prepare algae bloom response plan as precaution.',
        priority: buoy.sensors.phosphate > 0.35 ? 'immediate' : 'soon'
      });
    }

    // Sensor calibration
    actions.push({
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Routine Sensor Calibration',
      description: 'Schedule monthly sensor calibration and cleaning to ensure data accuracy.',
      priority: 'routine'
    });

    return actions;
  };

  const causes = getProbableCauses();
  const actions = getRecommendedActions();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-50 border-red-200 text-red-800';
      case 'soon': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Probable Causes */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-5 h-5 text-blue-600" />
            Probable Causes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {causes.map((cause, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(cause.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{cause.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{cause.title}</h4>
                    <p className="text-xs opacity-90">{cause.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(action.priority)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
