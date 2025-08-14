import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserProfileModal } from './UserProfileModal';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group transform hover:scale-105"
      >
        <div className="flex items-center justify-center">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-14 h-14 rounded-full border-3 border-green-100 group-hover:border-green-200 transition-colors"
            />
          ) : (
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center border-3 border-green-100 group-hover:border-green-200 transition-colors m-1">
              <User size={24} className="text-green-600 group-hover:text-green-700 transition-colors" />
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