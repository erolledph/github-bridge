import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser, getGitHubToken } from '../services/firebase';
import { useLocalStorage } from './useLocalStorage';
import { encryptToken, decryptToken } from '../utils/encryption';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  githubToken: string | null;
}

export const useAuth = () => {
  const [encryptedToken, setEncryptedToken, removeEncryptedToken] = useLocalStorage<string>('github_token_encrypted', '');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    githubToken: null,
  });

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        let githubToken: string | null = null;
        
        // First, try to get token from local storage
        if (encryptedToken) {
          try {
            const decryptedToken = decryptToken(encryptedToken);
            if (decryptedToken && decryptedToken !== encryptedToken) {
              githubToken = decryptedToken;
            }
          } catch (error) {
            console.warn('Failed to decrypt stored token:', error);
            // Remove invalid encrypted token
            removeEncryptedToken();
          }
        }
        
        // If no valid token in local storage, try to get from Firebase
        if (!githubToken) {
          githubToken = await getGitHubToken(user);
          
          // If we got a token from Firebase, store it in local storage
          if (githubToken) {
            try {
              const encrypted = encryptToken(githubToken);
              setEncryptedToken(encrypted);
            } catch (error) {
              console.warn('Failed to encrypt and store token:', error);
            }
          }
        }
        
        setAuthState(prev => ({
          ...prev,
          user,
          githubToken,
          isLoading: false,
        }));
      } else {
        // User signed out, clear stored token
        removeEncryptedToken();
        setAuthState({
          user: null,
          githubToken: null,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, [encryptedToken, setEncryptedToken, removeEncryptedToken]);

  const setGitHubToken = (token: string) => {
    try {
      const encrypted = encryptToken(token);
      setEncryptedToken(encrypted);
      setAuthState(prev => ({
        ...prev,
        githubToken: token,
      }));
    } catch (error) {
      console.warn('Failed to encrypt and store token:', error);
      // Still update the state even if encryption fails
      setAuthState(prev => ({
        ...prev,
        githubToken: token,
      }));
    }
  };
  const logout = async () => {
    try {
      // Clear stored token before signing out
      removeEncryptedToken();
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
    setGitHubToken,
  };
};