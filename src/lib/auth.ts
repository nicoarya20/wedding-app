import bcrypt from 'bcryptjs';

// JWT_SECRET and JWT_EXPIRATION are reserved for future server-side implementation
// Currently using demo token-based auth for client-side only

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Simple token generation using base64 (for client-side only)
 * Note: This is NOT secure like JWT, but works for demo purposes
 * For production, use server-side JWT or session-based auth
 */
export function generateToken(payload: { userId: string; username: string; role?: string }): string {
  // Simple base64 encoding (NOT secure, just for demo)
  const encoded = btoa(JSON.stringify({
    ...payload,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  }));
  return `demo_token_${encoded}`;
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): { userId: string; username: string; role?: string } | null {
  try {
    if (!token.startsWith('demo_token_')) return null;
    const encoded = token.replace('demo_token_', '');
    const decoded = JSON.parse(atob(encoded));
    
    // Check expiration
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('adminAuthToken');
}

/**
 * Save auth token to localStorage
 */
export function saveAuthToken(token: string): void {
  localStorage.setItem('adminAuthToken', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('adminAuthToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  const decoded = verifyToken(token);
  return decoded !== null;
}

/**
 * Get current user from token
 */
export function getCurrentUser(): { userId: string; username: string; role?: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  
  return verifyToken(token);
}
