import React, { useState, useRef, useEffect } from "react";
import { BuoyData, Page } from "../App";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Maximize } from "lucide-react";
import damImage from "figma:asset/ae12d050bdf059707b0004f35a9fb0423e0cd7ec.png";

interface DamMapProps {
  buoys: BuoyData[];
  onBuoyClick: (buoy: BuoyData) => void;
  selectedBuoy: BuoyData | null;
  onMaximize?: () => void;
  onSensorSelect?: (buoy: BuoyData) => void;
}

export function DamMap({
  buoys,
  onBuoyClick,
  selectedBuoy,
  onMaximize,
  onSensorSelect,
}: DamMapProps) {
  const [clickedBuoy, setClickedBuoy] = useState<string | null>(
    null,
  );

  const [isMobile, setIsMobile] = useState(false);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Check if screen is mobile size
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkMobile = () => {
      // Debounce mobile check to prevent excessive updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth < 768; // md breakpoint for better mobile detection
        setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
      }, 50);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate image bounds when image loads or container resizes
  const updateImageBounds = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const image = imageRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Get the natural dimensions of the image
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    
    if (naturalWidth === 0 || naturalHeight === 0) return;
    
    // Calculate the aspect ratios
    const containerAspect = containerRect.width / containerRect.height;
    const imageAspect = naturalWidth / naturalHeight;
    
    let imageWidth, imageHeight, imageLeft, imageTop;
    
    if (isMobile) {
      // On mobile, use object-contain for better positioning accuracy
      if (imageAspect > containerAspect) {
        // Image is wider - fit by width
        imageWidth = containerRect.width;
        imageHeight = containerRect.width / imageAspect;
        imageLeft = 0;
        imageTop = (containerRect.height - imageHeight) / 2;
      } else {
        // Image is taller - fit by height
        imageHeight = containerRect.height;
        imageWidth = containerRect.height * imageAspect;
        imageTop = 0;
        imageLeft = (containerRect.width - imageWidth) / 2;
      }
    } else {
      // On desktop, use object-contain behavior - maintain aspect ratio
      if (imageAspect > containerAspect) {
        // Image is wider - fit by width
        imageWidth = containerRect.width;
        imageHeight = containerRect.width / imageAspect;
        imageLeft = 0;
        imageTop = (containerRect.height - imageHeight) / 2;
      } else {
        // Image is taller - fit by height
        imageHeight = containerRect.height;
        imageWidth = containerRect.height * imageAspect;
        imageTop = 0;
        imageLeft = (containerRect.width - imageWidth) / 2;
      }
    }
    
    setImageBounds({
      left: imageLeft,
      top: imageTop,
      width: imageWidth,
      height: imageHeight
    });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events to prevent excessive calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateImageBounds();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isMobile]); // Re-run when mobile state changes

  const getBuoyColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500 border-green-600";
      case "warning":
        return "bg-orange-500 border-orange-600";
      case "critical":
        return "bg-red-500 border-red-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getBuoyPulse = (status: string) => {
    switch (status) {
      case "warning":
        return "animate-pulse";
      case "critical":
        return "animate-bounce";
      default:
        return "";
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-900">
              Dam Overview Map
            </h3>
            <p className="text-sm text-gray-600">
              Click on buoys to view detailed sensor data
            </p>
          </div>
          {onMaximize && (
            <Button
              onClick={onMaximize}
              variant="outline"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-gray-900"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="map-container relative flex-1 w-full bg-gradient-to-br from-blue-100 to-blue-200 select-none"
        style={{ 
          minHeight: isMobile ? '320px' : '400px', 
          maxHeight: isMobile ? '60vh' : '70vh',
          height: isMobile ? 'auto' : undefined
        }}
        onClick={(e) => {
          // Close labels when clicking on the map background
          if (e.target === e.currentTarget) {
            setClickedBuoy(null);
          }
        }}
      >
        {/* Background dam image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            ref={imageRef}
            src={damImage}
            alt="Hartbeespoort Dam aerial view"
            className={`w-full h-full object-contain`}
            onLoad={() => {
              // Add a small delay to ensure image is fully rendered
              setTimeout(updateImageBounds, 100);
            }}
            onError={() => {
              // Set default bounds if image fails to load
              if (containerRef.current) {
                const container = containerRef.current;
                const containerRect = container.getBoundingClientRect();
                setImageBounds({
                  left: 0,
                  top: 0,
                  width: containerRect.width,
                  height: containerRect.height
                });
              }
            }}
          />
        </div>

        {/* Subtle water overlay */}
        <div className="absolute inset-0 bg-blue-400/20"></div>

        {/* Buoys */}
        {imageBounds && buoys.map((buoy) => {
          // Calculate buoy position relative to image bounds
          const buoyX = imageBounds.left + (buoy.location.x / 100) * imageBounds.width;
          const buoyY = imageBounds.top + (buoy.location.y / 100) * imageBounds.height;
          
          // Calculate responsive size based on screen size and image size
          const baseSize = isMobile 
            ? Math.max(28, Math.min(44, Math.max(imageBounds.width, imageBounds.height) / 20)) // Larger on mobile
            : Math.max(20, Math.min(32, imageBounds.width / 50));
          
          return (
            <button
              key={buoy.id}
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing when clicking on buoy
                onBuoyClick(buoy);
                setClickedBuoy(
                  clickedBuoy === buoy.id ? null : buoy.id,
                );
                
                // On mobile, directly navigate to sensor details instead of showing modal
                if (isMobile && onSensorSelect) {
                  onSensorSelect(buoy);
                }
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer ${isMobile ? 'active:scale-110' : 'hover:scale-110'} ${selectedBuoy?.id === buoy.id ? "scale-125" : ""} ${isMobile ? 'touch-manipulation' : ''}`}
              style={{
                left: `${buoyX}px`,
                top: `${buoyY}px`,
              }}
            >
              {/* Buoy marker */}
              <div
                className={`relative ${getBuoyPulse(buoy.status)}`}
              >
                {/* Main buoy icon - responsive size */}
                <div
                  className={`rounded-full border-2 ${getBuoyColor(buoy.status)} shadow-lg`}
                  style={{
                    width: `${baseSize}px`,
                    height: `${baseSize}px`,
                  }}
                >
                  <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
                    <svg
                      className="text-white"
                      style={{
                        width: `${baseSize * 0.5}px`,
                        height: `${baseSize * 0.5}px`,
                      }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>

                {/* Signal waves for active buoys */}
                {buoy.status !== "critical" && (
                  <div 
                    className="absolute rounded-full border-2 border-current opacity-30 animate-ping"
                    style={{
                      top: 0,
                      left: 0,
                      width: `${baseSize}px`,
                      height: `${baseSize}px`,
                    }}
                  ></div>
                )}

                {/* Alert indicator */}
                {buoy.alerts.length > 0 && (
                  <div 
                    className="absolute bg-red-500 rounded-full border border-white"
                    style={{
                      top: `${-baseSize * 0.1}px`,
                      right: `${-baseSize * 0.1}px`,
                      width: `${Math.max(8, baseSize * 0.3)}px`,
                      height: `${Math.max(8, baseSize * 0.3)}px`,
                    }}
                  ></div>
                )}
              </div>

              {/* Buoy label - only show when clicked */}
              {clickedBuoy === buoy.id && (
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-gray-800 whitespace-nowrap shadow-lg border border-gray-200 z-10"
                  style={{
                    top: `${baseSize + 8}px`,
                    fontSize: `${Math.max(12, baseSize * 0.6)}px`,
                  }}
                >
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                  {buoy.name}
                </div>
              )}
            </button>
          );
        })}

        {/* Legend - responsive positioning */}
        <div className={`absolute ${isMobile ? 'bottom-2 left-2' : 'bottom-4 left-4'} bg-white/90 backdrop-blur-sm ${isMobile ? 'p-2' : 'p-3'} rounded-lg shadow-sm`}>
          <h4 className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-900 mb-2`}>
            Status Legend
          </h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-green-500`}></div>
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-700`}>
                Good
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-orange-500`}></div>
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-700`}>
                Warning
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-red-500`}></div>
              <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-700`}>
                Critical
              </span>
            </div>
          </div>
        </div>

        {/* Compass - responsive positioning */}
        


      </div>
    </div>
  );
}