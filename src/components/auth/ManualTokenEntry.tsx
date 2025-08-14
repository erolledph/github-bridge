import React, { useState } from 'react';
import { Key, ExternalLink, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { GitHubService } from '../../services/GitHubService';
import { AuthMethod } from './AuthPage';

interface ManualTokenEntryProps {
  onAuthSuccess: (token: string, method: AuthMethod) => void;
}

export const ManualTokenEntry: React.FC<ManualTokenEntryProps> = ({ onAuthSuccess }) => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const requiredScopes = ['repo', 'user:email'];
  const tokenUrl = `https://github.com/settings/tokens/new?scopes=${requiredScopes.join(',')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a GitHub Personal Access Token');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const githubService = new GitHubService(token.trim());
      const validation = await githubService.validateToken();

      if (validation.valid && validation.username) {
        setIsValidating(false);
        onAuthSuccess(token.trim(), 'manual');
      } else {
        setIsValidating(false);
        setError('Invalid token or insufficient permissions. Please check your token and ensure it has the required scopes.');
      }
    } catch (err) {
      setIsValidating(false);
      setError('Failed to validate token. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-4">
            <h3 className="text-base font-semibold text-blue-800 mb-2">
              Required Token Scopes
            </h3>
            <div className="text-sm text-blue-700">
              <ul className="space-y-2">
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                  <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">repo</code>
                  <span class="ml-2">- Full control of private repositories</span>
                </li>
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                  <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">user:email</code>
                  <span class="ml-2">- Access to user email addresses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            GitHub Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-4 pr-12 border rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 bg-white border-gray-300 text-gray-900 placeholder-gray-500 font-mono text-sm"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              disabled={isValidating}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isValidating}
            >
              {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isValidating || !token.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] disabled:transform-none"
          >
            {isValidating ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-3" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-3" />
                Validate Token
              </>
            )}
          </button>
          
          <a
            href={tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transform hover:scale-[1.02]"
          >
            <ExternalLink className="h-5 w-5 mr-3" />
            Create New Token
          </a>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="ml-2 text-sm text-red-800">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center space-y-2 bg-gray-50 rounded-lg p-4">
        <p>Your token is encrypted and stored locally in your browser for convenience.</p>
        <p>For enhanced security, consider using fine-grained personal access tokens.</p>
      </div>
    </div>
  );
};