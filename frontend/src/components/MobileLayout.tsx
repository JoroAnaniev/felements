import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Page } from '../App';
import { Menu, X, Wifi, Battery, Signal } from 'lucide-react';
import { Button } from './ui/button';

interface MobileLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
  currentUser?: any | null;
  isGuestMode?: boolean;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export function MobileLayout({ 
  children, 
  onNavigate, 
  onLogout, 
  currentPage, 
  currentUser = null,
  isGuestMode = false,
  onToggleDarkMode,
  isDarkMode = false
}: MobileLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [signalStrength, setSignalStrength] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate battery drain
  useEffect(() => {
    const battery = setInterval(() => {
      setBatteryLevel(prev => Math.max(15, prev - Math.random() * 0.1));
    }, 30000);
    
    return () => clearInterval(battery);
  }, []);

  // Close sidebar when clicking outside or navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentPage]);

  // Handle swipe gestures
  const handlePan = (event: any, info: PanInfo) => {
    if (info.offset.x > 100 && Math.abs(info.velocity.x) > 500) {
      setIsSidebarOpen(true);
    } else if (info.offset.x < -100 && Math.abs(info.velocity.x) > 500) {
      setIsSidebarOpen(false);
    }
  };

  // Professional status bar
  const StatusBar = () => (
    <div className="flex items-center justify-between px-4 py-2 bg-black text-white text-xs font-medium">
      <div className="flex items-center space-x-1">
        <span>{currentTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Signal className="w-3 h-3" />
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4].map(bar => (
              <div 
                key={bar}
                className={`w-0.5 h-2 ${bar <= signalStrength ? 'bg-white' : 'bg-gray-600'} rounded-full`}
              />
            ))}
          </div>
        </div>
        <Wifi className="w-3 h-3" />
        <div className="flex items-center space-x-1">
          <span>{Math.round(batteryLevel)}%</span>
          <Battery className={`w-3 h-3 ${batteryLevel < 20 ? 'text-red-400' : 'text-white'}`} />
        </div>
      </div>
    </div>
  );

  // Enhanced header with professional styling
  const Header = () => (
    <motion.div 
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dam Monitor</h1>
              <p className="text-xs text-gray-500 -mt-1">Professional</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Live indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">LIVE</span>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-1 text-gray-600">
            <Wifi className="w-4 h-4" />
            <span className="text-xs">5G</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced sidebar with professional animations
  const SidebarOverlay = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white/98 backdrop-blur-lg shadow-2xl border-r border-gray-200/50 overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <Sidebar
                currentPage={currentPage}
                onNavigate={onNavigate}
                onClose={() => setIsSidebarOpen(false)}
                isMobile={true}
                onLogout={onLogout}
                currentUser={currentUser}
                isGuestMode={isGuestMode}
                onToggleDarkMode={onToggleDarkMode}
                isDarkMode={isDarkMode}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
          currentUser={currentUser}
          isGuestMode={isGuestMode}
          onToggleDarkMode={onToggleDarkMode}
          isDarkMode={isDarkMode}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  // Mobile layout with advanced features
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Professional Status Bar */}
      {showStatusBar && <StatusBar />}
      
      {/* Enhanced Header */}
      <Header />
      
      {/* Main Content with Gesture Support */}
      <motion.main 
        className="flex-1 overflow-auto relative"
        onPan={handlePan}
        drag={false}
        style={{
          touchAction: 'pan-y' // Allow vertical scrolling but capture horizontal swipes
        }}
      >
        {/* Content with professional animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
        
        {/* Swipe hint indicator */}
        {!isSidebarOpen && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="bg-black/20 text-white p-2 rounded-r-lg backdrop-blur-sm">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-white rounded-full opacity-50" />
                <div className="w-1 h-4 bg-white rounded-full opacity-75" />
                <div className="w-1 h-4 bg-white rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.main>
      
      {/* Enhanced Sidebar Overlay */}
      <SidebarOverlay />
      
      {/* Professional Bottom Safe Area */}
      <div className="h-safe-area-inset-bottom bg-white border-t border-gray-200/50" />
    </div>
  );
}