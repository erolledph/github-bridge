import React, { useState } from 'react';
import { GitHubLogin } from './GitHubLogin';
import { Github, AlertTriangle } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (token: string) => void;
  tokenError?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, tokenError = false }) => {
  return (
    <div className="space-y-10">
      {tokenError && (
        <div className="alert-error">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-red-800 font-medium">
                GitHub Token Validation Failed
              </p>
              <p className="text-red-700 mt-1">
                Your GitHub token could not be validated. This may happen if the token has expired, been revoked, or lost required permissions. Please sign in again to refresh your authentication.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm">
            <Github className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {tokenError ? 'Re-authenticate Required' : 'Welcome to GitHub Bridge'}
        </h2>
        <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
          {tokenError 
            ? 'Please sign in again to continue using GitHub Bridge'
            : 'Seamlessly upload your Bolt.new projects directly to GitHub repositories'
          }
        </p>
      </div>

      <GitHubLogin onAuthSuccess={onAuthSuccess} />
    </div>
  );
};
