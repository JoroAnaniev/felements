import React, { useState, useEffect } from 'react';
import { MainDashboard } from './components/MainDashboard';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ActionLogging } from './components/ActionLogging';
import { Reports } from './components/Reports';
import { FullscreenMap } from './components/FullscreenMap';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { DataSimulationEngine, SimulationConfig } from './components/DataSimulationEngine';
import { toast } from "sonner@2.0.3";

// Types
export type Page = 'login' | 'register' | 'dashboard' | 'logging' | 'reports' | 'fullscreen-map' | 'analytics' | 'profile';
export type UserRole = 'Manager' | 'Engineer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  organization: string;
  role: UserRole;
  createdAt: string;
  notificationPreferences?: {
    email: boolean;
    phone: boolean;
    hyacinthAlerts: boolean;
  };
}

export interface BuoyData {
  id: string;
  name: string;
  zone: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5';
  location: { x: number; y: number };
  status: 'good' | 'warning' | 'critical';
  sensors: {
    tss: number;
    do: number;
    phosphate: number;
    ph: number;
    temperature: number;
    hyacinth?: number; // Water hyacinth coverage percentage (0-100)
    nitrogen?: number; // Total nitrogen (mg/L)
    nitrate?: number; // Nitrate levels (mg/L)
    ammonia?: number; // Ammonia levels (mg/L)
  };
  lastUpdate: string;
  alerts: string[];
  historicalData?: {
    date: string;
    hyacinth: number;
    interventions?: string[];
  }[];
}

export interface ActionLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  buoyId: string;
  details: string;
  category: 'maintenance' | 'calibration' | 'inspection' | 'alert' | 'system';
}

// Initial buoy data - Permanent positions set on Hartbeespoort Dam
const initialBuoys: BuoyData[] = [
  {
    id: 'buoy-1',
    name: 'North Sensor',
    zone: 'zone1',
    location: { x: 55.6, y: 24.2 },
    status: 'good',
    sensors: { tss: 2100, do: 8.2, phosphate: 0.15, ph: 7.8, temperature: 22.5, hyacinth: 15, nitrogen: 1.2, nitrate: 0.8, ammonia: 0.05 },
    lastUpdate: '2024-10-06 14:30',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 12, interventions: ['Manual removal'] },
      { date: '2024-10-03', hyacinth: 14 },
      { date: '2024-10-06', hyacinth: 15 }
    ]
  },
  {
    id: 'buoy-2',
    name: 'Central Sensor',
    zone: 'zone3',
    location: { x: 46.3, y: 49.4 },
    status: 'warning',
    sensors: { tss: 4500, do: 5.8, phosphate: 0.28, ph: 7.2, temperature: 24.1, hyacinth: 42, nitrogen: 2.3, nitrate: 1.5, ammonia: 0.12 },
    lastUpdate: '2024-10-06 14:25',
    alerts: ['Dissolved oxygen trending downward', 'Water hyacinth levels increasing'],
    historicalData: [
      { date: '2024-09-28', hyacinth: 35, interventions: ['Chemical treatment applied'] },
      { date: '2024-10-01', hyacinth: 38 },
      { date: '2024-10-04', hyacinth: 40 },
      { date: '2024-10-06', hyacinth: 42 }
    ]
  },
  {
    id: 'buoy-3',
    name: 'South Sensor',
    zone: 'zone5',
    location: { x: 59.3, y: 64.5 },
    status: 'good',
    sensors: { tss: 1800, do: 8.5, phosphate: 0.12, ph: 7.9, temperature: 21.8, hyacinth: 8, nitrogen: 1.0, nitrate: 0.6, ammonia: 0.03 },
    lastUpdate: '2024-10-06 14:28',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 10, interventions: ['Routine maintenance'] },
      { date: '2024-10-04', hyacinth: 9 },
      { date: '2024-10-06', hyacinth: 8 }
    ]
  },
  {
    id: 'buoy-4',
    name: 'West Sensor',
    zone: 'zone4',
    location: { x: 29.3, y: 59.8 },
    status: 'critical',
    sensors: { tss: 7200, do: 4.1, phosphate: 0.42, ph: 6.8, temperature: 26.3, hyacinth: 68, nitrogen: 3.5, nitrate: 2.2, ammonia: 0.25 },
    lastUpdate: '2024-10-06 14:20',
    alerts: ['Critical: Low dissolved oxygen', 'High suspended solids', 'pH trending low', 'Critical hyacinth infestation'],
    historicalData: [
      { date: '2024-09-25', hyacinth: 55, interventions: ['Manual removal', 'Herbicide application'] },
      { date: '2024-09-30', hyacinth: 58 },
      { date: '2024-10-03', hyacinth: 63 },
      { date: '2024-10-06', hyacinth: 68, interventions: ['Emergency response required'] }
    ]
  },
  {
    id: 'buoy-5',
    name: 'Northeast Sensor',
    zone: 'zone2',
    location: { x: 67.8, y: 40.1 },
    status: 'good',
    sensors: { tss: 2350, do: 7.9, phosphate: 0.18, ph: 7.7, temperature: 23.1, hyacinth: 12, nitrogen: 1.3, nitrate: 0.9, ammonia: 0.06 },
    lastUpdate: '2024-10-06 14:32',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 11 },
      { date: '2024-10-04', hyacinth: 11 },
      { date: '2024-10-06', hyacinth: 12 }
    ]
  },
  {
    id: 'buoy-6',
    name: 'East-Central Sensor',
    zone: 'zone3',
    location: { x: 61.7, y: 51.5 },
    status: 'warning',
    sensors: { tss: 3800, do: 6.2, phosphate: 0.31, ph: 7.3, temperature: 24.8, hyacinth: 35, nitrogen: 2.1, nitrate: 1.4, ammonia: 0.11 },
    lastUpdate: '2024-10-06 14:27',
    alerts: ['Phosphate levels elevated', 'Moderate hyacinth growth detected'],
    historicalData: [
      { date: '2024-10-01', hyacinth: 28 },
      { date: '2024-10-03', hyacinth: 31 },
      { date: '2024-10-06', hyacinth: 35 }
    ]
  },
  {
    id: 'buoy-7',
    name: 'South-Central Sensor',
    zone: 'zone5',
    location: { x: 54.2, y: 43.7 },
    status: 'good',
    sensors: { tss: 1950, do: 8.3, phosphate: 0.14, ph: 7.8, temperature: 22.2, hyacinth: 10, nitrogen: 1.1, nitrate: 0.7, ammonia: 0.04 },
    lastUpdate: '2024-10-06 14:31',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 9 },
      { date: '2024-10-04', hyacinth: 10 },
      { date: '2024-10-06', hyacinth: 10 }
    ]
  },
  {
    id: 'buoy-8',
    name: 'North-East Sensor',
    zone: 'zone1',
    location: { x: 61.1, y: 38.2 },
    status: 'good',
    sensors: { tss: 2200, do: 8.1, phosphate: 0.16, ph: 7.7, temperature: 22.9, hyacinth: 14, nitrogen: 1.2, nitrate: 0.8, ammonia: 0.05 },
    lastUpdate: '2024-10-06 14:29',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 13 },
      { date: '2024-10-04', hyacinth: 14 },
      { date: '2024-10-06', hyacinth: 14 }
    ]
  },
  {
    id: 'buoy-9',
    name: 'West-Central Sensor',
    zone: 'zone4',
    location: { x: 38.5, y: 57.9 },
    status: 'warning',
    sensors: { tss: 4100, do: 6.5, phosphate: 0.29, ph: 7.4, temperature: 23.7, hyacinth: 38, nitrogen: 2.0, nitrate: 1.3, ammonia: 0.10 },
    lastUpdate: '2024-10-06 14:26',
    alerts: ['TSS slightly elevated', 'Hyacinth growth accelerating'],
    historicalData: [
      { date: '2024-10-01', hyacinth: 32, interventions: ['Monitoring increased'] },
      { date: '2024-10-04', hyacinth: 35 },
      { date: '2024-10-06', hyacinth: 38 }
    ]
  },
  {
    id: 'buoy-10',
    name: 'East Sensor',
    zone: 'zone2',
    location: { x: 70.3, y: 57.7 },
    status: 'good',
    sensors: { tss: 1700, do: 8.7, phosphate: 0.11, ph: 8.0, temperature: 21.5, hyacinth: 7, nitrogen: 0.9, nitrate: 0.5, ammonia: 0.02 },
    lastUpdate: '2024-10-06 14:33',
    alerts: [],
    historicalData: [
      { date: '2024-10-01', hyacinth: 8 },
      { date: '2024-10-04', hyacinth: 7 },
      { date: '2024-10-06', hyacinth: 7 }
    ]
  }
];

const initialActionLogs: ActionLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-10-06 14:15',
    user: 'John Smith',
    action: 'Calibration',
    buoyId: 'buoy-4',
    details: 'Performed DO sensor calibration',
    category: 'calibration'
  },
  {
    id: 'log-2',
    timestamp: '2024-10-06 13:45',
    user: 'Sarah Johnson',
    action: 'Alert Acknowledged',
    buoyId: 'buoy-2',
    details: 'Acknowledged low oxygen warning',
    category: 'alert'
  },
  {
    id: 'log-3',
    timestamp: '2024-10-06 12:30',
    user: 'Mike Davis',
    action: 'Maintenance',
    buoyId: 'buoy-1',
    details: 'Cleaned sensors and replaced filters',
    category: 'maintenance'
  },
  {
    id: 'log-4',
    timestamp: '2024-10-06 11:20',
    user: 'Admin',
    action: 'System Check',
    buoyId: 'buoy-7',
    details: 'Routine system health check completed',
    category: 'system'
  }
];

// Simulation configuration
const defaultSimulationConfig: SimulationConfig = {
  updateInterval: 5000, // 5 seconds
  variabilityFactor: 0.15,
  enableAnomalies: true,
  alertThresholds: {
    do: { critical: 4.5, warning: 6.0 },
    ph: { critical: [6.5, 8.5], warning: [6.8, 8.2] },
    tss: { critical: 6000, warning: 4000 },
    phosphate: { critical: 0.35, warning: 0.25 }
  }
};

export default function App() {
  // Initialize state from localStorage to prevent flashing
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const savedSession = localStorage.getItem('user-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.user && !session.isGuest) {
          return 'dashboard';
        }
      } catch (e) {
        // ignore
      }
    }
    return 'login';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('user-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.user && !session.isGuest) {
          return session.user;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  });
  const [isGuestMode, setIsGuestMode] = useState(() => {
    const savedSession = localStorage.getItem('user-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.user && !session.isGuest) {
          return false;
        }
      } catch (e) {
        // ignore
      }
    }
    return false; // Default to not guest mode (will show login screen)
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [buoys, setBuoys] = useState<BuoyData[]>(initialBuoys);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>(() => {
    // Load saved action logs from localStorage
    const saved = localStorage.getItem('action-logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialActionLogs;
      }
    }
    return initialActionLogs;
  });
  const [selectedSensorForDetails, setSelectedSensorForDetails] = useState<BuoyData | null>(null);
  const [simulationEngine] = useState(() => new DataSimulationEngine(defaultSimulationConfig));
  const buoysRef = React.useRef<BuoyData[]>(buoys);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    buoysRef.current = buoys;
  }, [buoys]);

  // Restore dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
    }
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  }, [isDarkMode]);

  // Save session
  useEffect(() => {
    if (currentUser || isGuestMode) {
      localStorage.setItem('user-session', JSON.stringify({
        user: currentUser,
        isGuest: isGuestMode
      }));
    } else {
      localStorage.removeItem('user-session');
    }
  }, [currentUser, isGuestMode]);

  // Initialize simulation engine
  useEffect(() => {
    simulationEngine.startSimulation(
      buoys, 
      (updatedBuoys) => {
        // Use the current buoys from ref to preserve any external updates (like positions)
        const currentBuoys = buoysRef.current;
        const mergedBuoys = updatedBuoys.map(updatedBuoy => {
          const currentBuoy = currentBuoys.find(b => b.id === updatedBuoy.id);
          if (currentBuoy) {
            // Preserve location from current state, use updated sensor data
            return {
              ...updatedBuoy,
              location: currentBuoy.location
            };
          }
          return updatedBuoy;
        });
        setBuoys(mergedBuoys);
      }, 
      (insight) => {
        // Handle predictive insights with toast notifications
        if (insight.actionRequired) {
          toast.warning(insight.title, {
            description: insight.description
          });
        }
      }
    );

    return () => {
      simulationEngine.stopSimulation();
    };
  }, [simulationEngine]);

  // Handlers
  const handleLogin = (userData: { email: string; name: string; role: string; organization: string }) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: '+27 11 234 5678',
      location: 'Hartbeespoort, South Africa',
      organization: userData.organization,
      role: userData.role as UserRole,
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        email: true,
        phone: false,
        hyacinthAlerts: true
      }
    };

    setCurrentUser(newUser);
    setIsGuestMode(false);
    setCurrentPage('dashboard');
    toast.success(`Welcome back, ${newUser.name}!`, {
      description: `Logged in as ${newUser.role}`
    });
  };

  const handleRegister = (userData: any) => {
    // Enforce Viewer role for Hartbeespoort Local organization
    let role = userData.role;
    if (userData.organization === 'Hartbeespoort Local' && role !== 'Viewer') {
      role = 'Viewer';
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location: userData.location,
      organization: userData.organization,
      role: role as UserRole,
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        email: true,
        phone: false,
        hyacinthAlerts: true
      }
    };

    setCurrentUser(newUser);
    setIsGuestMode(false);
    setCurrentPage('dashboard');
    toast.success(`Registration successful!`, {
      description: `Welcome to Harties Action, ${newUser.name}!`
    });
  };

  const handleGuestMode = () => {
    setIsGuestMode(true);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    toast.info('Viewing in Guest Mode', {
      description: 'Some features are restricted. Login for full access.'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    setCurrentPage('login');
    toast.info('Logged out successfully');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    toast.success('Profile updated successfully');
  };

  const handleAddLog = (log: Omit<ActionLog, 'id'>) => {
    const newLog: ActionLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    const updatedLogs = [newLog, ...actionLogs];
    setActionLogs(updatedLogs);
    // Persist to localStorage
    localStorage.setItem('action-logs', JSON.stringify(updatedLogs));
    toast.success('Action logged successfully');
  };

  // Persist action logs whenever they change
  useEffect(() => {
    if (actionLogs.length > 0) {
      localStorage.setItem('action-logs', JSON.stringify(actionLogs));
    }
  }, [actionLogs]);

  const handleSensorSelect = (buoy: BuoyData) => {
    setSelectedSensorForDetails(buoy);
  };

  const handleClearSensorDetails = () => {
    setSelectedSensorForDetails(null);
  };



  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage('register')}
            onGuestMode={handleGuestMode}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onBackToLogin={() => setCurrentPage('login')}
            onGuestMode={handleGuestMode}
          />
        );

      case 'dashboard':
        return (
          <MainDashboard
            buoys={buoys}
            actionLogs={actionLogs}
            onNavigate={handleNavigate}
            selectedSensorForDetails={selectedSensorForDetails}
            onClearSensorDetails={handleClearSensorDetails}
            onSensorSelect={handleSensorSelect}
            onLogout={handleLogout}
            currentUser={currentUser}
            isGuestMode={isGuestMode}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
            onAddLog={handleAddLog}
          />
        );

      case 'analytics':
        return (
          <AdvancedAnalytics
            buoys={buoys}
            actionLogs={actionLogs}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            currentUser={currentUser}
            isGuestMode={isGuestMode}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        );

      case 'logging':
        return (
          <ActionLogging
            actionLogs={actionLogs}
            buoys={buoys}
            onAddLog={handleAddLog}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            currentUser={currentUser}
            isGuestMode={isGuestMode}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        );

      case 'reports':
        return (
          <Reports
            buoys={buoys}
            actionLogs={actionLogs}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            currentUser={currentUser}
            isGuestMode={isGuestMode}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        );

      case 'fullscreen-map':
        return (
          <FullscreenMap
            buoys={buoys}
            onNavigate={handleNavigate}
            onBuoySelect={handleSensorSelect}
            onLogout={handleLogout}
            currentUser={currentUser}
            isGuestMode={isGuestMode}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
          />
        );

      default:
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage('register')}
            onGuestMode={handleGuestMode}
          />
        );
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {renderPage()}
    </div>
  );
}
