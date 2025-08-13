import React from 'react';
import { User, Key, Github, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfileModal } from './UserProfileModal';

export const UserProfile: React.FC = () => {
  const { user, authMethod } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (!user && authMethod !== 'manual') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-full border-2 border-green-100 group-hover:border-green-200 transition-colors"
            />
          ) : (
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100 group-hover:border-green-200 transition-colors">
              <User size={22} className="text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                {user?.displayName || 'GitHub User'}
              </p>
              <div className="flex items-center space-x-2">
                {authMethod === 'oauth' ? (
                  <Github size={16} className="text-green-600 group-hover:text-green-700 transition-colors" />
                ) : (
                  <Key size={16} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
                )}
                <Shield size={16} className="text-gray-400 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mt-1">
              {authMethod === 'oauth' ? 'GitHub OAuth' : 'Manual Token'}
            </p>
          </div>
          
          <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors ml-2" />
        </div>
      </button>

      <UserProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};