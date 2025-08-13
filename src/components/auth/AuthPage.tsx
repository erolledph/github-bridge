import React, { useState } from 'react';
import { GitHubLogin } from './GitHubLogin';
import { ManualTokenEntry } from './ManualTokenEntry';
import { AuthToggle } from './AuthToggle';
import { Key, Github } from 'lucide-react';

export type AuthMethod = 'oauth' | 'manual';

interface AuthPageProps {
  onAuthSuccess: (token: string, method: AuthMethod) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('oauth');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {selectedMethod === 'oauth' ? (
            <Github className="h-12 w-12 text-green-600" />
          ) : (
            <Key className="h-12 w-12 text-green-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          GitHub Authentication
        </h2>
        <p className="mt-2 text-gray-600">
          Choose your preferred authentication method
        </p>
      </div>

      <AuthToggle
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      <div className="mt-6">
        {selectedMethod === 'oauth' ? (
          <GitHubLogin onAuthSuccess={onAuthSuccess} />
        ) : (
          <ManualTokenEntry onAuthSuccess={onAuthSuccess} />
        )}
      </div>
    </div>
  );
};