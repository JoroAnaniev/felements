import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Activity, Brain, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { BuoyData, Page } from '../App';
import { PredictiveInsight } from './DataSimulationEngine';
import { MobileLayout } from './MobileLayout';

interface SimpleAnalyticsProps {
  buoys: BuoyData[];
  insights: PredictiveInsight[];
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function SimpleAnalytics({ buoys, insights, onNavigate, onLogout }: SimpleAnalyticsProps) {
  // Simple system metrics
  const systemMetrics = {
    totalBuoys: buoys.length,
    criticalBuoys: buoys.filter(b => b.status === 'critical').length,
    warningBuoys: buoys.filter(b => b.status === 'warning').length,
    goodBuoys: buoys.filter(b => b.status === 'good').length,
    activeAlerts: buoys.reduce((sum, b) => sum + b.alerts.length, 0),
    predictiveAlerts: insights.filter(i => i.actionRequired).length
  };

  const healthScore = Math.round(
    (systemMetrics.goodBuoys / systemMetrics.totalBuoys) * 100
  );

  // Simple chart data
  const statusData = [
    { name: 'Operational', value: systemMetrics.goodBuoys, fill: '#22c55e' },
    { name: 'Warning', value: systemMetrics.warningBuoys, fill: '#f59e0b' },
    { name: 'Critical', value: systemMetrics.criticalBuoys, fill: '#ef4444' }
  ];

  const parameterData = buoys.slice(0, 5).map(buoy => ({
    name: buoy.name.split(' ')[0],
    do: buoy.sensors.do,
    ph: buoy.sensors.ph,
    temperature: buoy.sensors.temperature
  }));

  return (
    <MobileLayout currentPage="analytics" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl text-[rgba(45,80,22,1)]">Advanced Analytics</h1>
                <p className="text-[rgba(92,107,92,1)] text-sm md:text-base">AI-powered insights and system analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${
                healthScore >= 80 ? 'status-good' : 
                healthScore >= 60 ? 'status-warning' : 'status-critical'
              }`}>
                System Health: {healthScore}%
              </Badge>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            {/* System Overview Card */}
            <div className="glass-card border-0 shadow-professional">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>System Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="text-2xl font-bold text-indigo-600">{systemMetrics.predictiveAlerts}</div>
                    <div className="text-xs text-gray-600">AI Alerts</div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Parameter Overview */}
              <Card className="glass-card border-0 shadow-professional">
                <CardHeader>
                  <CardTitle className="text-lg">Parameter Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={parameterData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="do" fill="#22c55e" name="Dissolved O₂" />
                        <Bar dataKey="ph" fill="#3b82f6" name="pH Level" />
                        <Bar dataKey="temperature" fill="#f59e0b" name="Temperature" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Insights */}
            {insights.length > 0 && (
              <Card className="glass-card border-0 shadow-professional">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Recent AI Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.slice(0, 3).map((insight, index) => (
                      <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={`${
                                insight.type === 'warning' ? 'status-warning' :
                                insight.type === 'recommendation' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {insight.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                          {insight.actionRequired && (
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}