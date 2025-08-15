
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || 'github-bridge-secure-key-2024';

export const encryptToken = (token: string): string => {
  try {
    // Simple base64 encoding with a salt for basic obfuscation
    // Note: This is not cryptographically secure, but provides basic protection
    const saltedToken = SECRET_KEY + token + SECRET_KEY;
    return btoa(saltedToken);
  } catch (error) {
    console.error('Encryption error:', error);
    return token; // Fallback to plain text if encryption fails
  }
};

export const decryptToken = (encryptedToken: string): string => {
  try {
    // Decode base64 and remove salt
    const decoded = atob(encryptedToken);
    const secretKeyLength = SECRET_KEY.length;
    
    // Remove salt from both ends
    if (decoded.startsWith(SECRET_KEY) && decoded.endsWith(SECRET_KEY)) {
      return decoded.slice(secretKeyLength, -secretKeyLength);
    }
    
    return encryptedToken; // Fallback if format is unexpected
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedToken; // Fallback to encrypted text
  }
};