import React, { useState } from 'react';
import { Page, BuoyData, ActionLog } from '../App';
import { MobileLayout } from './MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportsProps {
  buoys: BuoyData[];
  actionLogs: ActionLog[];
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentUser?: any | null;
  isGuestMode?: boolean;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export function Reports({ 
  buoys, 
  actionLogs, 
  onNavigate, 
  onLogout,
  currentUser,
  isGuestMode = false,
  onToggleDarkMode,
  isDarkMode = false 
}: ReportsProps) {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('7days');

  // Generate water quality trend data based on actual buoy data and timeRange
  const generateWaterQualityTrend = () => {
    // Get current averages
    const currentAvgDO = buoys.reduce((sum, buoy) => sum + buoy.sensors.do, 0) / buoys.length;
    const currentAvgPH = buoys.reduce((sum, buoy) => sum + buoy.sensors.ph, 0) / buoys.length;
    const currentAvgTSS = buoys.reduce((sum, buoy) => sum + buoy.sensors.tss, 0) / buoys.length;

    // Determine number of days based on timeRange
    let numDays = 7;
    switch(timeRange) {
      case '7days': numDays = 7; break;
      case '30days': numDays = 30; break;
      case '90days': numDays = 90; break;
      case '1year': numDays = 365; break;
    }

    // Generate historical data
    const data = [];
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate realistic variations around current values
      const dayVariation = Math.sin(i / 3) * 0.5; // Cyclical variation
      const randomVariation = (Math.random() - 0.5) * 0.8; // Random noise
      const trend = (numDays - i) / numDays * 0.3; // Slight upward trend
      
      data.push({
        date: dateStr,
        avgDO: Math.round((currentAvgDO + dayVariation + randomVariation - trend) * 10) / 10,
        avgPH: Math.round((currentAvgPH + dayVariation * 0.1 + randomVariation * 0.1) * 10) / 10,
        avgTSS: Math.round(currentAvgTSS + dayVariation * 300 + randomVariation * 400 + trend * 500)
      });
    }

    return data;
  };

  const waterQualityTrend = generateWaterQualityTrend();

  // Generate hyacinth coverage trend data
  const generateHyacinthTrend = () => {
    // Determine number of days based on timeRange
    let numDays = 7;
    switch(timeRange) {
      case '7days': numDays = 7; break;
      case '30days': numDays = 30; break;
      case '90days': numDays = 90; break;
      case '1year': numDays = 365; break;
    }

    // Generate historical data for hyacinth coverage
    const data = [];
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate average hyacinth coverage across all buoys for this date
      const avgHyacinth = buoys.reduce((sum, buoy) => {
        // Simulate historical values with slight variations
        const currentValue = buoy.sensors.hyacinth || 0;
        const dayVariation = Math.sin((i + buoy.id.charCodeAt(buoy.id.length - 1)) / 5) * 5;
        const randomVariation = (Math.random() - 0.5) * 3;
        const trend = (numDays - i) / numDays * 2; // Slight upward trend
        
        return sum + Math.max(0, Math.min(100, currentValue - dayVariation - randomVariation + trend));
      }, 0) / buoys.length;
      
      data.push({
        date: dateStr,
        avgHyacinth: Math.round(avgHyacinth * 10) / 10,
        minHyacinth: Math.round(Math.min(...buoys.map(b => (b.sensors.hyacinth || 0) * 0.7)) * 10) / 10,
        maxHyacinth: Math.round(Math.max(...buoys.map(b => (b.sensors.hyacinth || 0) * 1.2)) * 10) / 10
      });
    }

    return data;
  };

  const hyacinthTrend = generateHyacinthTrend();

  // Generate actions by type data based on actual logs
  const generateActionsByType = () => {
    const actionTypes = actionLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Add some base data for demonstration
    const baseTypes = {
      'Water Treatment': 10,
      'Manual Removal': 6,
      'Equipment Maintenance': 4,
      'Chemical Dosing': 12,
      'Algae Management': 7
    };

    const mergedTypes = { ...baseTypes, ...actionTypes };
    
    return Object.entries(mergedTypes).map(([type, count]) => ({
      type: type.length > 15 ? type.substring(0, 15) + '...' : type,
      fullType: type,
      count
    }));
  };

  const actionsByType = generateActionsByType();

  const getBuoyName = (buoyId: string) => {
    const buoy = buoys.find(b => b.id === buoyId);
    return buoy?.name || 'Unknown';
  };

  const generatePDF = () => {
    try {
      // Get time range label
      const timeRangeLabel = timeRange === '7days' ? 'Last 7 Days' : 
                            timeRange === '30days' ? 'Last 30 Days' : 
                            timeRange === '90days' ? 'Last 90 Days' : 
                            'Last Year';
      
      // Get report type label
      const reportTypeLabel = reportType === 'summary' ? 'Summary Report' : 
                             reportType === 'detailed' ? 'Detailed Report' : 
                             'Compliance Report';
      
      // Create HTML content for PDF
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hartbeespoort Dam Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #2d5016; border-bottom: 3px solid #2d5016; padding-bottom: 10px; }
            h2 { color: #4a7c59; margin-top: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .metric { display: inline-block; width: 30%; margin: 10px; padding: 15px; background: #f0f7f0; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #2d5016; }
            .metric-label { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #2d5016; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .status-good { color: #22c55e; font-weight: bold; }
            .status-warning { color: #f59e0b; font-weight: bold; }
            .status-critical { color: #ef4444; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            .report-info { background: #e8f5e8; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hartbeespoort Dam Water Quality Report</h1>
            <div class="report-info">
              <p><strong>Report Type:</strong> ${reportTypeLabel}</p>
              <p><strong>Time Period:</strong> ${timeRangeLabel}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <h2>Executive Summary</h2>
          <div class="metric">
            <div class="metric-value">${buoys.filter(b => b.status === 'good').length}/${buoys.length}</div>
            <div class="metric-label">Buoys Operating Normally</div>
          </div>
          <div class="metric">
            <div class="metric-value">${buoys.reduce((acc, buoy) => acc + buoy.alerts.length, 0)}</div>
            <div class="metric-label">Active Alerts</div>
          </div>
          <div class="metric">
            <div class="metric-value">${actionLogs.length}</div>
            <div class="metric-label">Actions Logged</div>
          </div>

          <h2>Buoy Status Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Buoy Name</th>
                <th>Zone</th>
                <th>Status</th>
                <th>DO (mg/L)</th>
                <th>pH</th>
                <th>TSS (mg/L)</th>
                <th>Temp (°C)</th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              ${buoys.map(buoy => `
                <tr>
                  <td>${buoy.name}</td>
                  <td>Zone ${buoy.zone.replace('zone', '')}</td>
                  <td class="status-${buoy.status}">${buoy.status.toUpperCase()}</td>
                  <td>${buoy.sensors.do.toFixed(1)}</td>
                  <td>${buoy.sensors.ph.toFixed(1)}</td>
                  <td>${buoy.sensors.tss}</td>
                  <td>${buoy.sensors.temperature.toFixed(1)}</td>
                  <td>${buoy.alerts.length}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Recent Action Log</h2>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Buoy</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${actionLogs.slice(0, 10).map(log => `
                <tr>
                  <td>${log.timestamp}</td>
                  <td>${log.user}</td>
                  <td>${log.action}</td>
                  <td>${getBuoyName(log.buoyId)}</td>
                  <td>${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Harties Action - Hartbeespoort Dam Monitoring System</p>
            <p>This report is automatically generated and contains real-time data from all monitoring buoys.</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window with the content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const exportData = () => {
    try {
      // Create CSV content
      const csvContent = [
        // Header
        ['Buoy Name', 'Zone', 'Status', 'DO (mg/L)', 'pH', 'TSS (mg/L)', 'Phosphate (mg/L)', 'Temperature (°C)', 'Last Update', 'Alerts'].join(','),
        // Data rows
        ...buoys.map(buoy => [
          `"${buoy.name}"`,
          buoy.zone,
          buoy.status,
          buoy.sensors.do,
          buoy.sensors.ph,
          buoy.sensors.tss,
          buoy.sensors.phosphate,
          buoy.sensors.temperature,
          `"${buoy.lastUpdate}"`,
          `"${buoy.alerts.join('; ')}"`
        ].join(','))
      ].join('\n');

      // Create action logs CSV
      const actionLogsCsv = [
        ['Timestamp', 'User', 'Action', 'Buoy', 'Category', 'Details'].join(','),
        ...actionLogs.map(log => [
          `"${log.timestamp}"`,
          `"${log.user}"`,
          `"${log.action}"`,
          `"${getBuoyName(log.buoyId)}"`,
          log.category,
          `"${log.details}"`
        ].join(','))
      ].join('\n');

      // Create combined CSV
      const fullCsv = `Hartbeespoort Dam Water Quality Report\nGenerated: ${new Date().toLocaleString()}\n\nBuoy Sensor Data:\n${csvContent}\n\n\nAction Log History:\n${actionLogsCsv}`;

      // Create blob and download
      const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `hartbeespoort_dam_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Data exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const renderSummaryReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 mb-1">
              {buoys.filter(b => b.status === 'good').length}/{buoys.length}
            </div>
            <p className="text-xs text-gray-600">Buoys operating normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600 mb-1">
              {buoys.reduce((acc, buoy) => acc + buoy.alerts.length, 0)}
            </div>
            <p className="text-xs text-gray-600">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Actions This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600 mb-1">
              {actionLogs.length}
            </div>
            <p className="text-xs text-gray-600">Interventions logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Water Quality Trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            Water Quality Trends ({timeRange === '7days' ? '7 Days' : timeRange === '30days' ? '30 Days' : timeRange === '90days' ? '90 Days' : '1 Year'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waterQualityTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    // For longer time ranges, show less frequent labels
                    if (timeRange === '1year') {
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    } else if (timeRange === '90days') {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  stroke="#5c6b5c"
                  fontSize={12}
                  interval={timeRange === '1year' ? 30 : timeRange === '90days' ? 10 : timeRange === '30days' ? 4 : 0}
                />
                <YAxis 
                  yAxisId="do-ph"
                  domain={[0, 10]}
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="tss"
                  orientation="right"
                  domain={[0, 6000]}
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #d4e6d4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <Line 
                  yAxisId="do-ph"
                  type="monotone" 
                  dataKey="avgDO" 
                  stroke="#4a7c59" 
                  strokeWidth={3}
                  dot={{ fill: '#4a7c59', strokeWidth: 2, r: 4 }}
                  name="Dissolved Oxygen (mg/L)"
                  activeDot={{ r: 6, stroke: '#4a7c59', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Line 
                  yAxisId="do-ph"
                  type="monotone" 
                  dataKey="avgPH" 
                  stroke="#7ba05b" 
                  strokeWidth={3}
                  dot={{ fill: '#7ba05b', strokeWidth: 2, r: 4 }}
                  name="pH Level"
                  activeDot={{ r: 6, stroke: '#7ba05b', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Line 
                  yAxisId="tss"
                  type="monotone" 
                  dataKey="avgTSS" 
                  stroke="#9cb86f" 
                  strokeWidth={3}
                  dot={{ fill: '#9cb86f', strokeWidth: 2, r: 4 }}
                  name="TSS (mg/L)"
                  activeDot={{ r: 6, stroke: '#9cb86f', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hyacinth Coverage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>
            Water Hyacinth Coverage Over Time ({timeRange === '7days' ? '7 Days' : timeRange === '30days' ? '30 Days' : timeRange === '90days' ? '90 Days' : '1 Year'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hyacinthTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (timeRange === '1year') {
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    } else if (timeRange === '90days') {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  stroke="#5c6b5c"
                  fontSize={12}
                  interval={timeRange === '1year' ? 30 : timeRange === '90days' ? 10 : timeRange === '30days' ? 4 : 0}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="#5c6b5c"
                  fontSize={12}
                  label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #d4e6d4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgHyacinth" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  name="Average Coverage (%)"
                  activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxHyacinth" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Max Coverage (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="minHyacinth" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Min Coverage (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">Avg: {hyacinthTrend[hyacinthTrend.length - 1]?.avgHyacinth}%</span>
              </div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-red-600"></div>
                <span className="text-gray-700">Max: {hyacinthTrend[hyacinthTrend.length - 1]?.maxHyacinth}%</span>
              </div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-blue-600"></div>
                <span className="text-gray-700">Min: {hyacinthTrend[hyacinthTrend.length - 1]?.minHyacinth}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions by Type */}
      <Card>
        <CardHeader>
          <CardTitle>
            Intervention Actions ({timeRange === '7days' ? 'Last 7 Days' : timeRange === '30days' ? 'Last 30 Days' : timeRange === '90days' ? 'Last 90 Days' : 'Last Year'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionsByType} margin={{ top: 5, right: 30, left: 20, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                <XAxis 
                  dataKey="type" 
                  stroke="#5c6b5c"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #d4e6d4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value, payload) => payload?.[0]?.payload?.fullType || value}
                />
                <Bar 
                  dataKey="count" 
                  fill="#4a7c59"
                  radius={[4, 4, 0, 0]}
                  name="Actions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Generate zone comparison data
  const generateZoneComparison = () => {
    const zoneData = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5'].map(zone => {
      const zoneBuoys = buoys.filter(buoy => buoy.zone === zone);
      if (zoneBuoys.length === 0) {
        return {
          zone: `Zone ${zone.charAt(zone.length - 1)}`,
          avgDO: 0,
          avgPH: 0,
          avgTSS: 0,
          avgTemp: 0,
          alertCount: 0
        };
      }
      
      return {
        zone: `Zone ${zone.charAt(zone.length - 1)}`,
        avgDO: Math.round((zoneBuoys.reduce((sum, buoy) => sum + buoy.sensors.do, 0) / zoneBuoys.length) * 10) / 10,
        avgPH: Math.round((zoneBuoys.reduce((sum, buoy) => sum + buoy.sensors.ph, 0) / zoneBuoys.length) * 10) / 10,
        avgTSS: Math.round(zoneBuoys.reduce((sum, buoy) => sum + buoy.sensors.tss, 0) / zoneBuoys.length),
        avgTemp: Math.round((zoneBuoys.reduce((sum, buoy) => sum + buoy.sensors.temperature, 0) / zoneBuoys.length) * 10) / 10,
        alertCount: zoneBuoys.reduce((sum, buoy) => sum + buoy.alerts.length, 0)
      };
    });
    
    return zoneData;
  };

  const renderDetailedReport = () => (
    <div className="space-y-6">
      {/* Zone Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Water Quality by Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateZoneComparison()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1ede1" />
                <XAxis 
                  dataKey="zone" 
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="do-ph"
                  domain={[0, 10]}
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="tss"
                  orientation="right"
                  domain={[0, 'dataMax']}
                  stroke="#5c6b5c"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #d4e6d4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar yAxisId="do-ph" dataKey="avgDO" fill="#4a7c59" name="Avg DO (mg/L)" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="do-ph" dataKey="avgPH" fill="#7ba05b" name="Avg pH" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="tss" dataKey="avgTSS" fill="#9cb86f" name="Avg TSS (mg/L)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Buoy Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Buoy Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buoy Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>DO (mg/L)</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>TSS (mg/L)</TableHead>
                <TableHead>Temperature (°C)</TableHead>
                <TableHead>Alerts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buoys.map((buoy) => (
                <TableRow key={buoy.id}>
                  <TableCell>{buoy.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={buoy.status === 'good' ? 'default' : buoy.status === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {buoy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{buoy.sensors.do}</TableCell>
                  <TableCell>{buoy.sensors.ph}</TableCell>
                  <TableCell>{buoy.sensors.tss}</TableCell>
                  <TableCell>{buoy.sensors.temperature}</TableCell>
                  <TableCell>{buoy.alerts.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Action History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionLogs.slice(-10).reverse().map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{getBuoyName(log.buoyId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MobileLayout 
      currentPage="reports" 
      onNavigate={onNavigate} 
      onLogout={onLogout}
      currentUser={currentUser}
      isGuestMode={isGuestMode}
      onToggleDarkMode={onToggleDarkMode}
      isDarkMode={isDarkMode}
    >
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
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl text-[rgba(45,80,22,1)]">Reports & Analytics</h1>
                <p className="text-[rgba(92,107,92,1)] text-sm md:text-base">Generate and export system reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportData} size="sm" className="md:h-10">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button onClick={generatePDF} size="sm" className="md:h-10">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Generate PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
          {/* Controls */}
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Report Type:</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Time Range:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white rounded-lg p-6">
            {reportType === 'summary' && renderSummaryReport()}
            {reportType === 'detailed' && renderDetailedReport()}
            {reportType === 'compliance' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg text-gray-900 mb-2">Compliance Report</h3>
                <p className="text-gray-600">
                  This section would contain regulatory compliance reporting including
                  water quality standards, permit requirements, and environmental impact assessments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}