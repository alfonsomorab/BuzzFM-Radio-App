# ☁️ Cloud Platform - Next.js Backend + Web Dashboards

This directory contains the Next.js backend and web-based management platform for the radio streaming service.

## 🎯 Overview

The cloud platform provides a comprehensive web-based management system for radio stations, built as a single Next.js application with API routes and dashboard pages.

## 📁 Current Structure

```
cloud/
└── backend/                    # Next.js Full-Stack Application
    ├── src/
    │   ├── app/
    │   │   ├── api/           # API routes (public, admin, station)
    │   │   ├── admin/         # Admin dashboard pages
    │   │   ├── station/       # Station user pages
    │   │   ├── layout.tsx     # Root layout
    │   │   └── page.tsx       # Home page
    │   ├── components/        # React components
    │   ├── db/               # Drizzle ORM schema & migrations
    │   └── lib/              # Utilities, auth, email
    ├── drizzle.config.ts
    ├── package.json
    └── README.md

```

## 🚀 Technology Stack

### Backend
- **Next.js 14+** - Full-stack React framework with App Router
- **TypeScript 5.0+** - Type-safe development
- **PostgreSQL 15+** - Robust relational database
- **Drizzle ORM** - Type-safe ORM for database operations
- **NextAuth.js** - Authentication for web dashboards (Phase 3+)
- **Nodemailer + SMTP** - Email notifications (Phase 3+)

### Frontend (Web Dashboards)
- **Next.js with React** - Server and client components
- **Simple CSS & Bootstrap** - Responsive layouts and basic styling (NO Tailwind)
- **React components** - Custom UI components for dashboards

### Infrastructure
- **Vercel** (recommended) or **Docker** - Deployment options
- **PostgreSQL** - Database hosting (AWS RDS, Supabase, etc.)

## 🚀 Getting Started

See the detailed setup guide in [`backend/README.md`](./backend/README.md)

**Quick Start:**
```bash
cd cloud/backend
npm install
cp .env.example .env.local
# Edit .env.local with your database credentials
createdb radio_streaming
npm run db:push
npm run db:seed
npm run dev
```

Access the development server at `http://localhost:3000`

## 🎯 Features

### Current Features (Phase 1 Complete) ✅
- Complete database schema (6 tables)
- Drizzle ORM setup with PostgreSQL
- Database migrations and seeding
- Sample data for development
- API documentation with Swagger UI

### Planned Features

**Phase 2 - Public Mobile API:**
- API key authentication middleware
- Station configuration endpoint
- Program schedule endpoint
- Analytics logging endpoint
- Rate limiting

**Phase 3 - Admin Dashboard Backend:**
- NextAuth.js authentication
- Station CRUD operations
- Payment tracking
- Email service with subscription reminders
- User management

**Phase 4 - Admin Dashboard Frontend:**
- Simple responsive UI with Bootstrap
- Station management interface
- API key management
- Payment tracking interface
- Email reminder controls

**Phase 5-6 - Station User Features:**
- Station-specific dashboard
- Program schedule editor
- Analytics data visualization
- Branding management interface
- Payment history view

## 📊 API Endpoints (Planned)

### Public Mobile API (`/api/public/*`)
Authentication: API key in `Authorization: Bearer {key}` header
- `GET /api/public/config` - Station configuration
- `GET /api/public/schedule?date=YYYY-MM-DD` - Program schedule
- `POST /api/public/analytics` - Log listening session

### Admin API (`/api/admin/*`)
Authentication: NextAuth.js session (admin role)
- Station management (CRUD)
- Payment tracking
- Email notifications
- User management

### Station User API (`/api/station/*`)
Authentication: NextAuth.js session (station role)
- Program schedule management
- Analytics viewing
- Branding updates
- Payment history

## 🔐 Security Features

- **API Key Authentication** - Secure mobile app access
- **Session-based Auth** - NextAuth.js for web dashboards
- **Role-based Access Control** - Admin vs Station user permissions
- **Password Hashing** - bcrypt for user credentials
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Drizzle ORM parameterized queries
- **Rate Limiting** - API abuse prevention (Phase 2+)

## 📈 Development Phases

- **Phase 0** ✅: Project documentation
- **Phase 1** ✅: Backend foundation (database, schema, seed data)
- **Phase 2**: Public mobile API endpoints
- **Phase 3**: Admin dashboard backend
- **Phase 4**: Admin dashboard frontend (simple Bootstrap UI)
- **Phase 5**: Station user backend
- **Phase 6**: Station user frontend (simple Bootstrap UI)
- **Phase 7**: Mobile app integration
- **Phase 8-9**: Testing and deployment

## 🛠️ Development Commands

All commands should be run from the `backend/` directory:

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate migrations
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed sample data

# Code Quality
npm run lint             # Run ESLint
```

## 📚 Documentation

- **[backend/README.md](./backend/README.md)** - Detailed backend setup and API docs
- **[backend/CLAUDE.md](./backend/CLAUDE.md)** - Backend architecture and database schema
- **[backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)** - API specification guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
- Optimized for Next.js
- Automatic deployments from Git
- Built-in environment variables
- PostgreSQL via Vercel Postgres or external provider

### Option 2: Docker
- Containerized deployment
- Self-hosted on any VPS
- Full control over infrastructure

### Option 3: Traditional VPS
- Deploy to DigitalOcean, Linode, AWS EC2, etc.
- Use PM2 for process management
- nginx as reverse proxy

## 📞 Get Started

Ready to dive in? Check the [backend README](./backend/README.md) for comprehensive setup instructions.

---

**Note**: This platform uses **Next.js** (not Laravel) with simple Bootstrap styling (not Tailwind CSS). The architecture emphasizes simplicity and type safety throughout.

**Current Phase:** Phase 1 Complete ✅ | **Next:** Phase 2 - Public Mobile API
