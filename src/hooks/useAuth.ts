import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser, getGitHubToken } from '../services/firebase';
import { useLocalStorage } from './useLocalStorage';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  githubToken: string | null;
}

export const useAuth = () => {
  const [, , removeStoredToken] = useLocalStorage<string>('github_token', '');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    githubToken: null,
  });

  // Force logout on page refresh/reload
  useEffect(() => {
    const forceLogoutOnRefresh = async () => {
      try {
        // Clear Firebase session
        await signOutUser();
        // Clear stored GitHub token
        removeStoredToken();
        console.log('Forced logout on page refresh completed');
      } catch (error) {
        console.error('Error during forced logout:', error);
        // Even if signOut fails, still clear the token
        removeStoredToken();
      }
    };

    // Execute immediately on mount (page load/refresh)
    forceLogoutOnRefresh();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // Try to get GitHub token
        const githubToken = await getGitHubToken(user);
        setAuthState(prev => ({
          ...prev,
          user,
          githubToken,
          isLoading: false,
        }));
      } else {
        setAuthState({
          user: null,
          githubToken: null,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOutUser();
      removeStoredToken();
      
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
    logout,
  };
};