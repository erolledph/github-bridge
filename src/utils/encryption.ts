import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || 'github-bridge-secure-key-2024';

export const encryptToken = (token: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return token; // Fallback to plain text if encryption fails
  }
};

export const decryptToken = (encryptedToken: string): string => {
  try {
    if (!encryptedToken || encryptedToken.trim() === '') {
      return null;
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption results in empty string, it failed
    if (!decrypted || decrypted.trim() === '') {
      console.warn('Token decryption resulted in empty string');
      return null;
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null; // Return null on decryption failure
  }
};