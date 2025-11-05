import React from 'react';
import { BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Zone } from './MainDashboard';

interface SystemOverviewProps {
  buoys: BuoyData[];
  selectedZone: Zone;
  sensor?: any; // or better: SensorApiResponse if you have the type
}

export function SystemOverview({ buoys, selectedZone, sensor }: SystemOverviewProps) {
  // Filter buoys based on selected zone
  const filteredBuoys = selectedZone === 'overall' 
    ? buoys 
    : buoys.filter(b => b.zone === selectedZone);

  const goodBuoys = filteredBuoys.filter(b => b.status === 'good').length;
  const warningBuoys = filteredBuoys.filter(b => b.status === 'warning').length;
  const criticalBuoys = filteredBuoys.filter(b => b.status === 'critical').length;
  const totalAlerts = filteredBuoys.reduce((acc, buoy) => acc + buoy.alerts.length, 0);

  const avgTemperature = filteredBuoys.length > 0 
    ? filteredBuoys.reduce((acc, buoy) => acc + buoy.sensors.temperature, 0) / filteredBuoys.length 
    : 0;
  const avgPH = filteredBuoys.length > 0 
    ? filteredBuoys.reduce((acc, buoy) => acc + buoy.sensors.ph, 0) / filteredBuoys.length 
    : 0;
  const avgDO = filteredBuoys.length > 0 
    ? filteredBuoys.reduce((acc, buoy) => acc + buoy.sensors.do, 0) / filteredBuoys.length 
    : 0;

  const cards = [
    {
      title: 'System Status',
      value: `${goodBuoys}/${filteredBuoys.length} Good`,
      description: `${criticalBuoys} critical, ${warningBuoys} warnings`,
      icon: (
        <svg className={`w-6 h-6 ${criticalBuoys > 0 ? 'text-red-600' : warningBuoys > 0 ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: criticalBuoys > 0 ? 'border-red-200 bg-red-50' : warningBuoys > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
    },
    {
      title: 'Active Alerts',
      value: totalAlerts.toString(),
      description: 'Across all monitoring points',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: totalAlerts > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
    },
    {
      title: 'Avg Temperature',
      value: sensor?.Temperature_Readings?.[0]?.Temperature_Value
        ? `${sensor.Temperature_Readings[0].Temperature_Value}°C`
        : '—',
      description: 'Current water temperature',
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'border-orange-200 bg-orange-50'
    },
    {
      title: 'Avg pH Level',
      value: sensor?.PH_Readings?.[0]?.PH_Value
        ? sensor.PH_Readings[0].PH_Value.toFixed(2)
        : '—',
      description: 'Water acidity level',
      icon: (
        <svg
          className={`w-6 h-6 ${
            sensor?.PH_Readings?.[0]?.PH_Value &&
            (sensor.PH_Readings[0].PH_Value < 6.5 || sensor.PH_Readings[0].PH_Value > 8.5)
              ? 'text-orange-600'
              : 'text-green-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
      color: avgPH < 6.5 || avgPH > 8.5 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'

    }
    ,
    {
      title: 'Avg Dissolved O₂',
      value: `${avgDO.toFixed(1)} mg/L`,
      description: 'Oxygen levels in water',
      icon: (
        <svg className={`w-6 h-6 ${avgDO < 5 ? 'text-red-600' : avgDO < 7 ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: avgDO < 5 ? 'border-red-200 bg-red-50' : avgDO < 7 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'
    },  
    {
      title: 'Monitoring Points',
      value: filteredBuoys.length.toString(),
      description: 'Active sensor buoys',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'border-blue-200 bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.color} border`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-gray-700">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-900 mb-1">{card.value}</div>
            <p className="text-xs text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}