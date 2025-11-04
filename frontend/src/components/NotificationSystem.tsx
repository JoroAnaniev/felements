import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Bell, 
  TrendingUp, 
  Zap, 
  Clock,
  Eye,
  AlertCircle,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PredictiveInsight, AnomalyDetection } from './DataSimulationEngine';
import { BuoyData } from '../App';

export interface SystemNotification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success' | 'insight' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  buoyId?: string;
  buoyName?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'water_quality' | 'equipment' | 'prediction' | 'system' | 'maintenance';
  actionRequired: boolean;
  autoClose?: boolean;
  duration?: number;
  data?: any;
  read: boolean;
  acknowledged: boolean;
}

interface NotificationSystemProps {
  insights: PredictiveInsight[];
  anomalies: AnomalyDetection[];
  buoys: BuoyData[];
  onNotificationAction?: (notification: SystemNotification, action: string) => void;
}

export function NotificationSystem({ 
  insights, 
  anomalies, 
  buoys, 
  onNotificationAction 
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  // Convert insights and anomalies to notifications (throttled)
  useEffect(() => {
    if (!insights || !anomalies || !buoys) return;
    
    const newNotifications: SystemNotification[] = [];

    // Process insights (limit to prevent performance issues)
    insights.slice(0, 5).forEach(insight => {
      const buoy = buoys.find(b => b.id === insight.buoyId);
      const existing = notifications.find(n => n.id === `insight-${insight.id}`);
      
      if (!existing) {
        newNotifications.push({
          id: `insight-${insight.id}`,
          type: insight.type === 'warning' ? 'warning' : 'info',
          title: insight.title,
          message: insight.description,
          timestamp: new Date(),
          buoyId: insight.buoyId,
          buoyName: buoy?.name,
          priority: insight.impact === 'high' ? 'high' : insight.impact === 'medium' ? 'medium' : 'low',
          category: 'prediction',
          actionRequired: insight.actionRequired,
          autoClose: false,
          data: insight,
          read: false,
          acknowledged: false
        });
      }
    });

    // Process anomalies (limit to prevent performance issues)
    anomalies.slice(0, 3).forEach(anomaly => {
      const buoy = buoys.find(b => b.id === anomaly.buoyId);
      const existing = notifications.find(n => 
        n.id === `anomaly-${anomaly.buoyId}-${anomaly.parameter}-${anomaly.timestamp.getTime()}`
      );
      
      if (!existing) {
        newNotifications.push({
          id: `anomaly-${anomaly.buoyId}-${anomaly.parameter}-${anomaly.timestamp.getTime()}`,
          type: anomaly.severity === 'critical' ? 'critical' : 'alert',
          title: `${anomaly.parameter.toUpperCase()} Anomaly Detected`,
          message: anomaly.description,
          timestamp: anomaly.timestamp,
          buoyId: anomaly.buoyId,
          buoyName: buoy?.name,
          priority: anomaly.severity === 'critical' ? 'critical' : 
                   anomaly.severity === 'high' ? 'high' : 'medium',
          category: 'water_quality',
          actionRequired: anomaly.severity === 'critical' || anomaly.severity === 'high',
          autoClose: false,
          data: anomaly,
          read: false,
          acknowledged: false
        });
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 20)); // Keep last 20 for performance
    }
  }, [insights, anomalies, buoys]);

  // System health notifications
  useEffect(() => {
    const checkSystemHealth = () => {
      const criticalBuoys = buoys.filter(b => b.status === 'critical').length;
      const warningBuoys = buoys.filter(b => b.status === 'warning').length;
      const totalAlerts = buoys.reduce((sum, b) => sum + b.alerts.length, 0);

      if (criticalBuoys > 2) {
        const existing = notifications.find(n => n.id === 'system-critical-multiple');
        if (!existing) {
          setNotifications(prev => [{
            id: 'system-critical-multiple',
            type: 'critical',
            title: 'Multiple Critical Sensors',
            message: `${criticalBuoys} sensors reporting critical conditions. Immediate attention required.`,
            timestamp: new Date(),
            priority: 'critical',
            category: 'system',
            actionRequired: true,
            autoClose: false,
            read: false,
            acknowledged: false
          }, ...prev]);
        }
      }

      if (totalAlerts > 10) {
        const existing = notifications.find(n => n.id === 'system-alert-surge');
        if (!existing) {
          setNotifications(prev => [{
            id: 'system-alert-surge',
            type: 'warning',
            title: 'High Alert Volume',
            message: `${totalAlerts} active alerts across the monitoring network. Review recommended.`,
            timestamp: new Date(),
            priority: 'medium',
            category: 'system',
            actionRequired: false,
            autoClose: true,
            duration: 30000,
            read: false,
            acknowledged: false
          }, ...prev]);
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [buoys, notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const acknowledge = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, acknowledged: true, read: true } : n)
    );
    
    const notification = notifications.find(n => n.id === id);
    if (notification && onNotificationAction) {
      onNotificationAction(notification, 'acknowledge');
    }
  }, [notifications, onNotificationAction]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'critical':
        return notifications.filter(n => n.priority === 'critical' || n.type === 'critical');
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.acknowledged).length;

  const getNotificationIcon = (type: string, category: string) => {
    switch (type) {
      case 'critical':
        return <Zap className="w-5 h-5 text-red-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'insight':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'water_quality':
        return <Activity className="w-4 h-4" />;
      case 'equipment':
        return <Shield className="w-4 h-4" />;
      case 'prediction':
        return <TrendingUp className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Auto-close notifications
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (notification.autoClose && notification.duration && !notification.read) {
        const timeout = setTimeout(() => {
          dismiss(notification.id);
        }, notification.duration);
        timeouts.push(timeout);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [notifications, dismiss]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`glass-card transition-all duration-300 ${
            criticalCount > 0 ? 'ring-2 ring-red-500 ring-opacity-50 animate-pulse' : ''
          }`}
        >
          <Bell className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Critical Alert Indicator */}
        {criticalCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"
          />
        )}
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="absolute top-12 right-0 w-96 max-h-96 glass-card border shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Filter Buttons */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  {['all', 'unread', 'critical'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-2 py-1 text-xs capitalize transition-colors ${
                        filter === f 
                          ? 'bg-green-100 text-green-800' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {getFilteredNotifications().length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  <AnimatePresence mode="popLayout">
                    {getFilteredNotifications().slice(0, 10).map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                          !notification.read 
                            ? getPriorityColor(notification.priority)
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                {getCategoryIcon(notification.category)}
                                <span className="text-xs text-gray-500">
                                  {notification.timestamp.toLocaleTimeString('en-ZA', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-current opacity-90 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.buoyName && (
                              <div className="flex items-center mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.buoyName}
                                </Badge>
                              </div>
                            )}
                            
                            {notification.actionRequired && !notification.acknowledged && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    acknowledge(notification.id);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Acknowledge
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismiss(notification.id);
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-current rounded-full opacity-60" />
                        )}

                        {/* Priority stripe */}
                        {notification.priority === 'critical' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {getFilteredNotifications().length > 10 && (
              <div className="p-3 border-t border-gray-200/50 text-center">
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  View all {getFilteredNotifications().length} notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications for Critical Alerts */}
      <AnimatePresence>
        {notifications
          .filter(n => n.priority === 'critical' && !n.read)
          .slice(0, 3)
          .map((notification, index) => (
            <motion.div
              key={`toast-${notification.id}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ type: "spring", delay: index * 0.1 }}
              className="fixed bottom-4 right-4 w-80 glass-card border-red-300 bg-red-50/90 backdrop-blur-sm shadow-elevated"
              style={{ bottom: `${4 + index * 90}px` }}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-red-900 text-sm">
                      CRITICAL: {notification.title}
                    </h4>
                    <p className="text-xs text-red-800 mt-1">
                      {notification.message}
                    </p>
                    {notification.buoyName && (
                      <p className="text-xs text-red-700 mt-1 font-medium">
                        Location: {notification.buoyName}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-red-700 hover:text-red-900"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acknowledge(notification.id)}
                    className="h-7 px-3 text-xs border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Acknowledge
                  </Button>
                  <Clock className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-700">
                    {notification.timestamp.toLocaleTimeString('en-ZA')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}