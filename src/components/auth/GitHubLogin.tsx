import React, { useState } from 'react';
import { Github, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { signInWithGitHub } from '../../services/firebase';
import { GitHubService } from '../../services/GitHubService';

interface GitHubLoginProps {
  onAuthSuccess: (token: string) => void;
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
          onAuthSuccess(result.token);
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
    <div className="space-y-8">
      <div className="alert-success">
        <div className="flex items-start">
          <CheckCircle className="h-7 w-7 text-green-600 mt-1 flex-shrink-0" />
          <div className="ml-5">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Secure GitHub Authentication
            </h3>
            <div className="text-green-700">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
                  <span>Secure OAuth authentication</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
                  <span>Automatic token management</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
                  <span>No manual setup required</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
                  <span>Privacy-focused design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleGitHubLogin}
        disabled={isLoading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] disabled:transform-none shadow-lg hover:shadow-xl text-lg"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin h-6 w-6 mr-4" />
            Signing in...
          </>
        ) : (
          <>
            <Github className="h-6 w-6 mr-4" />
            Sign in with GitHub
          </>
        )}
      </button>

      {error && (
        <div className="alert-error">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="ml-3 text-red-800 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center space-y-3 bg-gray-50 rounded-xl p-6">
        <p className="font-medium">🔒 Your Privacy is Protected</p>
        <p>We don't store your data. All operations happen directly between your browser and GitHub.</p>
      </div>
    </div>
  );
};