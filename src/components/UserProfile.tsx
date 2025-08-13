import React from 'react';
import { User, LogOut, Key, Github, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user, authMethod, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user && authMethod !== 'manual') {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">
                {user?.displayName || 'GitHub User'}
              </p>
              <div className="flex items-center space-x-1">
                {authMethod === 'oauth' ? (
                  <Github size={14} className="text-green-600" />
                ) : (
                  <Key size={14} className="text-blue-600" />
                )}
                <Shield size={14} className="text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {authMethod === 'oauth' ? 'GitHub OAuth' : 'Manual Token'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </button>
      </div>
    </div>
  );
};