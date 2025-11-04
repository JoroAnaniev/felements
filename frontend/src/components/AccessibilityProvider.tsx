import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityConfig {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncements: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announceToScreenReader: (message: string) => void;
  isKeyboardUser: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AccessibilityConfig>({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false,
    voiceAnnouncements: true,
    focusVisible: true
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Detect system preferences
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        setConfig(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    // Update config based on system preferences
    setConfig(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast
    }));

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Large text
    if (config.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Keyboard navigation
    if (config.keyboardNavigation || isKeyboardUser) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }

    // Focus visible
    if (config.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [config, isKeyboardUser]);

  const updateConfig = (updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const announceToScreenReader = (message: string) => {
    if (config.voiceAnnouncements) {
      setAnnouncements(prev => [...prev, message]);
      
      // Clear announcement after a short delay
      setTimeout(() => {
        setAnnouncements(prev => prev.slice(1));
      }, 1000);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      config,
      updateConfig,
      announceToScreenReader,
      isKeyboardUser
    }}>
      {children}
      
      {/* Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only">
        <a 
          href="#main-content"
          className="fixed top-0 left-0 z-50 bg-primary-solid text-white p-2 rounded"
        >
          Skip to main content
        </a>
        <a 
          href="#sidebar-nav"
          className="fixed top-0 left-20 z-50 bg-primary-solid text-white p-2 rounded"
        >
          Skip to navigation
        </a>
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          // Close modals, dropdowns, etc.
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
          break;
        case 'Enter':
        case ' ':
          // Activate focused element
          const target = e.target as HTMLElement;
          if (target.role === 'button' || target.tagName === 'BUTTON') {
            e.preventDefault();
            target.click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { focusedElement, setFocusedElement };
}

// ARIA label helpers
export function getAriaLabel(type: string, data?: any): string {
  switch (type) {
    case 'buoy-status':
      return `Buoy ${data.name}, status: ${data.status}, last updated: ${data.lastUpdate}`;
    case 'sensor-reading':
      return `${data.parameter}: ${data.value} ${data.unit}`;
    case 'alert':
      return `Alert: ${data.message}`;
    case 'navigation':
      return `Navigate to ${data.page}`;
    default:
      return '';
  }
}

// Screen reader announcement helpers
export function announcePageChange(page: string) {
  const { announceToScreenReader } = useAccessibility();
  announceToScreenReader(`Navigated to ${page} page`);
}

export function announceDataUpdate(type: string, count?: number) {
  const { announceToScreenReader } = useAccessibility();
  announceToScreenReader(`${type} data updated${count ? `, ${count} items` : ''}`);
}

export function announceAlert(severity: string, message: string) {
  const { announceToScreenReader } = useAccessibility();
  announceToScreenReader(`${severity} alert: ${message}`);
}