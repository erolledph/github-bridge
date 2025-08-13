import React from 'react';
import { X, LogOut, Shield, Heart, ExternalLink, Github, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, authMethod, logout } = useAuth();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRevokeAccess = () => {
    window.open('https://github.com/settings/applications', '_blank');
  };

  const handleDonation = () => {
    const paypalUrl = `https://www.paypal.com/paypalme/cedrickvillarin`;
    window.open(paypalUrl, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-16 h-16 rounded-full border-2 border-green-100"
              />
            ) : (
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                <Shield size={28} className="text-green-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {user?.displayName || 'GitHub User'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {authMethod === 'oauth' ? (
                  <>
                    <Github size={16} className="text-green-600" />
                    <span className="text-sm text-gray-600">GitHub OAuth</span>
                  </>
                ) : (
                  <>
                    <Key size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-600">Manual Token</span>
                  </>
                )}
              </div>
              {user?.email && (
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <LogOut size={18} className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Sign Out</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
          </button>

          {/* Revoke GitHub Access */}
          {authMethod === 'oauth' && (
            <button
              onClick={handleRevokeAccess}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Shield size={18} className="text-orange-600" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <p className="font-medium text-gray-900">Revoke GitHub Access</p>
                  <ExternalLink size={14} className="ml-2 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Manage authorized applications</p>
              </div>
            </button>
          )}

          {/* Send Donation */}
          <button
            onClick={handleDonation}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Heart size={18} className="text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center">
                <p className="font-medium text-gray-900">Support Development</p>
                <ExternalLink size={14} className="ml-2 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Send a donation via PayPal</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            Your privacy is protected. We don't store any personal data.
          </p>
        </div>
      </div>
    </>
  );
};