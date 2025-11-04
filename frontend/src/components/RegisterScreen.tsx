import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UserPlus, Building, Shield, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import hartiesLogo from "figma:asset/a4a169eda86b4eac6d535e2155342bf3e96c0a94.png";

interface RegisterScreenProps {
  onRegister: (userData: { 
    name: string; 
    email: string; 
    phone: string; 
    location: string; 
    organization: string; 
    role: string;
  }) => void;
  onBackToLogin: () => void;
  onGuestMode: () => void;
}

export function RegisterScreen({
  onRegister,
  onBackToLogin,
  onGuestMode,
}: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    organization: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-set role to "Viewer" when organization is "Hartbeespoort Local"
      if (field === "organization" && value === "Hartbeespoort Local") {
        newData.role = "Viewer";
        // Also clear any role error since we're auto-setting it
        if (errors.role) {
          setErrors((prevErrors) => ({ ...prevErrors, role: "" }));
        }
      }
      
      return newData;
    });
    
    if (errors[field])
      setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.organization)
      newErrors.organization = "Organization is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password =
        "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      console.log("Registration data:", formData);
      
      // Simulate registration process
      setTimeout(() => {
        setIsLoading(false);
        // Prepare user data for registration
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || '+27 11 234 5678',
          location: formData.location || 'Hartbeespoort, South Africa',
          organization: formData.organization,
          role: formData.role
        };
        onRegister(userData);
      }, 1200);
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
            src="https://images.unsplash.com/photo-1732721093836-637fb75ae237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYnVpbGRpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU5MzA4MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Government building"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Floating Elements for Visual Interest */}
        <div className="absolute top-10 right-20 w-40 h-40 bg-green-200/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-16 w-56 h-56 bg-emerald-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      {/* Main Content - Scrollable if needed */}
      <div className="relative z-10 w-full h-full overflow-y-auto flex items-center justify-center py-2 px-4">
        <div className="w-full max-w-2xl my-auto">
          {/* Registration Card */}
          <Card className="glass-card border-0 shadow-elevated overflow-hidden">
            <CardHeader className="text-center space-y-0.5 pb-1 pt-3">
              {/* Logo inside card - Much Bigger and positioned lower */}
              <div className="flex justify-center mb-0">
                <img 
                  src={hartiesLogo} 
                  alt="Harties Action Logo" 
                  className="h-40 w-auto drop-shadow-lg mt-4 mb-[-2rem]"
                />
              </div>
              
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Registration
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs">
                  Complete your profile to access the system
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-2">
              <form onSubmit={handleSubmit} className="space-y-1.5">
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {[
                    { field: "firstName", label: "First Name", placeholder: "John", icon: User },
                    { field: "lastName", label: "Last Name", placeholder: "Smith", icon: User }
                  ].map(({ field, label, placeholder, icon: Icon }, i) => (
                    <div className="space-y-0.5" key={i}>
                      <Label htmlFor={field} className="text-gray-700 font-medium text-xs">
                        {label}
                      </Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={field}
                          type="text"
                          placeholder={placeholder}
                          value={formData[field as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className={`pl-10 h-9 text-sm bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-300 ${
                            errors[field] ? "border-red-400/50 focus:border-red-500/50" : ""
                          }`}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          <span>{errors[field]}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-gray-700 font-medium text-xs">
                    Professional Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@organization.co.za"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 h-9 text-sm bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-300 ${
                        errors.email ? "border-red-400/50 focus:border-red-500/50" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Organization & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {[
                    { field: "organization", label: "Organization", placeholder: "Select organization", icon: Building },
                    { field: "role", label: "Role", placeholder: "Select role", icon: Shield }
                  ].map(({ field, label, placeholder, icon: Icon }, i) => (
                    <div className="space-y-0.5" key={i}>
                      <Label htmlFor={field} className="text-gray-700 font-medium text-xs">
                        {label}
                      </Label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 z-10" />
                        <Select
                          value={formData[field as keyof typeof formData]}
                          onValueChange={(value) => handleInputChange(field, value)}
                        >
                          <SelectTrigger
                            className={`pl-9 h-8 text-xs bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-300 ${
                              errors[field] ? "border-red-400/50 focus:border-red-500/50" : ""
                            }`}
                          >
                            <SelectValue placeholder={placeholder} />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm">
                            {field === "organization" ? (
                              <>
                                <SelectItem value="Rand Water">
                                  Rand Water
                                </SelectItem>
                                <SelectItem value="Department of Water and Sanitation">
                                  Department of Water and Sanitation
                                </SelectItem>
                                <SelectItem value="Hartbeespoort Local">
                                  Hartbeespoort Local
                                </SelectItem>
                              </>
                            ) : (
                              <>
                                {/* If organization is "Hartbeespoort Local", only show Viewer role */}
                                {formData.organization === "Hartbeespoort Local" ? (
                                  <SelectItem value="Viewer">
                                    Viewer
                                  </SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="Manager">
                                      Manager
                                    </SelectItem>
                                    <SelectItem value="Engineer">
                                      Engineer
                                    </SelectItem>
                                    <SelectItem value="Viewer">
                                      Viewer
                                    </SelectItem>
                                  </>
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors[field] && (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          <span>{errors[field]}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {[
                    { field: "password", label: "Password", show: showPassword, setShow: setShowPassword },
                    { field: "confirmPassword", label: "Confirm", show: showConfirmPassword, setShow: setShowConfirmPassword }
                  ].map(({ field, label, show, setShow }, i) => (
                    <div className="space-y-0.5" key={i}>
                      <Label htmlFor={field} className="text-gray-700 font-medium text-xs">
                        {label}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <Input
                          id={field}
                          type={show ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData[field as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className={`pl-9 pr-9 h-8 text-xs bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-300 ${
                            errors[field] ? "border-red-400/50 focus:border-red-500/50" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {errors[field] && (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          <span>{errors[field]}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Professional Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-8 gradient-primary text-white font-medium text-xs rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-professional mt-1"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing Registration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <UserPlus className="w-5 h-5" />
                      <span>Create Professional Account</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Guest Mode Access */}
              <div className="mt-1.5">
                <Button
                  type="button"
                  onClick={onGuestMode}
                  variant="outline"
                  className="w-full h-6 bg-white/50 border-2 border-gray-300/50 hover:bg-white/70 hover:border-green-400/50 text-gray-700 hover:text-green-700 font-medium text-xs rounded-lg transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Continue as Guest</span>
                  </div>
                </Button>
                <p className="text-xs text-gray-600 text-center mt-0.5">
                  View the dashboard with limited features
                </p>
              </div>

              {/* Professional Footer */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-green-700 hover:text-green-800 font-medium underline decoration-green-700/30 hover:decoration-green-800 underline-offset-2 transition-all duration-200"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="mt-1.5 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-0.5 bg-green-100/80 backdrop-blur-sm text-green-800 rounded-lg text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Demo Mode: Immediate access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}