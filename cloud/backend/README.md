# 🌐 Radio Streaming Backend - Next.js + PostgreSQL

A comprehensive Next.js backend with TypeScript providing REST API endpoints and web dashboards for managing radio stations, programs, payments, and analytics. Built with Drizzle ORM for type-safe database operations.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

## 🎯 Project Overview

This backend serves three types of users:
1. **Mobile Apps** - Public API with API key authentication
2. **Admin Users** - Full platform management via web dashboard
3. **Station Users** - Station-specific management via web dashboard

**Tech Stack:**
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.0+
- **Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js (Phase 3)
- **Email**: Nodemailer + SMTP (Phase 3)
- **Styling**: Bootstrap + Custom CSS (Phase 4+)

## ✨ Features

### Current Features (Phase 1 Complete) ✅
- Complete database schema with 6 tables
- Type-safe Drizzle ORM setup
- Database migrations and seeding
- Sample data for development
- Environment configuration

### Planned Features

**Phase 2 - Public Mobile API:**
- API key validation middleware
- Station configuration endpoint
- Program schedule endpoint
- Analytics logging endpoint

**Phase 3 - Admin Dashboard Backend:**
- NextAuth.js authentication
- Station CRUD operations
- Payment tracking
- Email service with reminders

**Phase 4+ - Web Dashboards:**
- Bootstrap + custom React components
- Admin management interface
- Station user interface
- Real-time analytics

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download Node.js](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download PostgreSQL](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Git**

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check npm version
npm --version

# Check PostgreSQL version
psql --version  # Should be 15.0 or higher
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd cloud/backend

# Install all packages
npm install
```

This installs all dependencies defined in `package.json`:
- Next.js 16+
- TypeScript 5.9+
- Drizzle ORM 0.44+
- pg (PostgreSQL client) 8.16+
- And all their dependencies

### 2. Setup PostgreSQL Database

**Option A: Using `createdb` command (macOS/Linux)**
```bash
# Create database
createdb radio_streaming

# Verify database was created
psql -l | grep radio_streaming
```

**Option B: Using psql client**
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE radio_streaming;

# Exit psql
\q
```

**Option C: Using PostgreSQL GUI (pgAdmin, TablePlus, etc.)**
- Open your GUI tool
- Create new database named `radio_streaming`
- Set owner to your PostgreSQL user

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@localhost:5432/radio_streaming

# Replace 'username' and 'password' with your PostgreSQL credentials
# Default PostgreSQL user is usually 'postgres'
# Example: postgresql://postgres:mypassword@localhost:5432/radio_streaming

# NextAuth.js (will be used in Phase 3)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production

# Email Configuration (will be used in Phase 3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Radio Streaming Platform <noreply@yourdomain.com>

# Application
NODE_ENV=development
```

**Important Notes:**
- Replace `username` and `password` with your actual PostgreSQL credentials
- For Gmail SMTP, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Never commit `.env.local` to version control (it's in `.gitignore`)

### 4. Push Database Schema

```bash
# Generate and push schema to PostgreSQL
npm run db:push
```

This command:
1. Reads schema definitions from `src/db/schema.ts`
2. Generates SQL DDL statements
3. Creates all tables, indexes, and relationships in your database

**Tables created:**
- `users` - Admin and station user accounts
- `radio_stations` - Station details and configuration
- `programs` - Program schedules
- `payments` - Payment tracking
- `analytics_daily` - Daily listener metrics
- `analytics_geography` - Geographic distribution

### 5. Seed Sample Data (Optional but Recommended)

```bash
# Populate database with sample data
npm run db:seed
```

This creates:
- **1 Admin user**: `admin@radiostreaming.com`
- **3 Radio stations**:
  - Magic FM (active)
  - Jazz Vibes (active)
  - Rock Nation (suspended)
- **2 Station users**: `manager@magicfm.com`, `manager@jazzvibes.com`
- **5 Program schedules** (Morning Show, Jazz Hour, etc.)
- **4 Payment records** (paid, pending, overdue)

**Note:** Password hashes are dummy values. In production, use bcrypt.

### 6. Run Development Server

```bash
npm run dev
```

The server starts at `http://localhost:3000`

You should see:
```
▲ Next.js 16.0.5
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

## 🛠️ Development Commands

### Essential Commands

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
```

### Database Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Open Drizzle Studio (visual database editor)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### API Documentation Commands

```bash
# Update API documentation (copy to public folder)
npm run docs:update

# Serve API documentation (starts dev server)
npm run docs:serve
```

### Drizzle Studio

**Drizzle Studio** is a visual database editor:

```bash
npm run db:studio
```

Opens at `https://local.drizzle.studio`

Features:
- Browse all tables and data
- Edit records visually
- Run SQL queries
- View relationships
- Export data

## 📚 API Documentation

### Interactive Documentation (Swagger UI)

This project uses **OpenAPI 3.0.3** specification for comprehensive API documentation with an interactive Swagger UI interface.

**View Documentation:**
```bash
# Start development server
npm run dev

# Access documentation at:
http://localhost:3000/api-docs
```

**Features:**
- ✅ Browse all API endpoints by category
- ✅ View request/response schemas with examples
- ✅ Test API calls directly from the browser
- ✅ See authentication requirements
- ✅ Download OpenAPI specification

### Documentation Files

**Main Specification:**
- **File**: `openapi.yaml`
- **Format**: OpenAPI 3.0.3 (Swagger)
- **Location**: Root of backend directory

**Swagger UI Page:**
- **File**: `src/app/api-docs/page.tsx`
- **URL**: `/api-docs`

### Updating API Documentation

Whenever you add or modify API endpoints:

1. **Edit the spec:**
   ```bash
   # Edit openapi.yaml with your changes
   nano openapi.yaml
   ```

2. **Update public copy:**
   ```bash
   npm run docs:update
   ```

3. **Verify changes:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api-docs
   ```

### API Categories

Endpoints are organized into:
- **Public Mobile API** - Mobile app endpoints (API key auth)
- **Admin - Stations** - Station management (session auth)
- **Admin - Payments** - Payment tracking (session auth)
- **Admin - Emails** - Email notifications (session auth)
- **Station - Programs** - Program schedules (session auth)
- **Station - Analytics** - Analytics data (session auth)
- **Station - Branding** - Branding updates (session auth)

For detailed documentation guide, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 📁 Project Structure

```
cloud/backend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── public/           # Mobile API (API key auth)
│   │   │   │   ├── config/       # Station configuration
│   │   │   │   ├── schedule/     # Program schedules
│   │   │   │   └── analytics/    # Analytics logging
│   │   │   ├── admin/            # Admin API (session auth)
│   │   │   │   ├── stations/     # Station management
│   │   │   │   ├── payments/     # Payment tracking
│   │   │   │   └── emails/       # Email reminders
│   │   │   └── station/          # Station user API
│   │   │       ├── programs/     # Program CRUD
│   │   │       ├── analytics/    # View analytics
│   │   │       └── branding/     # Update branding
│   │   ├── admin/                # Admin dashboard pages (Phase 4)
│   │   ├── station/              # Station dashboard pages (Phase 6)
│   │   ├── api-docs/             # API documentation page
│   │   │   └── page.tsx          # Swagger UI page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/               # React components
│   │   ├── ui/                  # Reusable UI components (Phase 4+)
│   │   ├── admin/               # Admin-specific components
│   │   └── station/             # Station-specific components
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts            # Drizzle schema definitions
│   │   ├── index.ts             # Database connection
│   │   ├── seed.ts              # Seed script
│   │   └── migrations/          # Generated migration files
│   │
│   └── lib/                      # Utilities and services
│       ├── auth.ts              # NextAuth configuration (Phase 3)
│       ├── email.ts             # Email service (Phase 3)
│       └── utils.ts             # Helper functions
│
├── public/                       # Static assets
│   └── openapi.yaml             # OpenAPI spec (served to Swagger UI)
│
├── openapi.yaml                  # OpenAPI 3.0.3 specification
├── API_DOCUMENTATION.md          # API documentation guide
├── drizzle.config.ts             # Drizzle configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment template
├── .env.local                    # Local environment (not committed)
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🗄️ Database Schema

### Tables Overview

**users** - User accounts with roles
```typescript
{
  id: uuid (primary key)
  email: string (unique)
  passwordHash: string
  name: string
  role: 'admin' | 'station'
  stationId: uuid (foreign key, nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**radio_stations** - Radio station configuration
```typescript
{
  id: uuid (primary key)
  name: string
  slug: string (unique)
  address: text
  description: text
  musicGenre: string
  contactName: string
  contactPhone: string
  contactEmail: string
  streamUrlPrimary: string
  streamUrlBackup: string
  apiKey: string (unique)
  status: 'active' | 'suspended'
  subscriptionDueDate: date
  lastPaymentDate: date
  branding: json { logoUrl, primaryColor, secondaryColor }
  createdAt: timestamp
  updatedAt: timestamp
}
```

**programs** - Program schedules
```typescript
{
  id: uuid (primary key)
  stationId: uuid (foreign key)
  title: string
  hostName: string
  description: text
  dayOfWeek: integer (0-6, Sunday-Saturday)
  startTime: time
  endTime: time
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

**payments** - Payment tracking
```typescript
{
  id: uuid (primary key)
  stationId: uuid (foreign key)
  amount: integer (cents)
  paymentDate: date
  dueDate: date
  status: 'pending' | 'paid' | 'overdue'
  notes: text
  recordedBy: uuid (foreign key to users)
  createdAt: timestamp
}
```

**analytics_daily** - Daily listener metrics
```typescript
{
  id: uuid (primary key)
  stationId: uuid (foreign key)
  date: date
  totalListeners: integer
  peakListeners: integer
  peakTime: time
  createdAt: timestamp
}
```

**analytics_geography** - Geographic distribution
```typescript
{
  id: uuid (primary key)
  stationId: uuid (foreign key)
  date: date
  country: string
  city: string
  listenerCount: integer
  createdAt: timestamp
}
```

### Relationships

- `users.stationId` → `radio_stations.id`
- `programs.stationId` → `radio_stations.id` (cascade delete)
- `payments.stationId` → `radio_stations.id` (cascade delete)
- `payments.recordedBy` → `users.id`
- `analytics_daily.stationId` → `radio_stations.id` (cascade delete)
- `analytics_geography.stationId` → `radio_stations.id` (cascade delete)

## 🔌 API Endpoints (Planned)

### Public Mobile API (`/api/public/*`)

**Authentication:** API key in `Authorization: Bearer {key}` header

**GET /api/public/config**
```typescript
// Returns station configuration
Response: {
  station: {
    id: string,
    name: string,
    status: 'active' | 'suspended',
    branding: { logoUrl, primaryColor, secondaryColor }
  },
  streamUrls: {
    primary: string,
    backup: string
  }
}
```

**GET /api/public/schedule?date=YYYY-MM-DD**
```typescript
// Returns program schedule for date
Response: {
  programs: [
    {
      id: string,
      title: string,
      hostName: string,
      description: string,
      dayOfWeek: number,
      startTime: string,
      endTime: string
    }
  ]
}
```

**POST /api/public/analytics**
```typescript
// Logs listening session
Request: {
  sessionDuration: number, // seconds
  quality: 'high' | 'medium' | 'low',
  country?: string,
  city?: string
}
```

### Admin API (`/api/admin/*`)

**Authentication:** NextAuth.js session (role: admin)

- `GET /api/admin/stations` - List all stations
- `POST /api/admin/stations` - Create new station
- `PUT /api/admin/stations/[id]` - Update station
- `POST /api/admin/stations/[id]/suspend` - Suspend station
- `POST /api/admin/stations/[id]/activate` - Activate station
- `GET /api/admin/payments` - List payments
- `POST /api/admin/payments` - Record payment
- `POST /api/admin/emails/reminder` - Send subscription reminder

### Station User API (`/api/station/*`)

**Authentication:** NextAuth.js session (role: station)

- `GET /api/station/programs` - Get station's programs
- `POST /api/station/programs` - Create program
- `PUT /api/station/programs/[id]` - Update program
- `DELETE /api/station/programs/[id]` - Delete program
- `GET /api/station/analytics` - View station analytics
- `PUT /api/station/branding` - Update station branding

## 🧪 Testing

### Manual Testing with Drizzle Studio

```bash
npm run db:studio
```

Use the visual interface to:
- Verify seed data
- Test relationships
- Manually insert/update records
- Run SQL queries

### API Testing (Phase 2+)

Use tools like:
- **Thunder Client** (VS Code extension)
- **Postman**
- **Insomnia**
- **curl**

Example API test:
```bash
# Test config endpoint (when implemented)
curl -H "Authorization: Bearer your-api-key" \
  http://localhost:3000/api/public/config
```

## 🔧 Making Schema Changes

When you need to modify the database schema:

### 1. Edit Schema File

**File:** `src/db/schema.ts`

Example - Adding a field:
```typescript
export const radioStations = pgTable('radio_stations', {
  // ... existing fields
  website: varchar('website', { length: 500 }), // New field
});
```

### 2. Generate Migration (Optional)

```bash
npm run db:generate
```

This creates a migration file in `src/db/migrations/`

### 3. Push to Database

```bash
npm run db:push
```

This updates your database with the schema changes.

### 4. Update Seed Script (if needed)

**File:** `src/db/seed.ts`

Add data for new fields:
```typescript
await db.insert(radioStations).values({
  // ... existing values
  website: 'https://magicfm.com',
});
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `connection refused` or `ECONNREFUSED`

**Solutions:**
```bash
# Check if PostgreSQL is running
# macOS (Homebrew)
brew services list

# Start PostgreSQL if not running
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# Windows
# Check Services app for PostgreSQL service
```

**Error:** `password authentication failed`

**Solutions:**
- Verify username and password in `.env.local`
- Check PostgreSQL user exists: `psql -U postgres -l`
- Reset password if needed: `ALTER USER postgres PASSWORD 'newpassword';`

### Schema Push Failures

**Error:** `relation "table_name" already exists`

**Solutions:**
```bash
# Option 1: Drop and recreate database
dropdb radio_streaming
createdb radio_streaming
npm run db:push

# Option 2: Drop specific table in psql
psql radio_streaming
DROP TABLE table_name CASCADE;
\q
npm run db:push
```

**Error:** Syntax error in schema

**Solutions:**
- Check `src/db/schema.ts` for syntax errors
- Verify all imports are correct
- Run `npm run build` to check TypeScript errors

### Seed Script Failures

**Error:** `duplicate key value violates unique constraint`

**Solutions:**
```bash
# Database already has data, clear and reseed
psql radio_streaming
TRUNCATE TABLE users, radio_stations, programs, payments, analytics_daily, analytics_geography RESTART IDENTITY CASCADE;
\q
npm run db:seed
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### TypeScript Errors

**Error:** Type errors in code

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript server in VS Code
# CMD+Shift+P → "TypeScript: Restart TS Server"
```

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use strong `NEXTAUTH_SECRET` in production
- ✅ Use environment-specific database URLs
- ✅ Rotate API keys periodically

### Database Security
- ✅ Use connection pooling in production
- ✅ Enable SSL for database connections
- ✅ Use parameterized queries (Drizzle handles this)
- ✅ Regular database backups
- ✅ Implement rate limiting on API endpoints

### Authentication
- ✅ Hash passwords with bcrypt (not dummy hashes)
- ✅ Use secure session storage
- ✅ Implement CSRF protection
- ✅ Validate all API inputs

## 📈 Performance Optimization

- **Database Indexing**: All foreign keys and frequently queried fields are indexed
- **Connection Pooling**: Use pg pool in production (configured in `src/db/index.ts`)
- **Caching**: Implement Redis caching for frequently accessed data (future)
- **API Rate Limiting**: Prevent abuse (implement in Phase 2)

## 🚀 Deployment

### Prerequisites for Production

- [ ] PostgreSQL database (AWS RDS, Supabase, etc.)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Email service configured
- [ ] Domain and SSL certificate

### Deployment Options

**Option 1: Vercel (Recommended for Next.js)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add DATABASE_URL, NEXTAUTH_SECRET, etc.
```

**Option 2: Docker**
```bash
# Build image
docker build -t radio-streaming-backend .

# Run container
docker run -p 3000:3000 --env-file .env.local radio-streaming-backend
```

**Option 3: VPS (DigitalOcean, Linode, etc.)**
```bash
# SSH into server
ssh user@your-server

# Clone repository
git clone <repo-url>
cd radio-app/cloud/backend

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
npm i -g pm2
pm2 start npm --name "radio-backend" -- start
```

## 📊 Current Status

### ✅ Phase 1 Complete
- [x] Next.js 14+ project initialized
- [x] TypeScript 5.9+ configured
- [x] Drizzle ORM setup
- [x] PostgreSQL database schema
- [x] Database seeding script
- [x] Environment configuration
- [x] Project documentation

### ⏳ Phase 2 In Progress
- [ ] Public mobile API endpoints
- [ ] API key validation middleware
- [ ] Rate limiting
- [ ] Error handling

### 📋 Upcoming Phases
- **Phase 3**: Admin dashboard backend
- **Phase 4**: Admin dashboard frontend
- **Phase 5**: Station user backend
- **Phase 6**: Station user frontend
- **Phase 7**: Mobile app integration
- **Phase 8-9**: Testing and deployment

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Vercel Team** - Next.js framework
- **Drizzle Team** - Type-safe ORM
- **PostgreSQL Community** - Robust database
- **Open Source Contributors** - Amazing tools

---

**Built with ❤️ for the radio streaming community**

**Current Phase:** Phase 1 Complete ✅ | **Next:** Phase 2 - Public Mobile API
