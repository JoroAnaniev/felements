import React, { useState } from 'react';
import { User, Page } from '../App';
import { MobileLayout } from './MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { User as UserIcon, Mail, Building, Briefcase, Phone, MapPin, Save, X, Shield, Bell, Leaf, AlertTriangle } from 'lucide-react';

interface ProfileScreenProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

export function ProfileScreen({ user, onUpdateUser, onNavigate, onLogout, onToggleDarkMode, isDarkMode }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user || {
    id: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    role: 'Viewer',
    createdAt: '',
    notificationPreferences: {
      email: true,
      phone: false,
      hyacinthAlerts: true
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (field: 'email' | 'phone' | 'hyacinthAlerts') => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences!,
        [field]: !prev.notificationPreferences?.[field]
      }
    }));
  };

  const handleSave = () => {
    if (user) {
      onUpdateUser(formData);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData(user || formData);
    setIsEditing(false);
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <MobileLayout 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        currentPage="profile"
        currentUser={user}
        isGuestMode={true}
        onToggleDarkMode={onToggleDarkMode}
        isDarkMode={isDarkMode}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-8">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3>No Profile Available</h3>
              <p className="text-gray-600 mt-2">Please log in to access your profile.</p>
              <Button 
                onClick={() => onNavigate('login')} 
                className="mt-4"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      onNavigate={onNavigate} 
      onLogout={onLogout}
      currentPage="profile"
      currentUser={user}
      isGuestMode={false}
      onToggleDarkMode={onToggleDarkMode}
      isDarkMode={isDarkMode}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600 mt-1">View and manage your account information</p>
              </div>
              <Button
                variant="outline"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Profile updated successfully!</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="glass-card">
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{formData.name}</h3>
                      <p className="text-gray-600">{formData.role}</p>
                    </div>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "outline" : "default"}
                      className="w-full"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-green-600" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Information */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-green-600" />
                    <span>Organization Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Organization</Label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{formData.organization}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Contact admin to change</p>
                      </div>
                    </div>
                    <div>
                      <Label>Role/Position</Label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{formData.role}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.organization === 'Hartbeespoort Local' 
                            ? 'Fixed role for Hartbeespoort Local users' 
                            : 'Contact admin to change'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <Label htmlFor="email-notif" className="cursor-pointer">Email Notifications</Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Receive alerts and updates via email at {formData.email}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="email-notif"
                        checked={formData.notificationPreferences?.email ?? true}
                        onCheckedChange={() => handleNotificationToggle('email')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <Label htmlFor="phone-notif" className="cursor-pointer">SMS Notifications</Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Receive critical alerts via SMS at {formData.phone}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="phone-notif"
                        checked={formData.notificationPreferences?.phone ?? false}
                        onCheckedChange={() => handleNotificationToggle('phone')}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <Label htmlFor="hyacinth-notif" className="cursor-pointer">Water Hyacinth Alerts</Label>
                          <p className="text-xs text-gray-500 mt-1">
                            Get early warnings when hyacinth levels increase
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="hyacinth-notif"
                        checked={formData.notificationPreferences?.hyacinthAlerts ?? true}
                        onCheckedChange={() => handleNotificationToggle('hyacinthAlerts')}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">Email Alert System Active</p>
                        <p>You will receive email notifications at <span className="font-medium">{formData.email}</span> when:</p>
                        <ul className="mt-1 ml-4 list-disc space-y-0.5">
                          <li>Sensor status changes to WARNING or CRITICAL</li>
                          <li>Water hyacinth levels increase (if enabled)</li>
                          <li>Any buoy requires immediate attention</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save/Cancel Actions */}
              {isEditing && (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}