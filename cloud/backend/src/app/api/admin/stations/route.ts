import { NextRequest } from 'next/server';
import { db } from '@/db';
import { radioStations, programs, payments } from '@/db/schema';
import { validateAdminSession } from '@/lib/auth-session';
import { successResponse, errorResponse, ApiErrors } from '@/lib/api-response';
import { generateUniqueApiKey } from '@/lib/api-key';
import { eq, ilike, or, desc, asc, sql, count } from 'drizzle-orm';
import { z } from 'zod';

/**
 * GET /api/admin/stations
 * List all radio stations with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const offset = (page - 1) * pageSize;

    // Filters
    const status = searchParams.get('status') as 'active' | 'suspended' | null;
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(radioStations.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(radioStations.name, `%${search}%`),
          ilike(radioStations.contactEmail, `%${search}%`),
          ilike(radioStations.slug, `%${search}%`)
        )!
      );
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(radioStations)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    // Build order by clause
    let orderByClause;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'name':
        orderByClause = orderFn(radioStations.name);
        break;
      case 'subscriptionEnd':
        orderByClause = orderFn(radioStations.subscriptionDueDate);
        break;
      default:
        orderByClause = orderFn(radioStations.createdAt);
    }

    // Fetch stations with related counts
    const stations = await db
      .select({
        id: radioStations.id,
        name: radioStations.name,
        slug: radioStations.slug,
        address: radioStations.address,
        description: radioStations.description,
        musicGenre: radioStations.musicGenre,
        contactName: radioStations.contactName,
        contactPhone: radioStations.contactPhone,
        contactEmail: radioStations.contactEmail,
        streamUrlPrimary: radioStations.streamUrlPrimary,
        streamUrlBackup: radioStations.streamUrlBackup,
        apiKey: radioStations.apiKey,
        status: radioStations.status,
        subscriptionDueDate: radioStations.subscriptionDueDate,
        lastPaymentDate: radioStations.lastPaymentDate,
        branding: radioStations.branding,
        createdAt: radioStations.createdAt,
        updatedAt: radioStations.updatedAt,
      })
      .from(radioStations)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // Get counts for each station
    const stationsWithCounts = await Promise.all(
      stations.map(async (station) => {
        const [programCount] = await db
          .select({ count: count() })
          .from(programs)
          .where(eq(programs.stationId, station.id));

        const [paymentCount] = await db
          .select({ count: count() })
          .from(payments)
          .where(eq(payments.stationId, station.id));

        return {
          ...station,
          programCount: programCount.count,
          paymentCount: paymentCount.count,
        };
      })
    );

    return successResponse({
      items: stationsWithCounts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error listing stations:', error);
    return ApiErrors.internalError();
  }
}

/**
 * POST /api/admin/stations
 * Create a new radio station
 */

const createStationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  address: z.string().max(1000).optional(),
  description: z.string().max(1000).optional(),
  musicGenre: z.string().max(255).optional(),
  contactName: z.string().max(255).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email(),
  streamUrlPrimary: z.string().url(),
  streamUrlBackup: z.string().url().optional(),
  subscriptionDueDate: z.string().optional(),
  branding: z
    .object({
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    await validateAdminSession();

    const body = await request.json();

    // Validate request body
    const validationResult = createStationSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiErrors.validationError(validationResult.error.flatten().fieldErrors);
    }

    const data = validationResult.data;

    // Check if slug already exists
    const [existingSlug] = await db
      .select({ id: radioStations.id })
      .from(radioStations)
      .where(eq(radioStations.slug, data.slug))
      .limit(1);

    if (existingSlug) {
      return ApiErrors.duplicateSlug();
    }

    // Generate unique API key
    const apiKey = await generateUniqueApiKey();

    // Create station
    const [newStation] = await db
      .insert(radioStations)
      .values({
        name: data.name,
        slug: data.slug,
        address: data.address,
        description: data.description,
        musicGenre: data.musicGenre,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        streamUrlPrimary: data.streamUrlPrimary,
        streamUrlBackup: data.streamUrlBackup,
        apiKey,
        status: 'active',
        subscriptionDueDate: data.subscriptionDueDate || null,
        branding: data.branding || null,
      })
      .returning();

    return successResponse(
      {
        ...newStation,
        apiKey, // Show API key only on creation
      },
      201
    );
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return ApiErrors.unauthorized();
    }
    if (error.message === 'FORBIDDEN') {
      return ApiErrors.forbidden();
    }
    console.error('Error creating station:', error);
    return ApiErrors.internalError();
  }
}
