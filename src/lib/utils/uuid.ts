/**
 * UUID Generation Utility for Supabase
 * 
 * Generates RFC 4122 version 4 UUIDs
 * Required because Supabase doesn't auto-generate UUIDs like Prisma does
 */

/**
 * Generate a random UUID v4
 * Uses native crypto.randomUUID() when available, with fallback
 */
export function generateUUID(): string {
  // Modern browsers and Node 14.17+ have native support
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
