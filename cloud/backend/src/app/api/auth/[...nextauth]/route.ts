import { handlers } from '@/lib/auth-config';

/**
 * NextAuth.js v5 Route Handler
 *
 * Handles all authentication routes:
 * - POST /api/auth/callback/credentials - Login
 * - GET  /api/auth/session - Get session
 * - POST /api/auth/signout - Logout
 * - GET  /api/auth/providers - List providers
 * - GET  /api/auth/csrf - CSRF token
 */

export const { GET, POST } = handlers;
