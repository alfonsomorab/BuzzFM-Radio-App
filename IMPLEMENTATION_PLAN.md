# Radio Streaming Management Platform - Implementation Plan

**Generated:** 2025-11-29  
**Technology Stack:** Next.js (TypeScript), PostgreSQL, Drizzle ORM, Flutter  
**Architecture:** Multi-tenant radio station management platform

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema Design](#database-schema-design)
4. [Backend Implementation (Next.js)](#backend-implementation-nextjs)
5. [Admin Dashboard](#admin-dashboard)
6. [Station User Dashboard](#station-user-dashboard)
7. [Mobile App Integration](#mobile-app-integration)
8. [Phase-by-Phase Implementation Tasks](#phase-by-phase-implementation-tasks)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Considerations](#deployment-considerations)

---

## Project Overview

### Current State
- ✅ Flutter mobile app (fully functional, clean architecture, background audio, notifications)
- ✅ Environment-based configuration (.env)
- ✅ MVVM + Clean Architecture pattern
- ❌ No backend exists (using mock data)
- ❌ No web dashboards exist

### Vision
A comprehensive platform where radio streamers (admins) can:
- Register and manage multiple radio station clients
- Generate API keys for each station
- Create custom mobile apps from template for each client
- Track subscriptions and payments
- Enable station users to manage their own content

### Key User Roles

#### Admin (Radio Streamer/Platform Owner)
- Register new radio stations
- Generate/manage API keys
- Update station information
- Suspend/activate stations
- Manage subscription payments
- Send payment reminders

#### Station User (Radio Station Manager)
- Login to station-specific dashboard
- Manage program schedules
- View listener analytics
- Update station branding
- View payment history

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flutter Mobile Apps                           │
│              (One per station, template-based)                   │
└────────────────┬────────────────────────────────────────────────┘
                 │ API Key Auth
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Backend (API)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ API Routes   │  │ Middleware   │  │  Services    │          │
│  │ /api/public  │  │ - Auth       │  │ - Email      │          │
│  │ /api/admin   │  │ - API Key    │  │ - Analytics  │          │
│  │ /api/station │  │ - Rate Limit │  │ - Payments   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Drizzle ORM)                   │
│  Tables: stations, users, programs, payments, analytics, etc.   │
└─────────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Dashboards                             │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Admin Dashboard     │  │ Station Dashboard    │            │
│  │  /admin/*            │  │ /station/*           │            │
│  │  - Register stations │  │ - Manage schedules   │            │
│  │  - Manage payments   │  │ - View analytics     │            │
│  │  - Send emails       │  │ - Update branding    │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Decisions

**Backend & Frontend:** Next.js 14+ (App Router)
- Single codebase for API and dashboards
- Server-side rendering for dashboards
- API routes for mobile app
- TypeScript for type safety

**Database:** PostgreSQL + Drizzle ORM
- Relational data (stations, users, schedules)
- Strong typing with Drizzle
- Migration support
- Better performance than MongoDB for this use case

**Authentication:**
- Admin/Station Users: NextAuth.js (JWT + sessions)
- Mobile Apps: API key authentication (Bearer token)

**Email:** Nodemailer + SMTP
- Subscription reminders
- Station notifications
- User invitations

**State Management (Frontend):**
- React Server Components (default)
- Client components where needed
- SWR or TanStack Query for data fetching

**UI Framework:** shadcn/ui
- Modern, customizable components
- Built on Radix UI + Tailwind
- Copy-paste approach (no bloat)

---

## Database Schema Design

### Schema Overview (Drizzle ORM)

```typescript
// File: src/db/schema.ts

import { pgTable, text, timestamp, boolean, integer, varchar, uuid, json, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'station_user']);
export const stationStatusEnum = pgEnum('station_status', ['active', 'suspended', 'trial']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue']);

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('station_user'),
  stationId: uuid('station_id').references(() => stations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  station: one(stations, {
    fields: [users.stationId],
    references: [stations.id],
  }),
}));

// ============================================================================
// STATIONS TABLE
// ============================================================================

export const stations = pgTable('stations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  
  // Contact Information
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  
  // Streaming Configuration
  streamUrlPrimary: text('stream_url_primary').notNull(),
  streamUrlBackup: text('stream_url_backup'),
  streamBitrate: integer('stream_bitrate').default(128),
  
  // API & Security
  apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
  
  // Status & Subscription
  status: stationStatusEnum('status').notNull().default('trial'),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  nextPaymentDue: timestamp('next_payment_due'),
  monthlyFee: integer('monthly_fee').default(0), // in cents
  
  // Branding
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#3B82F6'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#1E40AF'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stationsRelations = relations(stations, ({ many }) => ({
  users: many(users),
  programs: many(programs),
  payments: many(payments),
  analytics: many(analytics),
}));

// ============================================================================
// PROGRAMS TABLE (Schedule)
// ============================================================================

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  stationId: uuid('station_id').notNull().references(() => stations.id, { onDelete: 'cascade' }),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  host: varchar('host', { length: 255 }),
  imageUrl: text('image_url'),
  
  // Schedule
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
  
  // Metadata
  tags: json('tags').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const programsRelations = relations(programs, ({ one }) => ({
  station: one(stations, {
    fields: [programs.stationId],
    references: [stations.id],
  }),
}));

// ============================================================================
// PAYMENTS TABLE
// ============================================================================

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  stationId: uuid('station_id').notNull().references(() => stations.id, { onDelete: 'cascade' }),
  
  amount: integer('amount').notNull(), // in cents
  status: paymentStatusEnum('status').notNull().default('pending'),
  
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  station: one(stations, {
    fields: [payments.stationId],
    references: [stations.id],
  }),
}));

// ============================================================================
// ANALYTICS TABLE
// ============================================================================

export const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  stationId: uuid('station_id').notNull().references(() => stations.id, { onDelete: 'cascade' }),
  
  // Metrics
  date: timestamp('date').notNull(),
  listenerCount: integer('listener_count').default(0),
  peakListeners: integer('peak_listeners').default(0),
  totalListeningTime: integer('total_listening_time').default(0), // in seconds
  
  // Geography (simplified)
  geography: json('geography').$type<{ country: string; count: number }[]>().default([]),
  
  // Platform distribution
  platformDistribution: json('platform_distribution').$type<{ platform: string; count: number }[]>().default([]),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyticsRelations = relations(analytics, ({ one }) => ({
  station: one(stations, {
    fields: [analytics.stationId],
    references: [stations.id],
  }),
}));

// ============================================================================
// SETTINGS TABLE (App-wide configuration)
// ============================================================================

export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: json('value').notNull(),
  description: text('description'),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Migration Strategy

1. **Development Migrations:**
   ```bash
   npm run db:generate  # Generate migration files
   npm run db:migrate   # Apply migrations
   npm run db:studio    # View database (Drizzle Studio)
   ```

2. **Production Migrations:**
   - Store migrations in version control
   - Apply via CI/CD pipeline
   - Use transaction-based migrations
   - Backup database before major changes

3. **Seed Data Strategy:**
   ```typescript
   // src/db/seed.ts
   - Create admin user
   - Create 1-2 sample stations
   - Create sample programs
   - Create sample analytics data
   ```

### Indexing Strategy

```typescript
// Add to schema for performance
export const stationsIndex = index('stations_slug_idx').on(stations.slug);
export const stationsApiKeyIndex = index('stations_api_key_idx').on(stations.apiKey);
export const programsStationIdIndex = index('programs_station_id_idx').on(programs.stationId);
export const programsDayOfWeekIndex = index('programs_day_of_week_idx').on(programs.dayOfWeek);
export const analyticsStationDateIndex = index('analytics_station_date_idx').on(analytics.stationId, analytics.date);
```

---

## Backend Implementation (Next.js)

### Project Structure

```
radio-app/
├── backend/                          # Next.js backend + dashboards
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── public/           # Public mobile API (API key auth)
│   │   │   │   │   ├── config/route.ts
│   │   │   │   │   ├── schedule/route.ts
│   │   │   │   │   └── analytics/route.ts
│   │   │   │   ├── admin/            # Admin dashboard API
│   │   │   │   │   ├── stations/route.ts
│   │   │   │   │   ├── payments/route.ts
│   │   │   │   │   └── email/route.ts
│   │   │   │   └── station/          # Station user API
│   │   │   │       ├── programs/route.ts
│   │   │   │       ├── analytics/route.ts
│   │   │   │       └── branding/route.ts
│   │   │   ├── admin/                # Admin dashboard pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── stations/
│   │   │   │   ├── payments/
│   │   │   │   └── settings/
│   │   │   ├── station/              # Station dashboard pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── schedule/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   └── auth/                 # Auth pages
│   │   │       ├── signin/
│   │   │       └── signup/
│   │   ├── components/               # Shared components
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── admin/
│   │   │   ├── station/
│   │   │   └── shared/
│   │   ├── db/                       # Database
│   │   │   ├── schema.ts
│   │   │   ├── index.ts
│   │   │   └── migrations/
│   │   ├── lib/                      # Utilities
│   │   │   ├── auth.ts
│   │   │   ├── db.ts
│   │   │   ├── email.ts
│   │   │   └── utils.ts
│   │   ├── middleware.ts             # Next.js middleware
│   │   └── types/                    # TypeScript types
│   ├── public/
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local
```

### API Routes Architecture

#### 1. Public API (Mobile Apps) - `/api/public/*`

**Authentication:** API Key (Bearer token)

```typescript
// src/app/api/public/config/route.ts
export async function GET(request: Request) {
  // Middleware validates API key
  const station = request.station; // Injected by middleware
  
  return Response.json({
    stationId: station.id,
    name: station.name,
    status: station.status,
    streamUrls: {
      primary: station.streamUrlPrimary,
      backup: station.streamUrlBackup,
    },
    branding: {
      logoUrl: station.logoUrl,
      primaryColor: station.primaryColor,
      secondaryColor: station.secondaryColor,
    },
  });
}
```

```typescript
// src/app/api/public/schedule/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString();
  
  const station = request.station;
  
  // Get programs for the specified date
  const programs = await db.query.programs.findMany({
    where: eq(programs.stationId, station.id),
    orderBy: [programs.dayOfWeek, programs.startTime],
  });
  
  return Response.json({ programs });
}
```

#### 2. Admin API - `/api/admin/*`

**Authentication:** NextAuth.js session (admin role)

```typescript
// src/app/api/admin/stations/route.ts
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  // Generate API key
  const apiKey = generateApiKey();
  
  // Create station
  const [newStation] = await db.insert(stations).values({
    ...body,
    apiKey,
    status: 'trial',
  }).returning();
  
  return Response.json({ station: newStation });
}
```

#### 3. Station API - `/api/station/*`

**Authentication:** NextAuth.js session (station_user role)

```typescript
// src/app/api/station/programs/route.ts
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== 'station_user') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const stationId = session.user.stationId;
  
  const [newProgram] = await db.insert(programs).values({
    ...body,
    stationId,
  }).returning();
  
  return Response.json({ program: newProgram });
}
```

### Middleware Implementation

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public API - API Key authentication
  if (pathname.startsWith('/api/public')) {
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }
    
    // Validate API key and fetch station
    const station = await validateApiKey(apiKey);
    
    if (!station) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    if (station.status === 'suspended') {
      return NextResponse.json({ 
        error: 'Station suspended', 
        message: 'Please contact support' 
      }, { status: 403 });
    }
    
    // Inject station into request for route handlers
    const response = NextResponse.next();
    response.headers.set('x-station-id', station.id);
    return response;
  }
  
  // Admin/Station dashboard - Session authentication
  // Handled by NextAuth.js
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/station/:path*'],
};
```

### Authentication Setup (NextAuth.js)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        
        if (!user) {
          return null;
        }
        
        const isValid = await compare(credentials.password, user.passwordHash);
        
        if (!isValid) {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          stationId: user.stationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.stationId = user.stationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.stationId = token.stationId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };
```

### Email Service (Nodemailer)

```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPaymentReminder(station: Station, daysUntilDue: number) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: station.email,
    subject: `Payment Reminder - ${station.name}`,
    html: `
      <h2>Payment Reminder</h2>
      <p>Hi ${station.name},</p>
      <p>Your subscription payment of $${station.monthlyFee / 100} is due in ${daysUntilDue} days.</p>
      <p>Due date: ${station.nextPaymentDue?.toLocaleDateString()}</p>
      <p>Please ensure timely payment to avoid service interruption.</p>
      <p>Thank you!</p>
    `,
  };
  
  await transporter.sendMail(mailOptions);
}

export async function sendSuspensionNotice(station: Station) {
  // Similar implementation
}
```

---

## Admin Dashboard

### Page Structure

```
/admin
├── /                      # Dashboard overview
├── /stations              # Station management
│   ├── /                  # List all stations
│   ├── /new               # Register new station
│   └── /[id]              # Edit station
├── /payments              # Payment tracking
│   ├── /                  # Payment overview
│   └── /[stationId]       # Station payment history
└── /settings              # Admin settings
```

### Key Components

#### 1. Station Registration Form

```typescript
// src/components/admin/StationRegistrationForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const stationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  streamUrlPrimary: z.string().url('Invalid URL'),
  streamUrlBackup: z.string().url().optional(),
  streamBitrate: z.number().min(64).max(320),
  monthlyFee: z.number().min(0),
});

export function StationRegistrationForm() {
  const form = useForm({
    resolver: zodResolver(stationSchema),
  });
  
  const onSubmit = async (data) => {
    const response = await fetch('/api/admin/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    // Show API key to admin (one-time display)
    alert(`Station created! API Key: ${result.station.apiKey}`);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

#### 2. Station List Table

```typescript
// src/components/admin/StationTable.tsx
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StationTable({ stations }) {
  const suspendStation = async (stationId) => {
    await fetch(`/api/admin/stations/${stationId}/suspend`, { method: 'POST' });
    // Refresh data
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Next Payment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stations.map((station) => (
          <TableRow key={station.id}>
            <TableCell>{station.name}</TableCell>
            <TableCell>
              <Badge variant={station.status === 'active' ? 'success' : 'destructive'}>
                {station.status}
              </Badge>
            </TableCell>
            <TableCell>{station.email}</TableCell>
            <TableCell>{station.nextPaymentDue?.toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => suspendStation(station.id)}>
                Suspend
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### 3. Payment Tracking Dashboard

```typescript
// src/app/admin/payments/page.tsx
import { db } from '@/db';
import { payments, stations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PaymentTable } from '@/components/admin/PaymentTable';

export default async function PaymentsPage() {
  const allPayments = await db.query.payments.findMany({
    with: {
      station: true,
    },
    orderBy: [payments.dueDate],
  });
  
  const overduePayments = allPayments.filter(p => p.status === 'overdue');
  const upcomingPayments = allPayments.filter(p => p.status === 'pending');
  
  return (
    <div className="space-y-6">
      <h1>Payment Management</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Overdue" value={overduePayments.length} />
        <StatCard title="Upcoming" value={upcomingPayments.length} />
        <StatCard title="Paid This Month" value={/* calculation */} />
      </div>
      
      <PaymentTable payments={allPayments} />
    </div>
  );
}
```

#### 4. Email Management Interface

```typescript
// src/components/admin/EmailComposer.tsx
'use client';

export function EmailComposer({ stations }) {
  const [selectedStations, setSelectedStations] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const sendEmail = async () => {
    await fetch('/api/admin/email/send', {
      method: 'POST',
      body: JSON.stringify({
        stationIds: selectedStations,
        subject,
        message,
      }),
    });
  };
  
  return (
    <div className="space-y-4">
      <MultiSelect 
        options={stations} 
        selected={selectedStations}
        onChange={setSelectedStations}
      />
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={sendEmail}>Send Email</Button>
    </div>
  );
}
```

---

## Station User Dashboard

### Page Structure

```
/station
├── /                      # Dashboard overview
├── /schedule              # Program schedule management
│   ├── /                  # View schedule
│   ├── /new               # Create program
│   └── /[id]/edit         # Edit program
├── /analytics             # Listener analytics
├── /branding              # Update branding (logo, colors)
├── /payments              # Payment history
└── /settings              # Station settings
```

### Key Components

#### 1. Program Schedule Manager

```typescript
// src/components/station/ScheduleManager.tsx
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ProgramCard } from './ProgramCard';

export function ScheduleManager({ programs }) {
  const [schedule, setSchedule] = useState(programs);
  
  const groupByDay = (programs) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((day, index) => ({
      day,
      programs: programs.filter(p => p.dayOfWeek === index),
    }));
  };
  
  const grouped = groupByDay(schedule);
  
  return (
    <div className="grid grid-cols-7 gap-4">
      {grouped.map(({ day, programs }) => (
        <div key={day} className="space-y-2">
          <h3 className="font-semibold">{day}</h3>
          <div className="space-y-2">
            {programs.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 2. Program Form

```typescript
// src/components/station/ProgramForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const programSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  host: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export function ProgramForm({ program, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: program || {},
  });
  
  const handleSubmit = async (data) => {
    const response = await fetch('/api/station/programs', {
      method: program ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    });
    
    onSubmit(await response.json());
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

#### 3. Analytics Dashboard

```typescript
// src/app/station/analytics/page.tsx
import { db } from '@/db';
import { analytics } from '@/db/schema';
import { getServerSession } from 'next-auth';
import { AnalyticsCharts } from '@/components/station/AnalyticsCharts';

export default async function AnalyticsPage() {
  const session = await getServerSession();
  const stationId = session.user.stationId;
  
  const last30Days = await db.query.analytics.findMany({
    where: eq(analytics.stationId, stationId),
    orderBy: [analytics.date],
    limit: 30,
  });
  
  return (
    <div>
      <h1>Analytics</h1>
      <AnalyticsCharts data={last30Days} />
    </div>
  );
}
```

```typescript
// src/components/station/AnalyticsCharts.tsx
'use client';

import { Line, Bar, Pie } from 'react-chartjs-2';

export function AnalyticsCharts({ data }) {
  const listenerData = {
    labels: data.map(d => d.date.toLocaleDateString()),
    datasets: [{
      label: 'Listeners',
      data: data.map(d => d.listenerCount),
    }],
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3>Listener Trend</h3>
        <Line data={listenerData} />
      </div>
      
      <div>
        <h3>Platform Distribution</h3>
        <Pie data={/* platform data */} />
      </div>
      
      <div>
        <h3>Geographic Distribution</h3>
        <Bar data={/* geography data */} />
      </div>
    </div>
  );
}
```

#### 4. Branding Manager

```typescript
// src/components/station/BrandingForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from '@/components/ui/upload';

export function BrandingForm({ station }) {
  const [logoUrl, setLogoUrl] = useState(station.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(station.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(station.secondaryColor);
  
  const handleSubmit = async () => {
    await fetch('/api/station/branding', {
      method: 'PUT',
      body: JSON.stringify({
        logoUrl,
        primaryColor,
        secondaryColor,
      }),
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label>Logo</label>
        <Upload onUpload={(url) => setLogoUrl(url)} />
        {logoUrl && <img src={logoUrl} alt="Logo preview" className="w-32 h-32" />}
      </div>
      
      <div>
        <label>Primary Color</label>
        <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
      </div>
      
      <div>
        <label>Secondary Color</label>
        <Input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
      </div>
      
      <Button onClick={handleSubmit}>Save Branding</Button>
    </div>
  );
}
```

---

## Mobile App Integration

### Files to Modify

The Flutter mobile app already has a clean architecture in place. We need to replace mock data with real API calls.

#### 1. Update Environment Configuration

**File:** `/Users/alfonso/Projects/radio-app/mobile/.env`

```env
# API Configuration
API_BASE_URL=https://your-backend.com/api/public
API_KEY=generated_api_key_from_backend

# Remove hardcoded stream URLs (now fetched from API)
# STREAM_URL_HIGH=...
# STREAM_URL_MEDIUM=...
# STREAM_URL_LOW=...

# Keep other settings
APP_NAME=Station Name
ENABLE_NOTIFICATIONS=true
ENABLE_BACKGROUND_PLAY=true
DEBUG_MODE=false
```

#### 2. Create API Service

**New File:** `/Users/alfonso/Projects/radio-app/mobile/lib/core/services/api_service.dart`

```dart
import 'package:dio/dio.dart';
import '../config/environment_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();
  
  late final Dio _dio;
  
  void init() {
    _dio = Dio(BaseOptions(
      baseURL: EnvironmentConfig.apiBaseUrl,
      headers: {
        'Authorization': 'Bearer ${EnvironmentConfig.apiKey}',
        'Content-Type': 'application/json',
      },
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));
    
    // Add interceptors for logging, error handling
    _dio.interceptors.add(LogInterceptor(
      requestBody: EnvironmentConfig.isDebugMode,
      responseBody: EnvironmentConfig.isDebugMode,
    ));
  }
  
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } catch (e) {
      rethrow;
    }
  }
  
  Future<Response> post(String path, {dynamic data}) async {
    try {
      return await _dio.post(path, data: data);
    } catch (e) {
      rethrow;
    }
  }
}
```

#### 3. Update Remote Data Source

**File:** `/Users/alfonso/Projects/radio-app/mobile/lib/data/datasources/radio_remote_datasource.dart`

Replace mock implementation with real API calls:

```dart
import 'package:dio/dio.dart';
import '../models/radio_program_model.dart';
import '../models/stream_info_model.dart';
import '../../domain/entities/stream_info.dart';
import '../../core/services/api_service.dart';

abstract class RadioRemoteDataSource {
  Future<List<RadioProgramModel>> getTodaySchedule();
  Future<List<RadioProgramModel>> getScheduleByDate(DateTime date);
  Future<RadioProgramModel?> getCurrentProgram();
  Future<List<StreamInfoModel>> getStreamUrls();
  Future<Map<String, dynamic>> getStationConfig();
}

class RadioRemoteDataSourceImpl implements RadioRemoteDataSource {
  final ApiService _apiService = ApiService();
  
  @override
  Future<Map<String, dynamic>> getStationConfig() async {
    try {
      final response = await _apiService.get('/config');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch station config: $e');
    }
  }
  
  @override
  Future<List<StreamInfoModel>> getStreamUrls() async {
    try {
      final config = await getStationConfig();
      
      // Check station status
      if (config['status'] == 'suspended') {
        throw Exception('Station is suspended. Please contact support.');
      }
      
      final streamUrls = config['streamUrls'];
      final streams = <StreamInfoModel>[];
      
      // Primary stream (high quality)
      if (streamUrls['primary'] != null) {
        streams.add(StreamInfoModel(
          url: streamUrls['primary'],
          quality: StreamQuality.high,
          bitrate: 320,
          format: 'mp3',
          isActive: true,
        ));
      }
      
      // Backup stream (medium quality)
      if (streamUrls['backup'] != null) {
        streams.add(StreamInfoModel(
          url: streamUrls['backup'],
          quality: StreamQuality.medium,
          bitrate: 128,
          format: 'mp3',
          isActive: true,
        ));
      }
      
      return streams;
    } catch (e) {
      throw Exception('Failed to fetch stream URLs: $e');
    }
  }
  
  @override
  Future<List<RadioProgramModel>> getTodaySchedule() async {
    try {
      final now = DateTime.now();
      return await getScheduleByDate(now);
    } catch (e) {
      throw Exception('Failed to fetch today\'s schedule: $e');
    }
  }
  
  @override
  Future<List<RadioProgramModel>> getScheduleByDate(DateTime date) async {
    try {
      final response = await _apiService.get('/schedule', queryParameters: {
        'date': date.toIso8601String(),
      });
      
      final List<dynamic> programsJson = response.data['programs'];
      
      return programsJson.map((json) => RadioProgramModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to fetch schedule: $e');
    }
  }
  
  @override
  Future<RadioProgramModel?> getCurrentProgram() async {
    try {
      final schedule = await getTodaySchedule();
      final now = DateTime.now();
      
      for (final program in schedule) {
        if (now.isAfter(program.startTime) && now.isBefore(program.endTime)) {
          return program;
        }
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch current program: $e');
    }
  }
}
```

#### 4. Update Dependency Injection

**File:** `/Users/alfonso/Projects/radio-app/mobile/lib/core/services/dependency_injection.dart`

Add API service initialization:

```dart
import 'api_service.dart';

class DependencyInjection {
  // ... existing code ...
  
  late final ApiService _apiService;
  
  void init() {
    // Initialize API service first
    _apiService = ApiService();
    _apiService.init();
    
    // ... rest of existing initialization ...
  }
  
  ApiService get apiService => _apiService;
}
```

#### 5. Update Main Entry Point

**File:** `/Users/alfonso/Projects/radio-app/mobile/lib/main.dart`

Already looks good! Just ensure API service is initialized:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvironmentConfig.initialize();
  
  final di = DependencyInjection();
  di.init();  // This now initializes ApiService too
  await di.initializeServices();
  
  runApp(const RadioApp());
}
```

#### 6. Add Error Handling UI

**New File:** `/Users/alfonso/Projects/radio-app/mobile/lib/presentation/widgets/error_widget.dart`

```dart
import 'package:flutter/material.dart';

class ErrorDisplayWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  
  const ErrorDisplayWidget({
    Key? key,
    required this.message,
    this.onRetry,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Oops! Something went wrong',
              style: Theme.of(context).textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

#### 7. Handle Station Suspension

**File:** `/Users/alfonso/Projects/radio-app/mobile/lib/presentation/views/radio_screen.dart`

Add suspension state handling:

```dart
// In the build method, check for suspension error
if (viewModel.error?.contains('suspended') ?? false) {
  return Scaffold(
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.block, size: 64, color: Colors.orange),
          SizedBox(height: 16),
          Text(
            'Station Temporarily Unavailable',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          SizedBox(height: 8),
          Text(
            'Please contact support for more information.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ),
  );
}
```

### Mobile App API Endpoints Used

The mobile app will call these endpoints:

1. **GET /api/public/config** - Fetch station configuration (stream URLs, status, branding)
2. **GET /api/public/schedule?date={date}** - Fetch program schedule for a specific date
3. **POST /api/public/analytics** (future) - Send listening analytics

All requests use `Authorization: Bearer {API_KEY}` header.

---

## Phase-by-Phase Implementation Tasks

### Phase 1: Backend Foundation (Week 1-2)

#### Task 1.1: Project Setup
- [ ] Create Next.js 14 project with TypeScript
- [ ] Install dependencies: Drizzle ORM, NextAuth.js, Nodemailer, bcryptjs, zod
- [ ] Set up project structure (folders: app, components, db, lib)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up environment variables (.env.local)

#### Task 1.2: Database Setup
- [ ] Install PostgreSQL (local or Docker)
- [ ] Configure Drizzle ORM connection
- [ ] Create schema.ts with all tables (stations, users, programs, payments, analytics, settings)
- [ ] Add indexes for performance
- [ ] Generate initial migration
- [ ] Apply migration to database
- [ ] Create seed script with admin user and sample data

#### Task 1.3: Authentication
- [ ] Configure NextAuth.js with credentials provider
- [ ] Create user registration endpoint
- [ ] Implement password hashing with bcryptjs
- [ ] Create JWT token configuration
- [ ] Add role-based session callbacks
- [ ] Create auth middleware for protected routes
- [ ] Build signin/signup pages

#### Task 1.4: API Key System
- [ ] Create API key generation utility (crypto.randomBytes)
- [ ] Implement API key validation middleware
- [ ] Add API key to station creation flow
- [ ] Create endpoint to regenerate API key
- [ ] Add rate limiting for public API

**Testing Criteria:**
- Admin can register and login
- API key is generated for new stations
- API key authentication works in middleware
- Database migrations run successfully

---

### Phase 2: Public API for Mobile (Week 2-3)

#### Task 2.1: Station Config Endpoint
- [ ] Create GET /api/public/config route
- [ ] Validate API key in middleware
- [ ] Return station status, stream URLs, branding
- [ ] Handle suspended stations (return 403)
- [ ] Add response caching (5 minutes)
- [ ] Write integration tests

#### Task 2.2: Schedule Endpoint
- [ ] Create GET /api/public/schedule route
- [ ] Accept date query parameter
- [ ] Fetch programs for station by day of week
- [ ] Transform database models to API response
- [ ] Add pagination support
- [ ] Write integration tests

#### Task 2.3: Error Handling
- [ ] Create standardized error response format
- [ ] Add global error handler
- [ ] Log errors to console (or external service)
- [ ] Return appropriate HTTP status codes
- [ ] Test error scenarios (invalid API key, suspended station, etc.)

**Testing Criteria:**
- Mobile app can authenticate with API key
- Config endpoint returns correct station data
- Schedule endpoint returns programs for correct date
- Suspended stations receive proper error message

---

### Phase 3: Admin Dashboard Backend (Week 3-4)

#### Task 3.1: Station Management API
- [ ] POST /api/admin/stations - Create station
- [ ] GET /api/admin/stations - List all stations
- [ ] GET /api/admin/stations/[id] - Get station details
- [ ] PUT /api/admin/stations/[id] - Update station
- [ ] POST /api/admin/stations/[id]/suspend - Suspend station
- [ ] POST /api/admin/stations/[id]/activate - Activate station
- [ ] DELETE /api/admin/stations/[id] - Delete station (soft delete)

#### Task 3.2: Payment Management API
- [ ] GET /api/admin/payments - List all payments
- [ ] GET /api/admin/payments/[stationId] - Station payment history
- [ ] POST /api/admin/payments - Create payment record
- [ ] PUT /api/admin/payments/[id] - Update payment (mark as paid)
- [ ] GET /api/admin/payments/overdue - List overdue payments

#### Task 3.3: Email Service
- [ ] Configure Nodemailer with SMTP
- [ ] Create email templates (payment reminder, suspension notice)
- [ ] POST /api/admin/email/send - Send email to stations
- [ ] POST /api/admin/email/reminder - Send payment reminder
- [ ] Add email queue (optional: use Bull or similar)

**Testing Criteria:**
- Admin can create, edit, suspend stations
- Payment tracking works correctly
- Emails are sent successfully

---

### Phase 4: Admin Dashboard Frontend (Week 4-5)

#### Task 4.1: Setup UI Framework
- [ ] Install shadcn/ui components
- [ ] Configure Tailwind CSS
- [ ] Create admin layout component
- [ ] Add navigation sidebar
- [ ] Create dashboard page

#### Task 4.2: Station Management Pages
- [ ] /admin/stations - Station list table
- [ ] /admin/stations/new - Station registration form
- [ ] /admin/stations/[id] - Station edit form
- [ ] Add search and filter functionality
- [ ] Display API key on station creation (one-time)
- [ ] Add suspend/activate buttons

#### Task 4.3: Payment Management Pages
- [ ] /admin/payments - Payment overview dashboard
- [ ] Show overdue payments (highlighted)
- [ ] Show upcoming payments
- [ ] /admin/payments/[stationId] - Station payment history
- [ ] Add "Mark as Paid" button
- [ ] Add manual payment entry form

#### Task 4.4: Email Management
- [ ] Create email composer component
- [ ] Multi-select stations
- [ ] Send custom emails
- [ ] Send payment reminders
- [ ] Show email sending status

**Testing Criteria:**
- All CRUD operations work smoothly
- Forms validate input properly
- Tables display data correctly
- Emails can be sent to selected stations

---

### Phase 5: Station User Dashboard Backend (Week 5-6)

#### Task 5.1: Program Management API
- [ ] GET /api/station/programs - List station programs
- [ ] POST /api/station/programs - Create program
- [ ] PUT /api/station/programs/[id] - Update program
- [ ] DELETE /api/station/programs/[id] - Delete program
- [ ] Validate user can only manage their station's programs

#### Task 5.2: Analytics API
- [ ] GET /api/station/analytics - Get analytics data
- [ ] Filter by date range
- [ ] Aggregate listener counts
- [ ] Group by platform, geography
- [ ] Calculate trends

#### Task 5.3: Branding API
- [ ] GET /api/station/branding - Get station branding
- [ ] PUT /api/station/branding - Update branding (logo, colors)
- [ ] Validate color hex codes
- [ ] Handle logo upload (S3 or local storage)

**Testing Criteria:**
- Station users can only access their own data
- Programs can be created, edited, deleted
- Analytics data is accurate

---

### Phase 6: Station User Dashboard Frontend (Week 6-7)

#### Task 6.1: Schedule Management Pages
- [ ] /station/schedule - Weekly schedule view
- [ ] /station/schedule/new - Create program form
- [ ] /station/schedule/[id]/edit - Edit program form
- [ ] Add time slot validation (no overlaps)
- [ ] Visual calendar/timeline view

#### Task 6.2: Analytics Pages
- [ ] /station/analytics - Analytics dashboard
- [ ] Listener count chart (Chart.js or Recharts)
- [ ] Platform distribution pie chart
- [ ] Geographic distribution bar chart
- [ ] Date range selector

#### Task 6.3: Branding Pages
- [ ] /station/branding - Branding form
- [ ] Logo upload component
- [ ] Color picker for primary/secondary colors
- [ ] Live preview of branding changes

#### Task 6.4: Payment History
- [ ] /station/payments - Payment history table
- [ ] Show payment status (paid, pending, overdue)
- [ ] Display next payment due date

**Testing Criteria:**
- Schedule manager displays programs correctly
- Analytics charts render properly
- Branding updates are saved and reflected

---

### Phase 7: Mobile App Integration (Week 7-8)

#### Task 7.1: Update Mobile App Configuration
- [ ] Add API_BASE_URL to .env
- [ ] Add API_KEY to .env
- [ ] Remove hardcoded stream URLs from .env
- [ ] Update EnvironmentConfig to use API key

#### Task 7.2: Create API Service
- [ ] Create api_service.dart
- [ ] Configure Dio with base URL and API key
- [ ] Add request/response interceptors
- [ ] Add error handling
- [ ] Add timeout configuration

#### Task 7.3: Update Remote Data Source
- [ ] Replace mock implementation with API calls
- [ ] Implement getStationConfig()
- [ ] Implement getStreamUrls() (fetch from API)
- [ ] Implement getTodaySchedule() (fetch from API)
- [ ] Implement getScheduleByDate() (fetch from API)
- [ ] Add error handling for suspended stations

#### Task 7.4: Update Dependency Injection
- [ ] Initialize ApiService in DependencyInjection
- [ ] Update remote data source to use ApiService
- [ ] Test initialization flow

#### Task 7.5: UI Updates
- [ ] Add error display widget
- [ ] Handle suspension state in RadioScreen
- [ ] Show loading states during API calls
- [ ] Add retry mechanism for failed requests
- [ ] Test offline behavior

#### Task 7.6: Testing
- [ ] Test with real backend (development)
- [ ] Test API key authentication
- [ ] Test schedule fetching
- [ ] Test stream URL fetching
- [ ] Test suspension state
- [ ] Test network errors

**Testing Criteria:**
- Mobile app fetches real data from backend
- Streaming works with API-provided URLs
- Schedule displays correctly
- Suspension state is handled gracefully
- App works on both iOS and Android

---

### Phase 8: Deployment & Documentation (Week 8-9)

#### Task 8.1: Backend Deployment
- [ ] Choose hosting provider (Vercel, Railway, AWS, etc.)
- [ ] Set up production database (PostgreSQL)
- [ ] Configure environment variables
- [ ] Run database migrations in production
- [ ] Set up SMTP for production emails
- [ ] Configure domain and SSL

#### Task 8.2: Documentation
- [ ] Create CLAUDE.md for backend project
- [ ] Document API endpoints (OpenAPI/Swagger optional)
- [ ] Document admin workflows
- [ ] Document station user workflows
- [ ] Update mobile CLAUDE.md with API integration
- [ ] Create deployment guide

#### Task 8.3: Mobile App Template Process
- [ ] Document steps to clone mobile app
- [ ] Document .env configuration for new station
- [ ] Document package name changes (Android/iOS)
- [ ] Document build process
- [ ] Create checklist for new station deployments

#### Task 8.4: Testing & QA
- [ ] End-to-end testing of all workflows
- [ ] Test admin creates station → generates API key → mobile app uses key
- [ ] Test payment tracking and reminders
- [ ] Test suspension flow
- [ ] Load testing for API endpoints

**Testing Criteria:**
- Production deployment is successful
- All features work in production
- Documentation is complete and accurate
- Mobile app can be cloned and configured for new stations

---

### Phase 9: Future Enhancements (Optional)

#### Task 9.1: Analytics Enhancement
- [ ] Track real listener counts (WebSocket or polling)
- [ ] Geographic tracking via IP
- [ ] Device fingerprinting
- [ ] Program-specific analytics

#### Task 9.2: Payment Integration
- [ ] Integrate Stripe for automated payments
- [ ] Subscription management
- [ ] Automatic payment reminders
- [ ] Invoice generation

#### Task 9.3: Advanced Features
- [ ] Live chat in mobile app
- [ ] Push notifications for program starts
- [ ] Social media integration
- [ ] Multi-language support
- [ ] White-label admin dashboard

---

## Testing Strategy

### Unit Tests

**Backend:**
- [ ] Test database models and relations
- [ ] Test utility functions (API key generation, email formatting)
- [ ] Test validation schemas (Zod)

**Mobile:**
- [ ] Test API service methods
- [ ] Test data models (fromJson, toJson)
- [ ] Test repository implementations

### Integration Tests

**Backend:**
- [ ] Test API endpoints (POST, GET, PUT, DELETE)
- [ ] Test authentication flow
- [ ] Test API key validation
- [ ] Test middleware

**Mobile:**
- [ ] Test remote data source with mock server
- [ ] Test repository integration
- [ ] Test ViewModels

### End-to-End Tests

- [ ] Admin registers station → API key generated
- [ ] Station user logs in → manages schedules
- [ ] Mobile app fetches config and schedule
- [ ] Payment tracking and reminder flow
- [ ] Suspension flow (admin suspends → mobile receives error)

### Manual Testing Checklist

- [ ] Admin dashboard - all pages load correctly
- [ ] Station dashboard - all pages load correctly
- [ ] Mobile app on iOS - all features work
- [ ] Mobile app on Android - all features work
- [ ] Email delivery works
- [ ] API responds correctly to mobile
- [ ] Suspended stations cannot stream

---

## Deployment Considerations

### Hosting Options

#### Option 1: Vercel (Recommended for Next.js)
**Pros:**
- Optimized for Next.js
- Easy deployment (git push)
- Serverless functions
- Free tier available
- Global CDN

**Cons:**
- Need external database (Vercel Postgres or external)
- Serverless cold starts

**Setup:**
1. Deploy Next.js app to Vercel
2. Use Vercel Postgres or external PostgreSQL
3. Configure environment variables in Vercel dashboard

#### Option 2: Railway
**Pros:**
- Includes PostgreSQL hosting
- Simple deployment
- Affordable pricing
- Persistent storage

**Cons:**
- No free tier (after trial)
- Smaller network than Vercel

**Setup:**
1. Deploy Next.js app to Railway
2. Add PostgreSQL database service
3. Configure environment variables

#### Option 3: AWS (EC2 + RDS)
**Pros:**
- Full control
- Scalable
- Production-grade

**Cons:**
- More complex setup
- Higher cost
- Requires DevOps knowledge

**Setup:**
1. Launch EC2 instance
2. Set up RDS PostgreSQL
3. Deploy Next.js app (PM2 or Docker)
4. Configure Nginx reverse proxy

### Environment Variables

**Backend (.env.local):**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# NextAuth.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@your-domain.com

# App
NODE_ENV=production
```

**Mobile (.env):**
```env
API_BASE_URL=https://your-domain.com/api/public
API_KEY=station_api_key_from_backend
APP_NAME=Station Name
ENABLE_NOTIFICATIONS=true
ENABLE_BACKGROUND_PLAY=true
DEBUG_MODE=false
```

### SSL/HTTPS

- Use Let's Encrypt for free SSL certificates
- Vercel and Railway provide SSL automatically
- For custom servers, use Certbot

### Database Backups

- Schedule automated daily backups
- Store backups off-site (S3 or similar)
- Test restore process regularly

### Monitoring

- Use Vercel Analytics or similar
- Set up error tracking (Sentry)
- Monitor API response times
- Track database performance

---

## CLAUDE.md Documentation

Create a CLAUDE.md file in the backend project:

```markdown
# CLAUDE.md - Radio Streaming Management Platform Backend

## Project Overview

This is a Next.js backend and admin dashboard for managing multiple radio station clients. The platform allows radio streamers (admins) to register stations, generate API keys, track payments, and enable station users to manage their own content.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Authentication:** NextAuth.js (JWT + sessions)
- **Email:** Nodemailer + SMTP
- **UI:** shadcn/ui + Tailwind CSS
- **Validation:** Zod
- **API Client:** Native fetch

## Architecture Overview

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── public/         # Mobile API (API key auth)
│   │   ├── admin/          # Admin API (session auth)
│   │   └── station/        # Station API (session auth)
│   ├── admin/              # Admin dashboard pages
│   ├── station/            # Station dashboard pages
│   └── auth/               # Auth pages
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── admin/              # Admin-specific components
│   └── station/            # Station-specific components
├── db/                     # Database
│   ├── schema.ts           # Drizzle schema
│   ├── index.ts            # DB connection
│   └── migrations/         # Migration files
├── lib/                    # Utilities
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # DB utilities
│   ├── email.ts            # Email service
│   └── utils.ts            # General utilities
└── types/                  # TypeScript types
```

### User Roles

1. **Admin (Radio Streamer):** Platform owner who manages multiple stations
2. **Station User:** Radio station manager who manages their own content

### Authentication

**Admin/Station Users:** NextAuth.js with credentials provider
- Sessions stored in JWT tokens
- Role-based access control via callbacks

**Mobile Apps:** API key authentication
- Each station has unique API key
- Validated in middleware
- Rate limited

### Database Schema

Key tables:
- `users` - Admin and station users
- `stations` - Radio stations
- `programs` - Program schedules
- `payments` - Payment tracking
- `analytics` - Listener analytics
- `settings` - App-wide configuration

See `src/db/schema.ts` for full schema.

## Development Commands

### Setup
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed database
```

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:studio    # Open Drizzle Studio
```

## API Endpoints

### Public API (Mobile Apps)
- `GET /api/public/config` - Station configuration
- `GET /api/public/schedule` - Program schedule

Authentication: `Authorization: Bearer {API_KEY}`

### Admin API
- `POST /api/admin/stations` - Create station
- `GET /api/admin/stations` - List stations
- `PUT /api/admin/stations/[id]` - Update station
- `POST /api/admin/stations/[id]/suspend` - Suspend station
- `GET /api/admin/payments` - List payments
- `POST /api/admin/email/send` - Send emails

Authentication: Session-based (admin role)

### Station API
- `GET /api/station/programs` - List programs
- `POST /api/station/programs` - Create program
- `PUT /api/station/programs/[id]` - Update program
- `DELETE /api/station/programs/[id]` - Delete program
- `GET /api/station/analytics` - Get analytics
- `PUT /api/station/branding` - Update branding

Authentication: Session-based (station_user role)

## Key Workflows

### Station Registration Flow
1. Admin registers station via /admin/stations/new
2. System generates unique API key
3. Admin copies API key (displayed once)
4. Admin clones mobile template repo
5. Admin configures .env with API key
6. Admin builds and deploys mobile app

### Payment Management Flow
1. Admin sets payment due date for station
2. System sends reminder emails before due date
3. Admin marks payment as received
4. If overdue, admin can suspend station

### Mobile App Startup Flow
1. App makes GET /api/public/config with API key
2. Backend validates key and returns station config
3. If active: app streams radio
4. If suspended: app shows suspension message

## Development Tips

### Adding New API Endpoint
1. Create route file in appropriate directory (public/admin/station)
2. Add authentication check (session or API key)
3. Validate input with Zod
4. Query database with Drizzle
5. Return JSON response

### Adding New Dashboard Page
1. Create page.tsx in app/admin or app/station
2. Fetch data with Server Components (if possible)
3. Use Client Components for interactivity
4. Reuse components from components/ui

### Database Migrations
1. Modify schema.ts
2. Run `npm run db:generate`
3. Review generated migration
4. Run `npm run db:migrate`

### Email Templates
Edit templates in `src/lib/email.ts`. Use HTML for formatting.

## Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests
npm run test:int      # Integration tests
```

### Manual Testing Checklist
- Admin can create, edit, suspend stations
- Station users can manage their programs
- Mobile API returns correct data
- Emails are sent successfully

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Configure environment variables
3. Deploy

### Railway
1. Create new project
2. Add PostgreSQL service
3. Deploy from GitHub

### Environment Variables
See .env.example for required variables.

## Troubleshooting

### Common Issues

**Database connection fails:**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify network access

**API key authentication fails:**
- Ensure API key is in Authorization header
- Check middleware is configured
- Verify station exists and is active

**Emails not sending:**
- Check SMTP credentials
- Verify SMTP host and port
- Test with Gmail or SendGrid

## Contributing

- Follow existing code patterns
- Use TypeScript for type safety
- Validate all inputs with Zod
- Write tests for new features
- Update documentation

---

Built with ❤️ for the radio streaming community
```

---

## Summary of Critical Files for Implementation

### Backend Files (to be created)

1. **src/db/schema.ts** - Database schema with all tables, relations, and indexes
2. **src/app/api/public/config/route.ts** - Mobile app configuration endpoint
3. **src/app/api/public/schedule/route.ts** - Program schedule endpoint
4. **src/app/api/admin/stations/route.ts** - Station CRUD operations
5. **src/app/api/admin/payments/route.ts** - Payment management
6. **src/lib/email.ts** - Email service with Nodemailer
7. **src/middleware.ts** - API key and session authentication
8. **src/app/api/auth/[...nextauth]/route.ts** - NextAuth configuration

### Mobile Files (to be modified)

1. **mobile/lib/core/services/api_service.dart** - NEW: API client service
2. **mobile/lib/data/datasources/radio_remote_datasource.dart** - Replace mock with real API
3. **mobile/lib/core/services/dependency_injection.dart** - Add API service initialization
4. **mobile/.env** - Add API_BASE_URL and API_KEY
5. **mobile/lib/presentation/widgets/error_widget.dart** - NEW: Error display component

---

This implementation plan provides a comprehensive roadmap for building the radio streaming management platform. The plan is organized in phases to allow incremental development and testing. Each phase builds on the previous one, ensuring a solid foundation before moving to the next step.

The plan prioritizes backend and admin dashboard development first, then integrates the mobile app in the later phases, as requested. All technical decisions are based on modern Next.js best practices with TypeScript, PostgreSQL, and Drizzle ORM.
