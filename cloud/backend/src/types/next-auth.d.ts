import { DefaultSession } from 'next-auth';

/**
 * TypeScript type augmentation for NextAuth.js
 * Extends the built-in session and JWT types with custom user fields
 */

declare module 'next-auth' {
  /**
   * Extended User type with role and stationId
   */
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'station';
    stationId?: string | null;
  }

  /**
   * Extended Session type
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'station';
      stationId?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT type
   */
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'station';
    stationId?: string | null;
  }
}
