import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import hartiesLogo from "figma:asset/a4a169eda86b4eac6d535e2155342bf3e96c0a94.png";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";

interface LoginScreenProps {
  onLogin: (userData: { email: string; name: string; role: string; organization: string }) => void;
  onNavigateToRegister: () => void;
  onGuestMode: () => void;
}

export function LoginScreen({
  onLogin,
  onNavigateToRegister,
  onGuestMode,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
        
        // Determine user role and organization based on email
        let role = 'Engineer';
        let organization = 'Independent Organization';
        let name = email.split('@')[0];
        
        if (email.includes('manager')) {
          role = 'Manager';
        } else if (email.includes('viewer')) {
          role = 'Viewer';
        }
        
        if (email.includes('harties') || email.includes('hartbeespoort')) {
          organization = 'Hartbeespoort Local';
          // Always assign Viewer role for Hartbeespoort Local users
          role = 'Viewer';
        }
        
        onLogin({ 
          email, 
          name: name.charAt(0).toUpperCase() + name.slice(1),
          role,
          organization
        });
      }, 800);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Premium Background with Gradient Overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"
          style={{
            background: `linear-gradient(135deg, 
              rgba(248, 251, 248, 0.95) 0%, 
              rgba(240, 249, 240, 0.9) 25%,
              rgba(232, 245, 232, 0.85) 50%,
              rgba(240, 253, 240, 0.9) 75%,
              rgba(248, 251, 248, 0.95) 100%)`
          }}
        />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <ImageWithFallback
            src="https://ukutula.co.za/wp-content/uploads/hartbeespoort-1500.jpg"
            alt="Hartbeespoort Dam"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Floating Elements for Visual Interest */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-emerald-200/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-200/25 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Login Card */}
          <Card className="glass-card border-0 shadow-elevated overflow-hidden">
            <CardHeader className="text-center space-y-4 pb-4 pt-6">
              {/* Logo - Clean Implementation */}
              <div className="relative flex justify-center">
                <img
                  src={hartiesLogo}
                  alt="Harties Action Logo"
                  className="h-36 w-auto mx-auto drop-shadow-lg"
                />
              </div>
              
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <h2 className="text-sm font-medium text-green-700">
                  Hartbeespoort Dam Monitoring
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed max-w-sm mx-auto">
                  Secure access to real-time monitoring
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email Field */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-gray-700 font-medium text-xs">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@organization.co.za"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-9 text-sm bg-white/80 backdrop-blur-sm border-gray-300/60 focus:border-green-500/70 focus:ring-green-500/30 transition-all duration-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-gray-700 font-medium text-xs">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-9 text-sm bg-white/80 backdrop-blur-sm border-gray-300/60 focus:border-green-500/70 focus:ring-green-500/30 transition-all duration-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Professional Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 gradient-primary text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-professional mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Access Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Guest Mode Access */}
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={onGuestMode}
                  variant="outline"
                  className="w-full h-9 bg-white/60 border-2 border-gray-300/60 hover:bg-white/80 hover:border-green-400/60 text-gray-700 hover:text-green-700 font-medium text-sm rounded-lg transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Continue as Guest</span>
                  </div>
                </Button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  View the dashboard with limited features
                </p>
              </div>

              {/* Professional Footer */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-700">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="text-green-700 hover:text-green-800 font-semibold underline decoration-green-700/40 hover:decoration-green-800 underline-offset-2 transition-all duration-200"
                  >
                    Register Now
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="mt-2 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-100/80 backdrop-blur-sm text-green-800 rounded-lg text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Demo Mode: Use any credentials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}