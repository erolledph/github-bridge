import React from 'react';
import { X, LogOut, Shield, Heart, ExternalLink, Github, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start space-x-6">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-24 h-24 rounded-full border-4 border-green-100 flex-shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100 flex-shrink-0 shadow-sm">
                <Shield size={36} className="text-green-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-2xl mb-3">
                {user?.displayName || 'GitHub User'}
              </h3>
              <div className="flex items-center space-x-3 mb-3">
                <Github size={18} className="text-green-600" />
                <span className="font-medium text-gray-600">GitHub OAuth</span>
              </div>
              {user?.email && (
                <p className="text-gray-500">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 space-y-5">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-5 py-5 text-left hover:bg-red-50 rounded-xl transition-colors group"
          >
            <div className="p-4 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors flex-shrink-0">
              <LogOut size={20} className="text-red-600" />
            </div>
            <div className="ml-5 flex-1">
              <p className="font-semibold text-gray-900 text-lg">Sign Out</p>
              <p className="text-gray-500">Sign out of your account</p>
            </div>
          </button>

          {/* Revoke GitHub Access */}
          <button
            onClick={handleRevokeAccess}
            className="w-full flex items-center px-5 py-5 text-left hover:bg-orange-50 rounded-xl transition-colors group"
          >
            <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors flex-shrink-0">
              <Shield size={20} className="text-orange-600" />
            </div>
            <div className="ml-5 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-lg">Revoke GitHub Access</p>
                <ExternalLink size={16} className="ml-2 text-gray-400" />
              </div>
              <p className="text-gray-500">Manage authorized applications</p>
            </div>
          </button>

          {/* Send Donation */}
          <button
            onClick={handleDonation}
            className="w-full flex items-center px-5 py-5 text-left hover:bg-blue-50 rounded-xl transition-colors group"
          >
            <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors flex-shrink-0">
              <Heart size={20} className="text-blue-600" />
            </div>
            <div className="ml-5 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-lg">Support Development</p>
                <ExternalLink size={16} className="ml-2 text-gray-400" />
              </div>
              <p className="text-gray-500">Send a donation via PayPal</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500 text-center font-medium">
            Your privacy is protected. We don't store any personal data.
          </p>
        </div>
      </div>
    </>
  );
};