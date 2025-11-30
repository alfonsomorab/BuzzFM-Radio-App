import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

/**
 * JWT Configuration
 * Uses environment variables for security-sensitive configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '86400'; // 24 hours in seconds

// Convert secret to Uint8Array for jose library
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  stationId: string;
  status: 'active' | 'suspended';
}

/**
 * JWT verification result
 */
export interface JwtVerificationResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: 'TOKEN_EXPIRED' | 'INVALID_TOKEN' | 'MISSING_TOKEN';
}

/**
 * Generate JWT token for a radio station
 *
 * @param stationId - Unique station identifier
 * @param status - Station status (active/suspended)
 * @returns Signed JWT token string
 */
export async function generateJwt(
  stationId: string,
  status: 'active' | 'suspended'
): Promise<string> {
  try {
    const expirationTime = parseInt(JWT_EXPIRATION, 10);

    const token = await new SignJWT({
      stationId,
      status
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
      .sign(getSecretKey());

    return token;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate JWT token');
  }
}

/**
 * Verify and decode JWT token
 *
 * @param token - JWT token string to verify
 * @returns Verification result with payload if valid
 */
export async function verifyJwt(token: string): Promise<JwtVerificationResult> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    // Validate payload structure
    if (!payload.stationId || !payload.status) {
      return {
        valid: false,
        error: 'INVALID_TOKEN',
      };
    }

    // Type-safe payload extraction
    const jwtPayload: JwtPayload = {
      stationId: payload.stationId as string,
      status: payload.status as 'active' | 'suspended',
    };

    return {
      valid: true,
      payload: jwtPayload,
    };
  } catch (error: any) {
    // Handle specific JWT errors
    if (error?.code === 'ERR_JWT_EXPIRED') {
      return {
        valid: false,
        error: 'TOKEN_EXPIRED',
      };
    }

    // All other errors are invalid token
    return {
      valid: false,
      error: 'INVALID_TOKEN',
    };
  }
}

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer {jwt_token}"
 *
 * @param request - Next.js request object
 * @returns JWT token string or null if not found/invalid format
 */
export function extractJwtToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  // Check format: "Bearer {token}"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
