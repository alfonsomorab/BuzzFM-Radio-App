import { NextResponse } from 'next/server';

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Success response helper
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// Error response helper
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

// Common error responses
export const ApiErrors = {
  unauthorized: (message: string = 'Unauthorized') =>
    errorResponse(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden') =>
    errorResponse(message, 403, 'FORBIDDEN'),

  notFound: (message: string = 'Not found') =>
    errorResponse(message, 404, 'NOT_FOUND'),

  badRequest: (message: string = 'Bad request') =>
    errorResponse(message, 400, 'BAD_REQUEST'),

  internalError: (message: string = 'Internal server error') =>
    errorResponse(message, 500, 'INTERNAL_ERROR'),

  invalidApiKey: () =>
    errorResponse('Invalid or missing API key', 401, 'INVALID_API_KEY'),

  stationSuspended: () =>
    errorResponse('Station is suspended', 403, 'STATION_SUSPENDED'),

  // JWT-specific error responses
  tokenExpired: () =>
    errorResponse(
      'JWT token has expired. Please re-authenticate with your API key at /api/public/auth',
      401,
      'TOKEN_EXPIRED'
    ),

  invalidToken: (message: string = 'Invalid or malformed JWT token') =>
    errorResponse(message, 401, 'INVALID_TOKEN'),

  // Admin-specific error responses
  validationError: (details: any) =>
    errorResponse('Validation failed', 400, 'VALIDATION_ERROR', details),

  stationNotFound: () =>
    errorResponse('Station not found', 404, 'STATION_NOT_FOUND'),

  paymentNotFound: () =>
    errorResponse('Payment not found', 404, 'PAYMENT_NOT_FOUND'),

  emailSendFailed: (reason: string) =>
    errorResponse(`Email sending failed: ${reason}`, 500, 'EMAIL_SEND_FAILED'),

  duplicateApiKey: () =>
    errorResponse('API key already exists', 409, 'DUPLICATE_API_KEY'),

  duplicateSlug: () =>
    errorResponse('Station slug already exists', 409, 'DUPLICATE_SLUG'),

  cannotDeleteStation: (reason: string) =>
    errorResponse(`Cannot delete station: ${reason}`, 400, 'CANNOT_DELETE_STATION'),
};
