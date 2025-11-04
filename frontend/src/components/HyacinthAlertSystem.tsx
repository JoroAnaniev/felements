import React, { useEffect, useRef } from 'react';
import { BuoyData, User } from '../App';
import { toast } from 'sonner@2.0.3';
import { Leaf, AlertTriangle, Mail, Phone } from 'lucide-react';

interface HyacinthAlertSystemProps {
  buoys: BuoyData[];
  currentUser: User | null;
  isGuestMode: boolean;
}

export function HyacinthAlertSystem({ buoys, currentUser, isGuestMode }: HyacinthAlertSystemProps) {
  const previousValuesRef = useRef<{ [key: string]: number }>({});
  const alertedBuoysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Don't send alerts in guest mode or if user hasn't enabled hyacinth alerts
    if (isGuestMode || !currentUser?.notificationPreferences?.hyacinthAlerts) {
      return;
    }

    buoys.forEach(buoy => {
      const currentHyacinth = buoy.sensors.hyacinth || 0;
      const previousHyacinth = previousValuesRef.current[buoy.id];

      // If we have a previous value, check for increases
      if (previousHyacinth !== undefined) {
        const increase = currentHyacinth - previousHyacinth;
        
        // Alert on any increase >= 2% (slight increase)
        if (increase >= 2) {
          // Only alert once per buoy per session to avoid spam
          if (!alertedBuoysRef.current.has(buoy.id)) {
            sendHyacinthAlert(buoy, increase, currentUser);
            alertedBuoysRef.current.add(buoy.id);
            
            // Clear the alert flag after 1 hour to allow new alerts
            setTimeout(() => {
              alertedBuoysRef.current.delete(buoy.id);
            }, 3600000); // 1 hour
          }
        }
        
        // Critical level alerts (always send)
        if (currentHyacinth >= 60 && previousHyacinth < 60) {
          sendCriticalHyacinthAlert(buoy, currentUser);
        }
      }

      // Store current value for next comparison
      previousValuesRef.current[buoy.id] = currentHyacinth;
    });
  }, [buoys, currentUser, isGuestMode]);

  return null; // This is a logic-only component
}

function sendHyacinthAlert(buoy: BuoyData, increase: number, user: User) {
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

  toast.warning(
    `Water Hyacinth Increase Detected`,
    {
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-amber-600" />
            <span className="font-medium">{buoy.name}</span>
          </div>
          <p className="text-sm">
            Hyacinth coverage increased by {increase.toFixed(1)}% to {buoy.sensors.hyacinth?.toFixed(1)}%
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t">
            {user.notificationPreferences?.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email sent</span>
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
            Early warning notification sent via {methodsText}
          </p>
        </div>
      ),
      duration: 8000,
    }
  );

  // In a real application, this would trigger actual email/SMS notifications
  console.log(`[ALERT] Hyacinth increase detected at ${buoy.name}:`, {
    buoyId: buoy.id,
    increase: increase.toFixed(1),
    currentLevel: buoy.sensors.hyacinth?.toFixed(1),
    user: user.email,
    notifyEmail: user.notificationPreferences?.email,
    notifyPhone: user.notificationPreferences?.phone,
    phoneNumber: user.phone
  });
}

function sendCriticalHyacinthAlert(buoy: BuoyData, user: User) {
  toast.error(
    `CRITICAL: Hyacinth Infestation`,
    {
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="font-medium">{buoy.name}</span>
          </div>
          <p className="text-sm">
            Critical hyacinth level reached: {buoy.sensors.hyacinth?.toFixed(1)}%
          </p>
          <p className="text-sm font-medium text-red-600">
            Immediate intervention required!
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t">
            {user.notificationPreferences?.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email sent</span>
              </div>
            )}
            {user.notificationPreferences?.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>SMS sent</span>
              </div>
            )}
          </div>
        </div>
      ),
      duration: 10000,
    }
  );

  console.log(`[CRITICAL ALERT] Critical hyacinth level at ${buoy.name}:`, {
    buoyId: buoy.id,
    level: buoy.sensors.hyacinth?.toFixed(1),
    user: user.email,
    notifyEmail: user.notificationPreferences?.email,
    notifyPhone: user.notificationPreferences?.phone,
    phoneNumber: user.phone
  });
}
