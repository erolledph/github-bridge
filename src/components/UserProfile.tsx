import React from 'react';
import { User } from 'lucide-react';
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
        className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-center">
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
        </div>
      </button>

      <UserProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};