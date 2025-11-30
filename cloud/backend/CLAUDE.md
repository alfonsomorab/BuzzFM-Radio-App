# Backend CLAUDE.md - Radio Streaming Platform API

This file provides guidance to Claude Code when working with the Next.js backend for the radio streaming management platform.

## Project Overview

Next.js 14+ backend with TypeScript providing REST API endpoints and web dashboards for managing radio stations, programs, payments, and analytics.

**Tech Stack:**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4.1+
- **Authentication**: NextAuth.js (to be implemented in Phase 3)
- **Email**: Nodemailer + SMTP (to be implemented in Phase 3)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Database commands
npm run db:generate   # Generate migrations from schema changes
npm run db:push       # Push schema to database (development)
npm run db:studio     # Open Drizzle Studio (database GUI)
npm run db:seed       # Seed database with sample data
```

## Project Structure

```
cloud/backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── public/          # Mobile API (API key auth)
│   │   │   ├── admin/           # Admin dashboard API (session auth)
│   │   │   └── station/         # Station user API (session auth)
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── station/             # Station user pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (to be added)
│   │   ├── admin/               # Admin-specific components
│   │   └── station/             # Station-specific components
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definitions
│   │   ├── index.ts             # Database connection
│   │   ├── seed.ts              # Seed script
│   │   └── migrations/          # Generated migration files
│   └── lib/
│       ├── auth.ts              # NextAuth configuration (Phase 3)
│       ├── email.ts             # Email service (Phase 3)
│       └── utils.ts             # Utility functions
├── drizzle.config.ts            # Drizzle configuration
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind configuration
├── .env.local                   # Local environment variables (not committed)
└── .env.example                 # Environment variables template
```

## Database Schema

### Tables

**users**
- Stores admin and station user accounts
- Fields: id, email, passwordHash, name, role (admin/station), stationId, timestamps
- Indexes: email (unique), stationId

**radio_stations**
- Central table for radio station information
- Fields: id, name, slug, address, description, musicGenre, contact info, stream URLs, apiKey, status, subscription dates, branding (JSON)
- Indexes: apiKey (unique), slug (unique), status

**programs**
- Radio show schedules
- Fields: id, stationId, title, hostName, description, dayOfWeek (0-6), startTime, endTime, isActive, timestamps
- Indexes: stationId, dayOfWeek, isActive

**payments**
- Payment tracking records
- Fields: id, stationId, amount (cents), paymentDate, dueDate, status, notes, recordedBy, createdAt
- Indexes: stationId, status, dueDate

**analytics_daily**
- Daily listener statistics per station
- Fields: id, stationId, date, totalListeners, peakListeners, peakTime, createdAt
- Indexes: (stationId, date) unique, date

**analytics_geography**
- Geographic listener distribution
- Fields: id, stationId, date, country, city, listenerCount, createdAt
- Indexes: (stationId, date), country

### Relationships

- users.stationId → radio_stations.id (station users belong to one station)
- programs.stationId → radio_stations.id (programs belong to one station)
- payments.stationId → radio_stations.id (payments belong to one station)
- payments.recordedBy → users.id (track who recorded payment)
- analytics_daily.stationId → radio_stations.id
- analytics_geography.stationId → radio_stations.id

## Database Setup

### Initial Setup

1. **Create PostgreSQL database:**
   ```bash
   createdb radio_streaming
   ```

2. **Update .env.local with your database URL:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/radio_streaming
   ```

3. **Push schema to database:**
   ```bash
   npm run db:push
   ```

4. **Seed with sample data:**
   ```bash
   npm run db:seed
   ```

### Sample Data Included

After seeding, you'll have:
- 1 Admin user: `admin@radiostreaming.com`
- 3 Radio stations: Magic FM (active), Jazz Vibes (active), Rock Nation (suspended)
- 2 Station users: `manager@magicfm.com`, `manager@jazzvibes.com`
- 5 Program schedules
- 4 Payment records (paid, pending, overdue)

**Note:** All users have dummy password hashes. In production, use bcrypt.

## API Endpoints (Planned)

### Public Mobile API (`/api/public/*`)
Authentication: API key in `Authorization: Bearer {key}` header

- `GET /api/public/config` - Station configuration (URLs, status, branding)
- `GET /api/public/schedule?date=YYYY-MM-DD` - Program schedule
- `POST /api/public/analytics` - Log listening session

### Admin API (`/api/admin/*`)
Authentication: NextAuth.js session (role: admin)

- `GET /api/admin/stations` - List all stations
- `POST /api/admin/stations` - Create new station
- `PUT /api/admin/stations/[id]` - Update station
- `POST /api/admin/stations/[id]/suspend` - Suspend station
- `POST /api/admin/stations/[id]/activate` - Activate station
- `GET /api/admin/payments` - List payments
- `POST /api/admin/payments` - Record payment
- `POST /api/admin/emails/reminder` - Send subscription reminder

### Station User API (`/api/station/*`)
Authentication: NextAuth.js session (role: station)

- `GET /api/station/programs` - Get station's programs
- `POST /api/station/programs` - Create program
- `PUT /api/station/programs/[id]` - Update program
- `DELETE /api/station/programs/[id]` - Delete program
- `GET /api/station/analytics` - View station analytics
- `PUT /api/station/branding` - Update station branding

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://localhost:5432/radio_streaming

# NextAuth.js (Phase 3)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email (Phase 3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Radio Streaming Platform <noreply@yourdomain.com>

# App
NODE_ENV=development
```

## Development Workflow

### Making Schema Changes

1. Edit `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Push to database: `npm run db:push`
4. Update seed script if needed

### Adding New API Routes

1. Create route file in `src/app/api/[section]/route.ts`
2. Implement GET, POST, PUT, DELETE handlers
3. Use `db` from `src/db/index.ts` for database operations
4. Add authentication middleware
5. Test with API client (Postman, Thunder Client)

### Testing Database Queries

Use Drizzle Studio for visual database exploration:
```bash
npm run db:studio
```
Opens at `https://local.drizzle.studio`

## Current Implementation Status

### ✅ Completed (Phase 1)
- Next.js 14+ project initialized with TypeScript
- Drizzle ORM configured with PostgreSQL
- Complete database schema (6 tables)
- Database connection utility
- Seed script with sample data
- Basic app structure (layout, page, globals)
- Environment variables setup

### ⏳ Next Steps (Phase 2)
- Implement public mobile API endpoints
- Add API key validation middleware
- Create station config endpoint
- Create schedule endpoint
- Add rate limiting
- Test with mobile app

### 📋 Future Phases
- Phase 3: Admin dashboard backend
- Phase 4: Admin dashboard frontend
- Phase 5: Station user backend
- Phase 6: Station user frontend
- Phase 7: Mobile app integration
- Phase 8-9: Testing and deployment

## Important Conventions

1. **API Routes**: Use Next.js App Router convention (`route.ts` files)
2. **Database Access**: Always use `db` from `src/db/index.ts`, never direct SQL
3. **Type Safety**: Export and use TypeScript types from schema
4. **Error Handling**: Return proper HTTP status codes and error messages
5. **Authentication**: Public API uses API keys, web dashboards use sessions
6. **Validation**: Validate all input data before database operations
7. **Timestamps**: All tables have `createdAt`, most have `updatedAt`

## Troubleshooting

### Database connection fails
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env.local`
- Ensure database exists: `createdb radio_streaming`

### Schema push fails
- Check for syntax errors in `src/db/schema.ts`
- Verify Drizzle config in `drizzle.config.ts`
- Try generating migration first: `npm run db:generate`

### Seed script fails
- Ensure schema is pushed: `npm run db:push`
- Check if tables already have data (seed is not idempotent)
- Drop and recreate database if needed

### Type errors
- Run `npm install` to ensure all type packages are installed
- Check `tsconfig.json` paths configuration
- Restart TypeScript server in your editor

## Security Notes

- **Never commit `.env.local`** (already in .gitignore)
- **Use bcrypt for password hashing** (not dummy hashes)
- **Validate all API inputs** before database operations
- **Use parameterized queries** (Drizzle handles this)
- **Implement rate limiting** on API endpoints
- **Use HTTPS in production** for all connections
- **Rotate API keys** if compromised

## Testing Strategy

### Unit Tests (Future)
- Test database queries in isolation
- Test utility functions
- Use in-memory database for fast tests

### Integration Tests (Future)
- Test API endpoints with real database
- Test authentication flows
- Test email sending (with sandbox SMTP)

### Manual Testing
- Use Drizzle Studio to inspect data
- Use API client to test endpoints
- Test with real mobile app

## Deployment Checklist

Before deploying to production:

- [ ] Update `NODE_ENV=production` in environment
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure production database with SSL
- [ ] Setup production SMTP service
- [ ] Enable rate limiting on API endpoints
- [ ] Add database backup strategy
- [ ] Configure logging and monitoring
- [ ] Test all user flows end-to-end
- [ ] Run security audit: `npm audit`
- [ ] Optimize build: `npm run build`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Last Updated: 2025-11-29 (Phase 1 Complete)
