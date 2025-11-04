import React, { useEffect, useRef } from 'react';
import { BuoyData, User } from '../App';
import { toast } from 'sonner@2.0.3';
import { AlertTriangle, Mail, Phone, Zap } from 'lucide-react';

interface StatusAlertSystemProps {
  buoys: BuoyData[];
  currentUser: User | null;
  isGuestMode: boolean;
}

export function StatusAlertSystem({ buoys, currentUser, isGuestMode }: StatusAlertSystemProps) {
  const previousStatusRef = useRef<{ [key: string]: 'good' | 'warning' | 'critical' }>({});
  const alertedBuoysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Don't send alerts in guest mode or if user hasn't enabled notifications
    if (isGuestMode || !currentUser) {
      return;
    }

    buoys.forEach(buoy => {
      const currentStatus = buoy.status;
      const previousStatus = previousStatusRef.current[buoy.id];

      // If we have a previous status, check for status changes
      if (previousStatus !== undefined && previousStatus !== currentStatus) {
        // Detect status degradation
        const statusPriority = { good: 0, warning: 1, critical: 2 };
        const hasWorsened = statusPriority[currentStatus] > statusPriority[previousStatus];

        if (hasWorsened) {
          // Only alert once per buoy per session for each status level
          const alertKey = `${buoy.id}-${currentStatus}`;
          if (!alertedBuoysRef.current.has(alertKey)) {
            sendStatusAlert(buoy, previousStatus, currentStatus, currentUser);
            alertedBuoysRef.current.add(alertKey);
            
            // Clear the alert flag after 2 hours to allow new alerts
            setTimeout(() => {
              alertedBuoysRef.current.delete(alertKey);
            }, 7200000); // 2 hours
          }
        }
      }

      // Store current status for next comparison
      previousStatusRef.current[buoy.id] = currentStatus;
    });
  }, [buoys, currentUser, isGuestMode]);

  return null; // This is a logic-only component
}

function sendStatusAlert(
  buoy: BuoyData, 
  previousStatus: 'good' | 'warning' | 'critical',
  currentStatus: 'good' | 'warning' | 'critical',
  user: User
) {
  const notificationMethods = [];
  
  if (user.notificationPreferences?.email) {
    notificationMethods.push('email');
  }
  if (user.notificationPreferences?.phone) {
    notificationMethods.push('SMS');
  }

  const methodsText = notificationMethods.length > 0 
    ? notificationMethods.join(' and ')
    : 'notification';

  // Determine alert severity and icon
  const isCritical = currentStatus === 'critical';
  const isWarning = currentStatus === 'warning';

  // Get primary alert from buoy
  const primaryAlert = buoy.alerts.length > 0 ? buoy.alerts[0] : 'Status has changed';

  // Send appropriate toast notification
  const toastFn = isCritical ? toast.error : toast.warning;
  
  toastFn(
    isCritical ? `CRITICAL ALERT: ${buoy.name}` : `WARNING: ${buoy.name}`,
    {
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isCritical ? (
              <Zap className="w-4 h-4 text-red-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <span className="font-medium">
              Status changed from {previousStatus.toUpperCase()} to {currentStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-sm">
            {primaryAlert}
          </p>
          {buoy.alerts.length > 1 && (
            <p className="text-xs text-gray-600">
              +{buoy.alerts.length - 1} more alert{buoy.alerts.length - 1 > 1 ? 's' : ''}
            </p>
          )}
          <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t">
            {user.notificationPreferences?.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email sent to {user.email}</span>
              </div>
            )}
            {user.notificationPreferences?.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>SMS sent</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 italic">
            Alert notification sent via {methodsText}
          </p>
        </div>
      ),
      duration: isCritical ? 10000 : 8000,
    }
  );

  // Log the email that would be sent
  console.log(`[EMAIL ALERT] Status Change Notification`, {
    recipient: user.email,
    recipientName: user.name,
    subject: isCritical 
      ? `CRITICAL ALERT: ${buoy.name} - Immediate Action Required`
      : `WARNING: ${buoy.name} - Attention Needed`,
    buoyId: buoy.id,
    buoyName: buoy.name,
    previousStatus,
    currentStatus,
    zone: buoy.zone,
    alerts: buoy.alerts,
    timestamp: new Date().toISOString(),
    notifyEmail: user.notificationPreferences?.email,
    notifyPhone: user.notificationPreferences?.phone,
    phoneNumber: user.phone,
    emailBody: `
Dear ${user.name},

This is an automated alert from the Hartbeespoort Dam Monitoring System.

${isCritical ? '⚠️ CRITICAL ALERT - IMMEDIATE ACTION REQUIRED ⚠️' : '⚡ WARNING - ATTENTION NEEDED ⚡'}

Sensor: ${buoy.name}
Zone: ${buoy.zone.replace('zone', 'Zone ')}
Status Change: ${previousStatus.toUpperCase()} → ${currentStatus.toUpperCase()}
Time: ${buoy.lastUpdate}

Alert Details:
${buoy.alerts.map((alert, i) => `${i + 1}. ${alert}`).join('\n')}

Current Sensor Readings:
- Dissolved Oxygen: ${buoy.sensors.do} mg/L
- pH Level: ${buoy.sensors.ph}
- Total Suspended Solids: ${buoy.sensors.tss} mg/L
- Temperature: ${buoy.sensors.temperature}°C
- Water Hyacinth Coverage: ${buoy.sensors.hyacinth}%

${isCritical ? 'IMMEDIATE ACTION REQUIRED: Please investigate and respond to this critical situation as soon as possible.' : 'Please review this situation and take appropriate action.'}

You can view detailed information and take action through the Harties Action monitoring portal.

Best regards,
Harties Action Monitoring System
Hartbeespoort Dam Management
    `.trim()
  });

  // In a real application, this would trigger actual email/SMS notifications via a backend API
  // For example:
  // await fetch('/api/send-alert', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     userId: user.id,
  //     buoyId: buoy.id,
  //     alertType: currentStatus,
  //     channels: notificationMethods
  //   })
  // });
}
