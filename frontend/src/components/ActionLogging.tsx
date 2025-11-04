import React, { useState, useRef, useEffect } from 'react';
import { Page, BuoyData, ActionLog } from '../App';
import { MobileLayout } from './MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { History, Download, ChevronDown, ChevronUp, User, MapPin, Calendar, FileText, X } from 'lucide-react';

interface ActionLoggingProps {
  buoys: BuoyData[];
  actionLogs: ActionLog[];
  onAddLog: (log: Omit<ActionLog, 'id'>) => void;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentUser?: any | null;
  isGuestMode?: boolean;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export function ActionLogging({ 
  buoys, 
  actionLogs, 
  onAddLog, 
  onNavigate, 
  onLogout,
  currentUser,
  isGuestMode = false,
  onToggleDarkMode,
  isDarkMode = false 
}: ActionLoggingProps) {
  const [formData, setFormData] = useState({
    buoyId: '',
    action: [] as string[],
    category: 'maintenance' as 'maintenance' | 'calibration' | 'inspection' | 'alert' | 'system',
    details: '',
    user: currentUser?.name || 'Guest User',
    timestamp: new Date().toLocaleString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  
  // Refs for scrolling to error fields and success message
  const buoyIdRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const topOfPageRef = useRef<HTMLDivElement>(null);

  // Update username when currentUser changes or when form is shown
  React.useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      user: currentUser?.name || 'Guest User'
    }));
  }, [currentUser, showLogForm]);

  // Check for preselected buoy on mount
  React.useEffect(() => {
    const preselectedBuoyId = localStorage.getItem('preselectedBuoyId');
    if (preselectedBuoyId) {
      setFormData(prev => ({ ...prev, buoyId: preselectedBuoyId }));
      setShowLogForm(true);
      // Clear the preselection after using it
      localStorage.removeItem('preselectedBuoyId');
    }
  }, []);

  const actionTypes = [
    'Water Treatment',
    'Manual Removal',
    'Equipment Maintenance',
    'Sensor Calibration',
    'Algae Management',
    'Debris Cleanup',
    'System Check',
    'Emergency Response'
  ];

  const categories: Array<'maintenance' | 'calibration' | 'inspection' | 'alert' | 'system'> = [
    'maintenance',
    'calibration',
    'inspection',
    'alert',
    'system'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors: {[key: string]: boolean} = {};
    
    if (!formData.buoyId) errors.buoyId = true;
    if (formData.action.length === 0) errors.action = true;
    if (!formData.category) errors.category = true;
    if (!formData.details.trim()) errors.details = true;
    
    // If there are errors, scroll to first error and highlight
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to first error field
      if (errors.buoyId && buoyIdRef.current) {
        buoyIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.action && actionRef.current) {
        actionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.category && categoryRef.current) {
        categoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.details && detailsRef.current) {
        detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Simulate API call with timeout protection
      await Promise.race([
        new Promise(resolve => setTimeout(resolve, 1000)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      // Convert action array to string for logging
      const logData = {
        ...formData,
        action: formData.action.join(', ')
      };

      onAddLog(logData);
      
      setShowSuccess(true);
      
      // Scroll to top to show success message
      if (topOfPageRef.current) {
        topOfPageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Reset form
      setFormData({
        buoyId: '',
        action: [],
        category: 'maintenance',
        details: '',
        user: currentUser?.name || 'Guest User',
        timestamp: new Date().toLocaleString()
      });

      // Hide success message after 3 seconds and return to history view
      setTimeout(() => {
        setShowSuccess(false);
        setShowLogForm(false);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      // Still allow form submission even if timeout occurs
      const logData = {
        ...formData,
        action: formData.action.join(', ')
      };
      onAddLog(logData);
      setShowSuccess(true);
      // Scroll to top to show success message
      if (topOfPageRef.current) {
        topOfPageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        setShowSuccess(false);
        setShowLogForm(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };
  
  const handleActionToggle = (actionType: string) => {
    setFormData(prev => {
      const currentActions = prev.action;
      const newActions = currentActions.includes(actionType)
        ? currentActions.filter(a => a !== actionType)
        : [...currentActions, actionType];
      return { ...prev, action: newActions };
    });
    // Clear validation error when user selects an action
    if (validationErrors.action) {
      setValidationErrors(prev => ({ ...prev, action: false }));
    }
  };
  
  const removeAction = (actionType: string) => {
    setFormData(prev => ({
      ...prev,
      action: prev.action.filter(a => a !== actionType)
    }));
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setIsActionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <MobileLayout 
      currentPage="logging" 
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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl text-[rgba(45,80,22,1)]">
                {showLogForm ? 'Log New Action' : 'Action Log History'}
              </h1>
              <p className="text-[rgba(92,107,92,1)] text-sm md:text-base">
                {showLogForm ? 'Record interventions and maintenance activities' : 'View all recorded actions and activities'}
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start md:self-auto">
              {showLogForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowLogForm(false)}
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to History
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowLogForm(true)}
                  className="flex items-center gradient-primary text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Log New Action
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            {/* Scroll target for top of page */}
            <div ref={topOfPageRef} />
            
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800">Action logged successfully!</p>
                </div>
              </div>
            )}

            {showLogForm ? (
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Log New Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Buoy Selection */}
                  <div className="space-y-2" ref={buoyIdRef}>
                    <Label htmlFor="buoy" className="flex items-center">
                      Monitoring Point / Zone
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.buoyId} 
                      onValueChange={(value) => handleInputChange('buoyId', value)}
                    >
                      <SelectTrigger 
                        className={`bg-gray-50/80 ${validationErrors.buoyId ? 'border-2 border-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Select a buoy or zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {buoys.map((buoy) => (
                          <SelectItem key={buoy.id} value={buoy.id}>
                            {buoy.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="general">General Dam Area</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.buoyId && (
                      <p className="text-sm text-red-500">Please select a monitoring point or zone</p>
                    )}
                  </div>

                  {/* Action Type - Multiple Selection Dropdown */}
                  <div className="space-y-2" ref={actionRef}>
                    <Label htmlFor="action" className="flex items-center">
                      Action Type
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    
                    {/* Multi-Select Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2 bg-gray-50/80 border rounded-lg text-left transition-colors hover:bg-gray-100/80 ${
                          validationErrors.action ? 'border-2 border-red-500' : 'border-gray-200'
                        }`}
                      >
                        <span className="flex-1">
                          {formData.action.length === 0 ? (
                            <span className="text-gray-500">Select action types</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {formData.action.map((action) => (
                                <Badge 
                                  key={action}
                                  variant="secondary"
                                  className="bg-green-600 text-white text-xs flex items-center gap-1 pr-1"
                                >
                                  {action}
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeAction(action);
                                    }}
                                    className="ml-0.5 hover:bg-green-800 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeAction(action);
                                      }
                                    }}
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </span>
                        <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Content */}
                      {isActionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {actionTypes.map((type) => (
                              <label
                                key={type}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                                  formData.action.includes(type) ? 'bg-green-50' : ''
                                }`}
                              >
                                <Checkbox
                                  id={`action-${type}`}
                                  checked={formData.action.includes(type)}
                                  onCheckedChange={() => handleActionToggle(type)}
                                />
                                <span className="text-sm flex-1 select-none">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {validationErrors.action && (
                      <p className="text-sm text-red-500">Please select at least one action type</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2" ref={categoryRef}>
                    <Label htmlFor="category" className="flex items-center">
                      Category
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: any) => handleInputChange('category', value)}
                    >
                      <SelectTrigger 
                        className={`bg-gray-50/80 ${validationErrors.category ? 'border-2 border-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-500">Please select a category</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2" ref={detailsRef}>
                    <Label htmlFor="details" className="flex items-center">
                      Description
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="details"
                      placeholder="Describe the action taken, materials used, observations, etc."
                      value={formData.details}
                      onChange={(e) => handleInputChange('details', e.target.value)}
                      rows={4}
                      className={`resize-none bg-gray-50/80 ${validationErrors.details ? 'border-2 border-red-500' : ''}`}
                    />
                    {validationErrors.details && (
                      <p className="text-sm text-red-500">Please provide a description</p>
                    )}
                  </div>

                  {/* User (read-only for now) */}
                  <div className="space-y-2">
                    <Label htmlFor="user" className="flex items-center">
                      Logged by
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="user"
                      value={formData.user}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  {/* Image Upload (placeholder) */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Attach Image (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-white" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Saving Action...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Action Log
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            ) : (
              /* Action History View */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <History className="w-5 h-5 mr-2 text-blue-600" />
                      All Action Logs
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {actionLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg mb-2">No actions logged yet</p>
                        <p className="text-gray-400 text-sm mb-4">Start logging your maintenance activities and interventions</p>
                        <Button onClick={() => setShowLogForm(true)} className="gradient-primary text-white">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Log Your First Action
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {actionLogs.slice().reverse().map((log) => {
                            const buoy = buoys.find(b => b.id === log.buoyId);
                            const isExpanded = expandedLogId === log.id;
                            
                            return (
                              <div 
                                key={log.id}
                                className={`border rounded-lg transition-all duration-200 ${
                                  isExpanded 
                                    ? 'border-green-300 bg-green-50/30 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                              >
                                {/* Clickable Header */}
                                <button
                                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                  className="w-full p-4 flex items-center justify-between text-left"
                                >
                                  <div className="flex-1 space-y-2">
                                    {/* Top Row: Action and Badge */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <Badge variant={
                                          log.category === 'maintenance' ? 'default' :
                                          log.category === 'alert' ? 'destructive' :
                                          log.category === 'calibration' ? 'default' :
                                          log.category === 'inspection' ? 'secondary' :
                                          'secondary'
                                        } className="capitalize">
                                          {log.category}
                                        </Badge>
                                        <h4 className="font-semibold text-gray-900">{log.action}</h4>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                                        {isExpanded ? (
                                          <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                          <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Bottom Row: Summary Info */}
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{log.user}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{buoy?.name || 'Unknown'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                
                                {/* Expandable Details Section */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 border-t border-gray-200">
                                    <div className="pt-4 space-y-3">
                                      {/* Full Details */}
                                      <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                          <FileText className="w-4 h-4 text-gray-600" />
                                          <h5 className="text-sm font-semibold text-gray-700">Details</h5>
                                        </div>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                          {log.details}
                                        </p>
                                      </div>
                                      
                                      {/* Additional Info Grid */}
                                      <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-500">Timestamp</span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">{log.timestamp}</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <User className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-500">Logged By</span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">{log.user}</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-500">Location</span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">{buoy?.name || 'Unknown'}</p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <FileText className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-500">Category</span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900 capitalize">{log.category}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // Export action logs as CSV
                            const csv = [
                              ['Timestamp', 'User', 'Action', 'Buoy', 'Category', 'Details'].join(','),
                              ...actionLogs.map(log => {
                                const buoy = buoys.find(b => b.id === log.buoyId);
                                return [
                                  `"${log.timestamp}"`,
                                  `"${log.user}"`,
                                  `"${log.action}"`,
                                  `"${buoy?.name || 'Unknown'}"`,
                                  log.category,
                                  `"${log.details}"`
                                ].join(',');
                              })
                            ].join('\n');
                            
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `action_logs_${new Date().toISOString().split('T')[0]}.csv`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export History as CSV
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guidelines - Only show when in log form view */}
            {showLogForm && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Logging Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Be specific about the location and nature of the intervention</p>
                <p>• Include quantities of materials used (chemicals, equipment, etc.)</p>
                <p>• Note any observations about water conditions before and after</p>
                <p>• Upload photos when possible to document the action</p>
                <p>• Record any equipment issues or maintenance needs discovered</p>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}