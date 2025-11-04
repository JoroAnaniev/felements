import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import hartiesLogo from 'figma:asset/a4a169eda86b4eac6d535e2155342bf3e96c0a94.png';

interface AccessRestrictionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  restrictedFeature: string;
  featureDescription: string;
}

export function AccessRestrictionDialog({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  restrictedFeature,
  featureDescription
}: AccessRestrictionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glass-card border-2 border-green-200/50 p-0 overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-200/30">
          <div className="flex items-center space-x-4">
            <img 
              src={hartiesLogo} 
              alt="Harties Action" 
              className="w-24 h-24 drop-shadow-sm"
            />
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span>Authentication Required</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Access to professional features requires verification
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Feature Information */}
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800">Restricted Feature</h4>
                <p className="text-sm text-amber-700 mt-1">
                  <span className="font-medium">{restrictedFeature}</span> - {featureDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Why Login Section */}
          <div className="space-y-4 mb-8">
            <h4 className="font-medium text-gray-800 flex items-center space-x-2">
              <User className="w-5 h-5 text-green-600" />
              <span>Why do I need to log in?</span>
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Data Security:</strong> Protect sensitive water quality information and system controls</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Role-Based Access:</strong> Ensure only qualified personnel can perform critical actions</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Audit Trail:</strong> Track all system interactions for compliance and safety</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onLogin}
              className="w-full h-12 gradient-primary text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="w-5 h-5" />
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>

            <Button
              onClick={onRegister}
              variant="outline"
              className="w-full h-12 bg-white/70 border-2 border-green-300/60 hover:bg-green-50/80 hover:border-green-400/60 text-green-700 hover:text-green-800 font-medium rounded-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Request Professional Access</span>
              </div>
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-all duration-300"
            >
              Continue as Guest
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50/80 px-8 py-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-600 text-center">
            Guest users can view the dashboard and map with limited functionality
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}