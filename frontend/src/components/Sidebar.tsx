import React from "react";
import { Page } from "../App";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  X,
  Settings,
  LogOut,
  Activity,
  FileText,
  BarChart3,
  Map,
  User,
  Brain,
  Lock,
} from "lucide-react";
import hartiesLogo from "figma:asset/a4a169eda86b4eac6d535e2155342bf3e96c0a94.png";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
  isMobile?: boolean;
  onLogout: () => void;
  currentUser?: any | null;
  isGuestMode?: boolean;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

export function Sidebar({
  currentPage,
  onNavigate,
  onClose,
  isMobile = false,
  onLogout,
  currentUser = null,
  isGuestMode = false,
  onToggleDarkMode,
  isDarkMode = false,
}: SidebarProps) {
  // Debug: Log user state to console
  React.useEffect(() => {
    console.log("[Sidebar] User State:", {
      currentUser,
      isGuestMode,
      userName: currentUser?.name,
      userRole: currentUser?.role,
    });
  }, [currentUser, isGuestMode]);
  const navItems = [
    {
      id: "dashboard" as Page,
      label: "Dashboard",
      icon: Activity,
      description: "Real-time monitoring",
      allowedForViewer: true,
    },
    {
      id: "analytics" as Page,
      label: "AI Analytics",
      icon: Brain,
      description: "AI-powered insights",
      allowedForViewer: true,
    },
    {
      id: "logging" as Page,
      label: "Action Log",
      icon: FileText,
      description: "Action history",
      allowedForViewer: false,
    },
    {
      id: "reports" as Page,
      label: "Reports",
      icon: FileText,
      description: "Data analysis",
      allowedForViewer: false,
    },
    {
      id: "fullscreen-map" as Page,
      label: "Map View",
      icon: Map,
      description: "Full map view",
      allowedForViewer: true,
    },
  ];

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 flex flex-col h-full shadow-professional">
      {/* Professional Header */}
      <div className="border-b border-gray-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-center relative">
          {/* Logo - Clean Implementation */}
          <img
            src={hartiesLogo}
            alt="Harties Action Logo"
            className="h-32 w-auto drop-shadow-md"
          />

          {/* Mobile Close Button */}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Professional Subtitle */}
        <div className="text-center mt-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Monitoring Portal
          </h2>
          <p className="text-xs text-gray-600">
            Hartbeespoort Dam System
          </p>
        </div>
      </div>

      {/* Professional Navigation - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            // Check restrictions: Guest mode OR Viewer role on restricted pages
            // Analytics is now allowed for guests and viewers
            const isGuestRestricted =
              isGuestMode &&
              ![
                "dashboard",
                "fullscreen-map",
                "analytics",
              ].includes(item.id);
            const isViewerRestricted =
              !isGuestMode &&
              currentUser?.role === "Viewer" &&
              !item.allowedForViewer;
            const isRestricted =
              isGuestRestricted || isViewerRestricted;

            return (
              <div key={item.id} className="relative">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl h-auto py-6 px-4"
                      : isRestricted
                        ? "text-gray-400 cursor-not-allowed h-auto p-4 bg-gray-50/50 opacity-60"
                        : "text-gray-700 hover:bg-gray-100/70 hover:text-gray-900 h-auto p-4"
                  }`}
                  onClick={() => onNavigate(item.id)}
                  disabled={isRestricted}
                >
                  <div
                    className={`flex items-center w-full ${
                      isActive ? "space-x-4" : "space-x-3"
                    }`}
                  >
                    <div
                      className={`rounded-lg flex items-center justify-center relative ${
                        isActive
                          ? "bg-white/20 p-3"
                          : isRestricted
                            ? "bg-gray-200/50 p-2"
                            : "bg-gray-100 p-2"
                      }`}
                    >
                      <Icon
                        className={`${
                          isActive
                            ? "w-5 h-5 text-white"
                            : isRestricted
                              ? "w-4 h-4 text-gray-400"
                              : "w-4 h-4 text-gray-600"
                        }`}
                      />
                      {isRestricted && (
                        <Lock className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 text-amber-600 bg-white rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold transition-all duration-200 ${
                          isActive
                            ? "text-white text-sm leading-tight"
                            : isRestricted
                              ? "text-gray-400 text-sm font-medium"
                              : "text-gray-900 text-sm font-medium"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 leading-snug transition-all duration-200 ${
                          isActive
                            ? "text-white/90"
                            : isRestricted
                              ? "text-gray-400"
                              : "text-gray-500"
                        }`}
                      >
                        {isGuestRestricted
                          ? "🔒 Login Required"
                          : isViewerRestricted
                            ? "🔒 Restricted Access"
                            : item.description}
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Professional User Profile Footer */}
      <div className="p-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-green-50/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {currentUser?.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {isGuestMode
                  ? "View Only"
                  : currentUser?.role || "Viewer"}
              </p>
            </div>
          </div>

          {/* Professional Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 rounded-lg transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white/95 backdrop-blur-sm border-gray-200/50"
            >
              {!isGuestMode && (
                <DropdownMenuItem
                  onClick={() => onNavigate("profile")}
                  className="text-gray-700 focus:text-gray-900 focus:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
              )}
              {onToggleDarkMode && (
                <DropdownMenuItem
                  onClick={onToggleDarkMode}
                  className="text-gray-700 focus:text-gray-900 focus:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
              )}
              {isGuestMode && (
                <DropdownMenuItem
                  onClick={() => onNavigate("register")}
                  className="text-green-700 focus:text-green-800 focus:bg-green-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Create Account
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={
                  isGuestMode
                    ? () => onNavigate("login")
                    : onLogout
                }
                className="text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isGuestMode ? "Sign In" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}