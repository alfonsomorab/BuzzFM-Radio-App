import { NextResponse } from 'next/server';

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
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
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
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
};
