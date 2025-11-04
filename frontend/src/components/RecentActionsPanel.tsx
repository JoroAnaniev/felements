import React from 'react';
import { ActionLog, BuoyData, Page } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface RecentActionsPanelProps {
  actionLogs: ActionLog[];
  buoys?: BuoyData[];
  showTitle?: boolean;
  onNavigate?: (page: Page) => void;
  isGuestMode?: boolean;
}

export function RecentActionsPanel({ 
  actionLogs = [], 
  buoys = [], 
  showTitle = true, 
  onNavigate,
  isGuestMode = false 
}: RecentActionsPanelProps) {
  const getBuoyName = (buoyId: string) => {
    if (!buoys || buoys.length === 0) return 'Unknown Buoy';
    const buoy = buoys.find(b => b.id === buoyId);
    return buoy?.name || 'Unknown Buoy';
  };

  const getActionTypeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'maintenance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'calibration':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inspection':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show only the most recent actions (fewer if not showing title for compact view)
  const maxActions = showTitle ? 5 : 3;
  const recentActions = actionLogs && actionLogs.length > 0 ? actionLogs.slice(-maxActions).reverse() : [];

  if (!showTitle) {
    return (
      <div className="space-y-3">
        {recentActions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No recent actions</p>
          </div>
        ) : (
          recentActions.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={`text-xs ${getActionTypeColor(log.category)}`}>
                    {log.category}
                  </Badge>
                  <p className="text-sm text-gray-900 mt-1">{getBuoyName(log.buoyId)}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {log.timestamp}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-snug line-clamp-2">
                <span className="font-medium">{log.action}:</span> {log.details}
              </p>
              
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {log.user}
              </div>
            </div>
          ))
        )}
        
        {actionLogs.length > 3 && onNavigate && (
          <div className="text-center pt-2">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => {
                if (isGuestMode && onNavigate) {
                  onNavigate('logging');
                } else if (onNavigate) {
                  onNavigate('logging');
                }
              }}
            >
              View all actions ({actionLogs.length})
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No recent actions</p>
          </div>
        ) : (
          recentActions.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={`text-xs ${getActionTypeColor(log.category)}`}>
                    {log.category}
                  </Badge>
                  <p className="text-sm text-gray-900 mt-1">{getBuoyName(log.buoyId)}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {log.timestamp}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-snug">
                <span className="font-medium">{log.action}:</span> {log.details}
              </p>
              
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {log.user}
              </div>
            </div>
          ))
        )}
        
        {actionLogs.length > 5 && onNavigate && (
          <div className="text-center pt-2">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => {
                if (isGuestMode && onNavigate) {
                  onNavigate('logging');
                } else if (onNavigate) {
                  onNavigate('logging');
                }
              }}
            >
              View all actions ({actionLogs.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}