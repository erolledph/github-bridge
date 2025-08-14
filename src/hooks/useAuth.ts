import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser } from '../services/firebase';
import { useLocalStorage } from './useLocalStorage';
import { encryptToken, decryptToken } from '../utils/encryption';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authMethod: 'oauth' | 'manual' | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    authMethod: null,
  });

  const [encryptedToken, setEncryptedToken, removeEncryptedToken] = useLocalStorage<string>('github_token_encrypted', '');
  const [authMethod, setAuthMethodStorage, removeAuthMethod] = useLocalStorage<'oauth' | 'manual' | null>('auth_method', null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is signed in via OAuth
        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: false,
          authMethod: 'oauth',
        }));
        setAuthMethodStorage('oauth');
      } else {
        // Check for manual token
        if (encryptedToken && authMethod === 'manual') {
          const decryptedToken = decryptToken(encryptedToken);
          // Add a small delay to ensure token is properly set
          setTimeout(() => {
            setAuthState({
              user: null,
              token: decryptedToken,
              isLoading: false,
              authMethod: 'manual',
            });
          }, 50);
        } else {
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            authMethod: null,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [encryptedToken, authMethod]);

  const setManualToken = (token: string) => {
    const encrypted = encryptToken(token);
    setEncryptedToken(encrypted);
    setAuthMethodStorage('manual');
    setAuthState({
      user: null,
      token,
      isLoading: false,
      authMethod: 'manual',
    });
  };

  const setOAuthToken = (token: string) => {
    setAuthState(prev => ({
      ...prev,
      token,
    }));
  };

  const logout = async () => {
    try {
      if (authState.authMethod === 'oauth') {
        await signOutUser();
      }
      
      // Clear all stored data
      removeEncryptedToken();
      removeAuthMethod();
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        authMethod: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...authState,
    setManualToken,
    setOAuthToken,
    logout,
  };
};