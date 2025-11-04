import React, { useState, useEffect, useRef } from 'react';
import { User, BuoyData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Bell, Plus, Trash2, AlertTriangle, Mail, Phone, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

export interface HyacinthThreshold {
  id: string;
  zone: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5' | 'overall';
  threshold: number; // percentage
  notifyEmail: boolean;
  notifyPhone: boolean;
  active: boolean;
  createdAt: string;
}

interface HyacinthThresholdAlertsProps {
  currentUser: User | null;
  buoys: BuoyData[];
  isGuestMode: boolean;
  onThresholdsUpdate?: (thresholds: HyacinthThreshold[]) => void;
}

export function HyacinthThresholdAlerts({ 
  currentUser, 
  buoys, 
  isGuestMode,
  onThresholdsUpdate 
}: HyacinthThresholdAlertsProps) {
  const [thresholds, setThresholds] = useState<HyacinthThreshold[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState({
    zone: 'overall' as HyacinthThreshold['zone'],
    threshold: 50,
    notifyEmail: true,
    notifyPhone: false,
  });
  const previousValuesRef = useRef<{ [key: string]: number }>({});
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  // Load thresholds from localStorage on mount
  useEffect(() => {
    if (currentUser && !isGuestMode) {
      const savedThresholds = localStorage.getItem(`hyacinth_thresholds_${currentUser.id}`);
      if (savedThresholds) {
        try {
          const parsed = JSON.parse(savedThresholds);
          setThresholds(parsed);
        } catch (e) {
          console.error('Failed to parse saved thresholds:', e);
        }
      }
    }
  }, [currentUser, isGuestMode]);

  // Save thresholds to localStorage whenever they change
  useEffect(() => {
    if (currentUser && !isGuestMode && thresholds.length > 0) {
      localStorage.setItem(`hyacinth_thresholds_${currentUser.id}`, JSON.stringify(thresholds));
      if (onThresholdsUpdate) {
        onThresholdsUpdate(thresholds);
      }
    }
  }, [thresholds, currentUser, isGuestMode, onThresholdsUpdate]);

  // Monitor buoy data and trigger alerts when thresholds are exceeded
  useEffect(() => {
    if (isGuestMode || !currentUser || thresholds.length === 0) {
      return;
    }

    thresholds.forEach(threshold => {
      if (!threshold.active) return;

      // Calculate current hyacinth level for the zone
      const zoneBuoys = threshold.zone === 'overall' 
        ? buoys 
        : buoys.filter(b => b.zone === threshold.zone);

      if (zoneBuoys.length === 0) return;

      const currentLevel = zoneBuoys.reduce((acc, b) => acc + (b.sensors.hyacinth || 0), 0) / zoneBuoys.length;
      const zoneKey = `${threshold.id}-${threshold.zone}`;
      const previousLevel = previousValuesRef.current[zoneKey];

      // Check if threshold is exceeded
      if (currentLevel >= threshold.threshold) {
        // Only trigger alert if:
        // 1. We haven't triggered this alert before in this session, OR
        // 2. The level has crossed the threshold from below (rising edge)
        const shouldTrigger = 
          !triggeredAlertsRef.current.has(zoneKey) || 
          (previousLevel !== undefined && previousLevel < threshold.threshold);

        if (shouldTrigger) {
          sendThresholdAlert(threshold, currentLevel, currentUser);
          triggeredAlertsRef.current.add(zoneKey);

          // Clear the alert flag after 30 minutes to allow re-triggering
          setTimeout(() => {
            triggeredAlertsRef.current.delete(zoneKey);
          }, 1800000); // 30 minutes
        }
      } else {
        // Reset the trigger if level drops below threshold
        triggeredAlertsRef.current.delete(zoneKey);
      }

      // Store current value for next comparison
      previousValuesRef.current[zoneKey] = currentLevel;
    });
  }, [buoys, thresholds, currentUser, isGuestMode]);

  const addThreshold = () => {
    if (isGuestMode) {
      toast.error('Guest Mode', {
        description: 'Please log in to set up custom alerts.'
      });
      return;
    }

    if (!currentUser) {
      toast.error('Not Logged In', {
        description: 'Please log in to set up custom alerts.'
      });
      return;
    }

    // Validate inputs
    if (newThreshold.threshold < 1 || newThreshold.threshold > 100) {
      toast.error('Invalid Threshold', {
        description: 'Threshold must be between 1% and 100%.'
      });
      return;
    }

    if (!newThreshold.notifyEmail && !newThreshold.notifyPhone) {
      toast.error('No Notification Method', {
        description: 'Please select at least one notification method (Email or Phone).'
      });
      return;
    }

    // Check if threshold already exists for this zone
    const existing = thresholds.find(t => t.zone === newThreshold.zone && t.active);
    if (existing) {
      toast.warning('Threshold Already Exists', {
        description: `You already have an active threshold for ${getZoneName(newThreshold.zone)}. Please delete it first or modify the existing one.`
      });
      return;
    }

    const threshold: HyacinthThreshold = {
      id: `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      zone: newThreshold.zone,
      threshold: newThreshold.threshold,
      notifyEmail: newThreshold.notifyEmail,
      notifyPhone: newThreshold.notifyPhone,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setThresholds(prev => [...prev, threshold]);
    setIsDialogOpen(false);

    toast.success('Threshold Alert Created', {
      description: `You will be notified when ${getZoneName(threshold.zone)} exceeds ${threshold.threshold}%.`,
      duration: 5000,
    });

    // Reset form
    setNewThreshold({
      zone: 'overall',
      threshold: 50,
      notifyEmail: true,
      notifyPhone: false,
    });
  };

  const toggleThreshold = (id: string) => {
    setThresholds(prev =>
      prev.map(t => t.id === id ? { ...t, active: !t.active } : t)
    );

    const threshold = thresholds.find(t => t.id === id);
    if (threshold) {
      toast.info(threshold.active ? 'Alert Deactivated' : 'Alert Activated', {
        description: `Threshold alert for ${getZoneName(threshold.zone)} has been ${threshold.active ? 'deactivated' : 'activated'}.`
      });
    }
  };

  const deleteThreshold = (id: string) => {
    const threshold = thresholds.find(t => t.id === id);
    setThresholds(prev => prev.filter(t => t.id !== id));

    if (threshold) {
      toast.success('Threshold Deleted', {
        description: `Alert for ${getZoneName(threshold.zone)} has been removed.`
      });
    }
  };

  const getZoneName = (zone: HyacinthThreshold['zone']) => {
    const names = {
      zone1: 'Zone 1 - North',
      zone2: 'Zone 2 - Northeast',
      zone3: 'Zone 3 - Central',
      zone4: 'Zone 4 - West',
      zone5: 'Zone 5 - South',
      overall: 'Overall Coverage'
    };
    return names[zone];
  };

  const getCurrentLevel = (zone: HyacinthThreshold['zone']) => {
    const zoneBuoys = zone === 'overall' 
      ? buoys 
      : buoys.filter(b => b.zone === zone);

    if (zoneBuoys.length === 0) return 0;
    return zoneBuoys.reduce((acc, b) => acc + (b.sensors.hyacinth || 0), 0) / zoneBuoys.length;
  };

  return (
    <Card className="glass-card border-0 shadow-professional">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-600" />
            <span>Custom Threshold Alerts</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                disabled={isGuestMode}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Threshold Alert</DialogTitle>
                <DialogDescription>
                  Set up a custom alert to be notified when hyacinth coverage exceeds your specified threshold.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Zone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Select
                    value={newThreshold.zone}
                    onValueChange={(value) => setNewThreshold(prev => ({ ...prev, zone: value as HyacinthThreshold['zone'] }))}
                  >
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall Coverage</SelectItem>
                      <SelectItem value="zone1">Zone 1 - North</SelectItem>
                      <SelectItem value="zone2">Zone 2 - Northeast</SelectItem>
                      <SelectItem value="zone3">Zone 3 - Central</SelectItem>
                      <SelectItem value="zone4">Zone 4 - West</SelectItem>
                      <SelectItem value="zone5">Zone 5 - South</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Threshold Input */}
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold (%)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="100"
                    value={newThreshold.threshold}
                    onChange={(e) => setNewThreshold(prev => ({ 
                      ...prev, 
                      threshold: parseInt(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-gray-500">
                    You'll be notified when hyacinth coverage reaches or exceeds this percentage.
                  </p>
                </div>

                {/* Notification Methods */}
                <div className="space-y-3">
                  <Label>Notification Methods</Label>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm">Email Notification</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                    </div>
                    <Switch
                      checked={newThreshold.notifyEmail}
                      onCheckedChange={(checked) => setNewThreshold(prev => ({ 
                        ...prev, 
                        notifyEmail: checked 
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-sm">SMS Notification</p>
                        <p className="text-xs text-gray-500">{currentUser?.phone}</p>
                      </div>
                    </div>
                    <Switch
                      checked={newThreshold.notifyPhone}
                      onCheckedChange={(checked) => setNewThreshold(prev => ({ 
                        ...prev, 
                        notifyPhone: checked 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={addThreshold}
                >
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isGuestMode && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Guest users cannot set up custom alerts. Please log in to enable this feature.
            </p>
          </div>
        )}

        {thresholds.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm text-gray-700 mb-1">No Threshold Alerts</h3>
            <p className="text-xs text-gray-500 mb-4">
              Create custom alerts to be notified when hyacinth coverage exceeds specific thresholds.
            </p>
            {!isGuestMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {thresholds.map(threshold => {
                const currentLevel = getCurrentLevel(threshold.zone);
                const isExceeded = currentLevel >= threshold.threshold;
                const progressPercentage = Math.min((currentLevel / threshold.threshold) * 100, 100);

                return (
                  <motion.div
                    key={threshold.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isExceeded
                        ? 'border-red-300 bg-red-50'
                        : threshold.active
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm">{getZoneName(threshold.zone)}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isExceeded 
                                ? 'bg-red-100 text-red-800 border-red-300' 
                                : threshold.active
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {threshold.active ? (isExceeded ? 'EXCEEDED' : 'Active') : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          Alert when coverage ≥ {threshold.threshold}%
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleThreshold(threshold.id)}
                          className="h-8 w-8 p-0"
                          title={threshold.active ? 'Deactivate' : 'Activate'}
                        >
                          {threshold.active ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteThreshold(threshold.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Current Level vs Threshold */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Current Level</span>
                        <span className={`font-medium ${
                          isExceeded ? 'text-red-700' : 'text-gray-900'
                        }`}>
                          {currentLevel.toFixed(1)}% / {threshold.threshold}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            isExceeded ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        />
                      </div>

                      {/* Notification Methods */}
                      <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                        {threshold.notifyEmail && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </div>
                        )}
                        {threshold.notifyPhone && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>SMS</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function sendThresholdAlert(threshold: HyacinthThreshold, currentLevel: number, user: User) {
  const notificationMethods = [];
  
  if (threshold.notifyEmail) {
    notificationMethods.push('email');
  }
  if (threshold.notifyPhone) {
    notificationMethods.push('SMS');
  }

  const methodsText = notificationMethods.length > 0 
    ? notificationMethods.join(' and ')
    : 'notification';

  const zoneName = {
    zone1: 'Zone 1 - North',
    zone2: 'Zone 2 - Northeast',
    zone3: 'Zone 3 - Central',
    zone4: 'Zone 4 - West',
    zone5: 'Zone 5 - South',
    overall: 'Overall Coverage'
  }[threshold.zone];

  toast.warning(
    `Threshold Alert: ${zoneName}`,
    {
      description: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="font-medium">Hyacinth Coverage Threshold Exceeded</span>
          </div>
          <p className="text-sm">
            Current level: <strong>{currentLevel.toFixed(1)}%</strong>
          </p>
          <p className="text-sm">
            Your threshold: <strong>{threshold.threshold}%</strong>
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t">
            {threshold.notifyEmail && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>Email sent</span>
              </div>
            )}
            {threshold.notifyPhone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>SMS sent</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 italic">
            Notification sent via {methodsText} to {user.email}
          </p>
        </div>
      ),
      duration: 10000,
    }
  );

  // In a real application, this would trigger actual email/SMS notifications
  console.log(`[THRESHOLD ALERT] Hyacinth threshold exceeded for ${zoneName}:`, {
    zone: threshold.zone,
    threshold: threshold.threshold,
    currentLevel: currentLevel.toFixed(1),
    user: user.email,
    notifyEmail: threshold.notifyEmail,
    notifyPhone: threshold.notifyPhone,
    phoneNumber: user.phone,
    timestamp: new Date().toISOString()
  });
}
