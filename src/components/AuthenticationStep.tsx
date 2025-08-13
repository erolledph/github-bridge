import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, AlertCircle, CheckCircle, Loader, Trash2 } from 'lucide-react';
import { GitHubService } from '../services/GitHubService';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AuthenticationStepProps {
  onTokenValidated: (token: string, githubService: GitHubService) => void;
}

export function AuthenticationStep({ onTokenValidated }: AuthenticationStepProps) {
  const [storedToken, setStoredToken, removeStoredToken] = useLocalStorage<string>('github_token', '');
  const [token, setToken] = useState(storedToken);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    // Check if we have a stored token and auto-validate it
    if (storedToken && storedToken.trim()) {
      setHasStoredToken(true);
      setToken(storedToken);
      // Auto-validate the stored token
      validateStoredToken(storedToken);
    }
  }, [storedToken]);

  const validateStoredToken = async (tokenToValidate: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const githubService = new GitHubService(tokenToValidate);
      const validation = await githubService.validateToken();

      if (validation.valid && validation.username) {
        onTokenValidated(tokenToValidate, githubService);
      } else {
        // Token is invalid, remove it from storage
        removeStoredToken();
        setHasStoredToken(false);
        setError('Stored token is invalid or has insufficient permissions. Please enter a new token.');
      }
    } catch (err) {
      // Token validation failed, but don't remove it yet - might be network issue
      setError('Failed to validate stored token. Please check your internet connection or enter a new token.');
    } finally {
      setIsValidating(false);
    }
  };
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
        // Store the valid token
        setStoredToken(token.trim());
        setHasStoredToken(true);
        onTokenValidated(token.trim(), githubService);
      } else {
        setError('Invalid token or insufficient permissions. Please check your token and ensure it has the required scopes.');
      }
    } catch (err) {
      setError('Failed to validate token. Please check your internet connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearToken = () => {
    removeStoredToken();
    setToken('');
    setHasStoredToken(false);
    setError(null);
  };
  const requiredScopes = ['repo', 'user:email'];
  const tokenUrl = `https://github.com/settings/tokens/new?scopes=${requiredScopes.join(',')}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="mx-auto h-12 w-12 mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          GitHub Authentication
        </h2>
        <p className="mt-2 text-gray-600">
          {hasStoredToken 
            ? 'Validating your stored GitHub token...' 
            : 'Enter your GitHub Personal Access Token to get started'}
        </p>
      </div>

      {hasStoredToken && !isValidating && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="ml-2 text-sm text-green-800">
                Using stored GitHub token
              </p>
            </div>
            <button
              onClick={handleClearToken}
              className="text-green-600 hover:text-green-700 text-sm flex items-center"
            >
              <Trash2 size={14} className="mr-1" />
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              Required Token Scopes
            </h3>
            <div className="mt-1 text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">repo</code> - Full control of private repositories</li>
                <li><code className="bg-gray-100 px-1 rounded">user:email</code> - Access to user email addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {(!hasStoredToken || error) && (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            GitHub Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              disabled={isValidating}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-green-600 hover:text-green-700"
              disabled={isValidating}
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isValidating || !token.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isValidating ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate Token
              </>
            )}
          </button>
          
          <a
            href={tokenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Create New Token
          </a>
        </div>
      </form>
      )}

      {error && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <p className="ml-2 text-sm text-gray-800">
                {error}
              </p>
            </div>
            {hasStoredToken && (
              <button
                onClick={handleClearToken}
                className="text-red-600 hover:text-red-700 text-sm flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Clear Token
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Your token is stored locally in your browser for convenience and is never sent to our servers.</p>
        <p>For enhanced security, consider using fine-grained personal access tokens.</p>
      </div>
    </div>
  );
}