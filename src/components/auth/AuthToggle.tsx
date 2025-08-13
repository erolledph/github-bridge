import React from 'react';
import { Github, Key } from 'lucide-react';
import { AuthMethod } from './AuthPage';

interface AuthToggleProps {
  selectedMethod: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
}

export const AuthToggle: React.FC<AuthToggleProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1.5">
      <button
        onClick={() => onMethodChange('oauth')}
        className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
          selectedMethod === 'oauth'
            ? 'bg-white text-green-600 shadow-md transform scale-[1.02]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Github size={18} className="mr-2" />
        GitHub Login
      </button>
      <button
        onClick={() => onMethodChange('manual')}
        className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
          selectedMethod === 'manual'
            ? 'bg-white text-green-600 shadow-md transform scale-[1.02]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Key size={18} className="mr-2" />
        Manual Token
      </button>
    </div>
  );
};