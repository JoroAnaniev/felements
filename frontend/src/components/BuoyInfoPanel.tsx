  import React from 'react';
  import { BuoyData } from '../App';
  import { Badge } from './ui/badge';
  import { Button } from './ui/button';
  import { Eye } from 'lucide-react';

  interface BuoyInfoPanelProps {
    buoys: BuoyData[];
    onBuoyClick: (buoy: BuoyData) => void;
    onViewDetails: (buoy: BuoyData) => void;
    selectedBuoy: BuoyData | null;
    sensorItemRefs?: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  }

  export function BuoyInfoPanel({ buoys = [], onBuoyClick, onViewDetails, selectedBuoy, sensorItemRefs }: BuoyInfoPanelProps) {
    // Safe handling of undefined or empty buoys array
    if (!buoys || buoys.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Sensors Available</h3>
          <p className="text-xs text-gray-500">No monitoring points found in the selected area</p>
        </div>
      );
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'good': 
          return 'bg-green-50 text-green-700 border-green-200 shadow-sm';
        case 'warning': 
          return 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm';
        case 'critical': 
          return 'bg-red-50 text-red-700 border-red-200 shadow-sm';
        default: 
          return 'bg-gray-50 text-gray-700 border-gray-200 shadow-sm';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'good':
          return (
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case 'warning':
          return (
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'critical':
          return (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
      }
    };

    const getPriorityOrder = (status: string) => {
      switch (status) {
        case 'critical': return 0;
        case 'warning': return 1;
        case 'good': return 2;
        default: return 3;
      }
    };

    // Sort buoys by status priority (critical first, then warning, then good)
    const sortedBuoys = [...buoys].sort((a, b) => {
      const aPriority = getPriorityOrder(a.status);
      const bPriority = getPriorityOrder(b.status);
      return aPriority - bPriority;
    });

    return (
      <div className="space-y-3">
        {sortedBuoys.map((buoy) => (
          <div
            key={buoy.id}
            ref={(el) => {
              if (sensorItemRefs) {
                sensorItemRefs.current[buoy.id] = el;
              }
            }}
            className={`relative rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
              selectedBuoy?.id === buoy.id
                ? 'ring-2 ring-green-500 ring-opacity-50 border-green-300 bg-green-50/50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => onViewDetails(buoy)}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {buoy.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Zone {buoy.zone.replace('zone', '')} • Updated {buoy.lastUpdate}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  {getStatusIcon(buoy.status)}
                  <Badge 
                    className={`text-xs capitalize ${getStatusColor(buoy.status)}`}
                  >
                    {buoy.status}
                  </Badge>
                </div>
              </div>

              {/* Quick Summary */}
              {buoy.sensors && (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Turbidity</p>
                      <p className="text-sm font-medium text-gray-900">{buoy.sensors.do} NTU</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">pH</p>
                      <p className="text-sm font-medium text-gray-900">{buoy.sensors.ph}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Temp</p>
                      <p className="text-sm font-medium text-gray-900">{buoy.sensors.temperature}°C</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts Summary */}
              {buoy.alerts && buoy.alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-xs font-medium text-red-800">
                      {buoy.alerts.length} Active Alert{buoy.alerts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Text */}
              <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Click to select</span>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedBuoy?.id === buoy.id && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
            )}
          </div>
        ))}
      </div>
    );
  }