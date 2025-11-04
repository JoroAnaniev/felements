import React from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, BarChart3, Map, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'dashboard' | 'analytics' | 'map' | 'data' | 'ai';
  message?: string;
  progress?: number;
}

export function LoadingState({ type = 'dashboard', message, progress }: LoadingStateProps) {
  const getLoadingConfig = () => {
    switch (type) {
      case 'analytics':
        return {
          icon: Brain,
          title: 'AI Analytics Loading',
          description: 'Processing correlations and predictive models...',
          color: 'text-purple-600',
          gradient: 'from-purple-500 to-indigo-600'
        };
      case 'map':
        return {
          icon: Map,
          title: 'Map Rendering',
          description: 'Loading sensor positions and overlays...',
          color: 'text-blue-600',
          gradient: 'from-blue-500 to-cyan-600'
        };
      case 'data':
        return {
          icon: BarChart3,
          title: 'Data Processing',
          description: 'Analyzing sensor readings and trends...',
          color: 'text-green-600',
          gradient: 'from-green-500 to-emerald-600'
        };
      case 'ai':
        return {
          icon: Brain,
          title: 'AI Engine Initializing',
          description: 'Starting predictive analytics and anomaly detection...',
          color: 'text-indigo-600',
          gradient: 'from-indigo-500 to-purple-600'
        };
      default:
        return {
          icon: Activity,
          title: 'Dashboard Loading',
          description: 'Preparing monitoring interface...',
          color: 'text-green-600',
          gradient: 'from-green-500 to-emerald-600'
        };
    }
  };

  const config = getLoadingConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto p-8"
      >
        {/* Animated Logo/Icon */}
        <motion.div
          className={`relative mx-auto mb-8 w-24 h-24 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Icon className="w-12 h-12 text-white" />
          
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-4 border-white/30"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-gray-600">{message || config.description}</p>
        </motion.div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 space-y-3"
          >
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-2 bg-gradient-to-r ${config.gradient} rounded-full`}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-500">{Math.round(progress)}% Complete</p>
          </motion.div>
        )}

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-2 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full`}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Skeleton Loading Components
export function DataCardSkeleton() {
  return (
    <div className="glass-card border-0 shadow-professional animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-6 h-6 bg-gray-200 rounded-lg" />
          <div className="w-16 h-5 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
          <div className="w-1/2 h-3 bg-gray-200 rounded" />
        </div>
        <div className="w-full h-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card border-0 shadow-professional animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-32 h-6 bg-gray-200 rounded" />
          <div className="w-20 h-5 bg-gray-200 rounded" />
        </div>
        <div className="w-full h-64 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

export function BuoyCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="w-12 h-5 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-100 rounded-lg p-2 space-y-1">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-12 h-3 bg-gray-200 rounded" />
        </div>
        <div className="bg-gray-100 rounded-lg p-2 space-y-1">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-12 h-3 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-20 h-3 bg-gray-200 rounded" />
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// Spinner Component
export function Spinner({ size = 'md', color = 'primary' }: { size?: 'sm' | 'md' | 'lg'; color?: 'primary' | 'white' | 'gray' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-green-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
  );
}

// Progressive Loading Component
export function ProgressiveLoader({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: index <= currentStep ? 1 : 0.3,
            x: 0 
          }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            index < currentStep ? 'bg-green-500' :
            index === currentStep ? 'bg-blue-500' :
            'bg-gray-300'
          }`}>
            {index < currentStep ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            ) : index === currentStep ? (
              <Spinner size="sm" color="white" />
            ) : (
              <span className="text-xs text-gray-600">{index + 1}</span>
            )}
          </div>
          <span className={`text-sm ${
            index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            {step}
          </span>
        </motion.div>
      ))}
    </div>
  );
}