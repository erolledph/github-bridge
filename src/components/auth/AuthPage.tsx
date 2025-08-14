import React, { useState } from 'react';
import { GitHubLogin } from './GitHubLogin';
import { Github } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm">
            <Github className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to GitHub Bridge
        </h2>
        <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
          Seamlessly upload your Bolt.new projects directly to GitHub repositories
        </p>
      </div>

      <GitHubLogin onAuthSuccess={onAuthSuccess} />
    </div>
  );
};
