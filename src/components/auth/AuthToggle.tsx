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
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onMethodChange('oauth')}
        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
          selectedMethod === 'oauth'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Github size={16} className="mr-2" />
        GitHub Login
      </button>
      <button
        onClick={() => onMethodChange('manual')}
        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
          selectedMethod === 'manual'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Key size={16} className="mr-2" />
        Manual Token
      </button>
    </div>
  );
};