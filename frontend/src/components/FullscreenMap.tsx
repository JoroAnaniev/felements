import React, { useState, useRef, useEffect } from "react";
import React, { useState, useRef, useEffect } from "react";
import { BuoyData, Page } from "../App";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { X, ExternalLink, ArrowLeft } from "lucide-react";
import damImage from "figma:asset/ae12d050bdf059707b0004f35a9fb0423e0cd7ec.png";

interface FullscreenMapProps {
  buoys: BuoyData[];
  onNavigate: (page: Page) => void;
  onBuoySelect: (buoy: BuoyData) => void;
  onLogout: () => void;
  currentUser?: any | null;
  isGuestMode?: boolean;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export function FullscreenMap({
  buoys,
  onNavigate,
  onBuoySelect,
  onLogout,
  currentUser,
  isGuestMode = false,
  onToggleDarkMode,
  isDarkMode = false,
}: FullscreenMapProps) {
  const [clickedBuoy, setClickedBuoy] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<BuoyData | null>(null);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    setImageBounds({
      left: imageLeft,
      top: imageTop,
      width: imageWidth,
      height: imageHeight,
    });
  };

  useEffect(() => {
    // Update bounds on mount and when window resizes
    const handleResize = () => {
      updateImageBounds();
    };

    // Initial calculation with a slight delay to ensure image is rendered
    const timer = setTimeout(updateImageBounds, 100);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

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

  const handleBuoyClick = (buoy: BuoyData) => {
    setClickedBuoy(buoy.id);
    setShowDetailsModal(buoy);
  };

  const handleViewDetails = (buoy: BuoyData) => {
    onBuoySelect(buoy);
    setShowDetailsModal(null);
    // Navigate to dashboard to show detailed readings
    onNavigate('dashboard');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Simple Back to Dashboard Button */}
      <Button
        onClick={() => onNavigate("dashboard")}
        className="absolute top-4 left-4 z-50 glass-card border-0 shadow-professional bg-white/95 hover:bg-white text-gray-900 hover:scale-105 transition-all duration-200 px-4 py-2 h-auto"
        size="sm"
      >
        <div className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </div>
      </Button>

      {/* Exit button (top right) */}
      <Button
        onClick={() => onNavigate("dashboard")}
        className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
        size="icon"
      >
        <X className="h-4 w-4" />
      </Button>

      <div
        ref={containerRef}
        className="w-full h-full relative bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden"
        onClick={(e) => {
          // Close labels when clicking on the map background
          if (e.target === e.currentTarget) {
            setClickedBuoy(null);
            setShowDetailsModal(null);
          }
        }}
      >
        {/* Background dam image */}
        <div className="absolute inset-0 pointer-events-none">
          <ImageWithFallback
            ref={imageRef}
            src={damImage}
            alt="Hartbeespoort Dam aerial view"
            className="w-full h-full object-contain"
            onLoad={updateImageBounds}
          />
        </div>

        {/* Subtle water overlay */}
        <div className="absolute inset-0 bg-blue-400/20 pointer-events-none"></div>

        {/* Buoys */}
        {imageBounds && buoys.map((buoy) => {
            // Calculate buoy position relative to image bounds
            const buoyX = imageBounds.left + (buoy.location.x / 100) * imageBounds.width;
            const buoyY = imageBounds.top + (buoy.location.y / 100) * imageBounds.height;

            // Fixed size for buoy markers
            const baseSize = 40;

            return (
              <div
                key={buoy.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuoyClick(buoy);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 cursor-pointer ${
                  clickedBuoy === buoy.id ? "scale-125" : ""
                }`}
                style={{
                  left: `${buoyX}px`,
                  top: `${buoyY}px`,
                }}
              >
                {/* Buoy marker */}
                <div
                  className={`relative ${getBuoyPulse(buoy.status)}`}
                >
                  {/* Main buoy icon */}
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
                        width: `${Math.max(12, baseSize * 0.3)}px`,
                        height: `${Math.max(12, baseSize * 0.3)}px`,
                      }}
                    ></div>
                  )}
                </div>

                {/* Buoy label - show when clicked */}
                {clickedBuoy === buoy.id && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg text-gray-800 whitespace-nowrap shadow-lg border border-gray-200 z-10"
                    style={{
                      top: `${baseSize + 12}px`,
                      fontSize: '14px',
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t rotate-45 border-gray-200"></div>
                    {buoy.name}
                  </div>
                )}
              </div>
            );
          })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <h4 className="text-base text-gray-900 mb-3">
            Status Legend
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">
                Good
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-700">
                Warning
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700">
                Critical
              </span>
            </div>
          </div>
        </div>

        {/* Compass */}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">
                {showDetailsModal.name}
              </h3>
              <Button
                onClick={() => setShowDetailsModal(null)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs capitalize ${
                    showDetailsModal.status === "good"
                      ? "bg-green-100 text-green-800"
                      : showDetailsModal.status === "warning"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {showDetailsModal.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Last Update:
                </span>
                <span className="text-sm text-gray-900">
                  {showDetailsModal.lastUpdate}
                </span>
              </div>
              {showDetailsModal.alerts.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">
                    Alerts:
                  </span>
                  <div className="mt-1">
                    {showDetailsModal.alerts.map(
                      (alert, index) => (
                        <div
                          key={index}
                          className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded mt-1"
                        >
                          {alert}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() =>
                handleViewDetails(showDetailsModal)
              }
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Detailed Readings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
