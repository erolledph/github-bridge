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
  // Get access to localStorage functions for GitHub token management
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
        // Clear Firebase authentication
        await signOutUser();
        
        // Clear stored GitHub token
        removeStoredToken();
        
        // Ensure auth state is reset
        setAuthState({
          user: null,
          githubToken: null,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error during forced logout:', error);
        // Even if logout fails, clear the local state
        setAuthState({
          user: null,
          githubToken: null,
          isLoading: false,
        });
      }
    };

    // Execute the forced logout immediately on component mount
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