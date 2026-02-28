import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'fallback-secret-change-this-in-production';
const JWT_EXPIRATION = '7d';

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
 * Generate a JWT token
 */
export function generateToken(payload: { userId: string; username: string; role?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { userId: string; username: string; role?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role?: string };
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
