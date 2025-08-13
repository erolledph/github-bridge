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
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {selectedMethod === 'oauth' ? (
            <div className="p-4 bg-green-50 rounded-full">
              <Github className="h-12 w-12 text-green-600" />
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-full">
              <Key className="h-12 w-12 text-green-600" />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Bolt to GitHub
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Choose your preferred authentication method
        </p>
      </div>

      <AuthToggle
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      <div className="mt-8">
        {selectedMethod === 'oauth' ? (
          <GitHubLogin onAuthSuccess={onAuthSuccess} />
        ) : (
          <ManualTokenEntry onAuthSuccess={onAuthSuccess} />
        )}
      </div>
    </div>
  );
};
