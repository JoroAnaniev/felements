import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Info, Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Legend() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="w-4 h-4" />
          Status Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-help">
                  <Circle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Operational</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">All parameters normal</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Dissolved Oxygen {'>'} 6.0 mg/L</p>
                <p className="text-sm">pH: 6.8 - 8.2</p>
                <p className="text-sm">TSS {'<'} 4000 mg/L</p>
                <p className="text-sm">Phosphate {'<'} 0.25 mg/L</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-help">
                  <Circle className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Warning</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Attention needed</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Dissolved Oxygen: 4.5 - 6.0 mg/L</p>
                <p className="text-sm">pH outside 6.8 - 8.2 range</p>
                <p className="text-sm">TSS: 4000 - 6000 mg/L</p>
                <p className="text-sm">Phosphate: 0.25 - 0.35 mg/L</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-help">
                  <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Critical</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Immediate action required</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Dissolved Oxygen {'<'} 4.5 mg/L</p>
                <p className="text-sm">pH {'<'} 6.5 or {'>'} 8.5</p>
                <p className="text-sm">TSS {'>'} 6000 mg/L</p>
                <p className="text-sm">Phosphate {'>'} 0.35 mg/L</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Zones</h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>Zone 1 - North Inlet</p>
            <p>Zone 2 - Northeast Basin</p>
            <p>Zone 3 - Central Waters</p>
            <p>Zone 4 - West Inlet Area</p>
            <p>Zone 5 - South Basin</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Parameters</h4>
          <TooltipProvider>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help hover:text-gray-900 dark:hover:text-gray-200">• TSS - Total Suspended Solids</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Measure of particles suspended in water</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help hover:text-gray-900 dark:hover:text-gray-200">• DO - Dissolved Oxygen</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Amount of oxygen available for aquatic life</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help hover:text-gray-900 dark:hover:text-gray-200">• pH - Acidity/Alkalinity</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Measure of water acidity (7 is neutral)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="cursor-help hover:text-gray-900 dark:hover:text-gray-200">• Phosphate - Nutrient levels</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>High levels can cause algae blooms</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
