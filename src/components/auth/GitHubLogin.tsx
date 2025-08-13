import React, { useState } from 'react';
import { Github, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { signInWithGitHub } from '../../services/firebase';
import { GitHubService } from '../../services/GitHubService';
import { AuthMethod } from './AuthPage';

interface GitHubLoginProps {
  onAuthSuccess: (token: string, method: AuthMethod) => void;
}

export const GitHubLogin: React.FC<GitHubLoginProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGitHub();
      
      if (result.token) {
        // Validate the token with GitHub API
        const githubService = new GitHubService(result.token);
        const validation = await githubService.validateToken();
        
        if (validation.valid) {
          onAuthSuccess(result.token, 'oauth');
        } else {
          setError('GitHub authentication succeeded but token validation failed. Please try again.');
        }
      } else {
        setError('Failed to obtain access token from GitHub. Please try again.');
      }
    } catch (error: any) {
      console.error('GitHub login error:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('GitHub login failed. Please try again or use manual token entry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start">
          <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="ml-4">
            <h3 className="text-base font-semibold text-green-800 mb-2">
              Recommended Method
            </h3>
            <div className="text-sm text-green-700">
              <ul className="space-y-2">
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-green-600 rounded-full mr-3"></span>
                <li>Secure OAuth authentication</li>
                </li>
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-green-600 rounded-full mr-3"></span>
                <li>Automatic token management</li>
                </li>
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-green-600 rounded-full mr-3"></span>
                <li>No manual token creation needed</li>
                </li>
                <li class="flex items-center">
                  <span class="w-1.5 h-1.5 bg-green-600 rounded-full mr-3"></span>
                <li>Seamless user experience</li>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleGitHubLogin}
        disabled={isLoading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] disabled:transform-none"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin h-5 w-5 mr-3" />
            Signing in...
          </>
        ) : (
          <>
            <Github className="h-5 w-5 mr-3" />
            Sign in with GitHub
          </>
        )}
      </button>

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
        <p>By signing in, you agree to grant the necessary permissions for repository access.</p>
        <p>Your GitHub token will be securely managed and never stored on our servers.</p>
      </div>
    </div>
  );
};