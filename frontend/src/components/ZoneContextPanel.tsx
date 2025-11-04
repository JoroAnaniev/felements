import React from 'react';
import { BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  History, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface ZoneContextPanelProps {
  buoys: BuoyData[];
  zoneName: string;
}

export function ZoneContextPanel({ buoys, zoneName }: ZoneContextPanelProps) {
  if (buoys.length === 0) return null;

  // Aggregate historical data
  const allHistoricalData = buoys
    .filter(b => b.historicalData && b.historicalData.length > 0)
    .flatMap(b => 
      b.historicalData!.map(h => ({
        ...h,
        buoyName: b.name,
        buoyId: b.id
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Last 10 entries

  // Calculate zone statistics
  const currentAvgHyacinth = buoys.reduce((acc, b) => acc + (b.sensors.hyacinth || 0), 0) / buoys.length;
  
  // Get all interventions
  const interventions = allHistoricalData
    .filter(h => h.interventions && h.interventions.length > 0)
    .flatMap(h => h.interventions!.map(intervention => ({
      date: h.date,
      intervention,
      buoyName: h.buoyName
    })))
    .slice(0, 5);

  // Probable causes based on data analysis
  const probableCauses = [];
  if (currentAvgHyacinth > 40) {
    probableCauses.push({
      title: 'High nutrient levels',
      description: 'Elevated phosphate and nitrogen levels promote hyacinth growth',
      severity: 'high'
    });
  }
  if (currentAvgHyacinth > 30) {
    probableCauses.push({
      title: 'Warm water temperatures',
      description: 'Optimal temperature conditions for rapid hyacinth proliferation',
      severity: 'medium'
    });
  }
  if (interventions.length < 3) {
    probableCauses.push({
      title: 'Insufficient intervention frequency',
      description: 'Limited recent control measures may have allowed unchecked growth',
      severity: 'medium'
    });
  }

  // Recommended actions based on patterns
  const recommendedActions = [];
  if (currentAvgHyacinth > 60) {
    recommendedActions.push({
      priority: 'critical',
      action: 'Emergency mechanical removal',
      details: 'Deploy harvesting equipment immediately to reduce coverage below 50%'
    });
    recommendedActions.push({
      priority: 'critical',
      action: 'Chemical treatment application',
      details: 'Apply EPA-approved herbicides in conjunction with mechanical removal'
    });
  } else if (currentAvgHyacinth > 35) {
    recommendedActions.push({
      priority: 'high',
      action: 'Increase monitoring frequency',
      details: 'Monitor zone daily and implement bi-weekly manual removal'
    });
    recommendedActions.push({
      priority: 'high',
      action: 'Targeted herbicide application',
      details: 'Apply spot treatments to prevent further spread'
    });
  } else if (currentAvgHyacinth > 20) {
    recommendedActions.push({
      priority: 'medium',
      action: 'Continue routine maintenance',
      details: 'Maintain current monitoring and manual removal schedule'
    });
    recommendedActions.push({
      priority: 'medium',
      action: 'Nutrient reduction measures',
      details: 'Implement water quality improvement strategies to limit growth'
    });
  } else {
    recommendedActions.push({
      priority: 'low',
      action: 'Maintain current strategy',
      details: 'Current management approach is effective, continue routine monitoring'
    });
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone Overview */}
      <Card className="glass-card border-0 shadow-professional">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <History className="w-5 h-5 text-green-600" />
            <span>{zoneName} - Context & Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Current Avg Coverage</p>
              <p className="text-2xl text-blue-900">{currentAvgHyacinth.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Active Sensors</p>
              <p className="text-2xl text-purple-900">{buoys.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Data */}
      <Card className="glass-card border-0 shadow-professional">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Calendar className="w-4 h-4 text-green-600" />
            <span>Recent History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allHistoricalData.slice(0, 5).map((entry, idx) => {
              const prevEntry = allHistoricalData[idx + 1];
              const trend = prevEntry ? entry.hyacinth - prevEntry.hyacinth : null;
              
              return (
                <div key={`${entry.buoyId}-${entry.date}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{entry.buoyName}</span>
                      <span className="text-xs text-gray-500">{entry.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trend !== null && (
                        <span className={`flex items-center space-x-1 text-xs ${
                          trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {trend !== 0 && <span>{Math.abs(trend).toFixed(1)}%</span>}
                        </span>
                      )}
                      <span className="text-sm text-gray-900">{entry.hyacinth.toFixed(1)}%</span>
                    </div>
                  </div>
                  {entry.interventions && entry.interventions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.interventions.map((intervention, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          {intervention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Probable Causes */}
      {probableCauses.length > 0 && (
        <Card className="glass-card border-0 shadow-professional">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Probable Causes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {probableCauses.map((cause, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityColor(cause.severity)}`} />
                    <div>
                      <h5 className="text-sm text-gray-900 mb-1">{cause.title}</h5>
                      <p className="text-xs text-gray-600">{cause.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      <Card className="glass-card border-0 shadow-professional">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Lightbulb className="w-4 h-4 text-green-600" />
            <span>Recommended Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedActions.map((action, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border-2 border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm text-gray-900">{action.action}</h5>
                  <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{action.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Previous Interventions */}
      {interventions.length > 0 && (
        <Card className="glass-card border-0 shadow-professional">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Previous Interventions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {interventions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-sm text-gray-900">{item.intervention}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{item.buoyName}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
