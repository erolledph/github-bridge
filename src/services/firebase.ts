import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GithubAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// GitHub provider
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  'allow_signup': 'true'
});

export const signInWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    return {
      user: result.user,
      token: token || null
    };
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
};

export const getGitHubToken = async (user: any) => {
  try {
    // Try to get the token from the user's auth result
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.github_access_token || null;
  } catch (error) {
    console.error('Failed to get GitHub token:', error);
    return null;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};