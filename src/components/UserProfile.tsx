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
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-full border-2 border-green-100"
            />
          ) : (
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
              <User size={22} className="text-green-600" />
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-3">
              <p className="font-semibold text-gray-900">
                {user?.displayName || 'GitHub User'}
              </p>
              <div className="flex items-center space-x-2">
                {authMethod === 'oauth' ? (
                  <Github size={16} className="text-green-600" />
                ) : (
                  <Key size={16} className="text-blue-600" />
                )}
                <Shield size={16} className="text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {authMethod === 'oauth' ? 'GitHub OAuth' : 'Manual Token'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};