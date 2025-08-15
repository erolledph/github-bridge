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
  apiKey: "AIzaSyCQRb3HZoIm1pY0t2y0fkQlT7S8O73qFug",
  authDomain: "github-bridge-bolt.firebaseapp.com",
  projectId: "github-bridge-bolt",
  storageBucket: "github-bridge-bolt.firebasestorage.app",
  messagingSenderId: "1021410050918",
  appId: "1:1021410050918:web:0ee2d32b8f7a71fba8bea7",
  measurementId: "G-L9D6L1MBLJ"
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