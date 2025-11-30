import { auth } from './auth-config';
import { NextRequest } from 'next/server';

/**
 * Session validation utilities for API routes
 * Provides role-based access control for admin and station endpoints
 */

/**
 * Admin user session structure
 */
export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

/**
 * Station user session structure
 */
export interface StationSession {
  id: string;
  email: string;
  name: string;
  role: 'station';
  stationId: string;
}

/**
 * Validate that the current session is authenticated
 * Throws error if not authenticated
 */
export async function validateSession(request?: NextRequest): Promise<{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'station';
  stationId?: string | null;
}> {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('UNAUTHORIZED');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    stationId: session.user.stationId,
  };
}

/**
 * Validate that the current session belongs to an admin user
 * Throws 401 if not authenticated, 403 if not admin
 */
export async function validateAdminSession(request?: NextRequest): Promise<AdminSession> {
  const session = await validateSession(request);

  if (session.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: 'admin',
  };
}

/**
 * Validate that the current session belongs to a station user
 * Throws 401 if not authenticated, 403 if not station user
 */
export async function validateStationSession(request?: NextRequest): Promise<StationSession> {
  const session = await validateSession(request);

  if (session.role !== 'station') {
    throw new Error('FORBIDDEN');
  }

  if (!session.stationId) {
    throw new Error('FORBIDDEN');
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: 'station',
    stationId: session.stationId,
  };
}

/**
 * Helper to check if user is authenticated without throwing
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await validateSession();
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to check if user is admin without throwing
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await validateAdminSession();
    return true;
  } catch {
    return false;
  }
}
