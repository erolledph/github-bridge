import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser } from '../services/firebase';
import { useLocalStorage } from './useLocalStorage';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  githubToken: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    githubToken: null,
  });
  
  const [storedGitHubToken, setStoredGitHubToken] = useLocalStorage<string | null>('github_access_token', null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setAuthState(prev => ({
          ...prev,
          user,
          githubToken: storedGitHubToken,
          isLoading: false,
        }));
      } else {
        setAuthState({
          user: null,
          githubToken: null,
          isLoading: false,
        });
        // Clear stored token when user logs out
        setStoredGitHubToken(null);
      }
    });

    return () => unsubscribe();
  }, [storedGitHubToken, setStoredGitHubToken]);

  const setGitHubToken = (token: string | null) => {
    setStoredGitHubToken(token);
    setAuthState(prev => ({
      ...prev,
      githubToken: token,
    }));
  };

  const logout = async () => {
    try {
      await signOutUser();
      
      // Clear stored GitHub token
      setStoredGitHubToken(null);
      
      setAuthState({
        user: null,
        githubToken: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...authState,
    setGitHubToken,
    logout,
  };
};