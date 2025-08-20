import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser, getGitHubToken } from '../services/firebase';

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