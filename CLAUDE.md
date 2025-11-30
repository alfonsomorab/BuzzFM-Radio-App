# Radio Streaming Management Platform

This file provides guidance to Claude Code when working with this multi-platform radio streaming management system.

## Project Purpose

A comprehensive platform for radio streamers (admins) to manage multiple radio station clients. The system enables:

- **Admins** to register radio stations, generate API keys, manage subscriptions, and deploy customized mobile apps
- **Radio Stations** to manage their program schedules, view analytics, and update branding
- **Mobile App Users** to stream live radio from their favorite stations

## Business Model

1. Admin (radio streamer) onboards new radio station clients
2. Each station gets registered in the system with contact info, stream URLs, and branding
3. System auto-generates an API key for each station
4. Admin creates a customized Flutter mobile app from template (configures branding, API key)
5. Admin tracks subscription payments and sends reminder emails
6. Radio stations can self-manage schedules, view analytics, and update their branding

## Multi-Platform Architecture

This monorepo contains three interconnected platforms:

### 📱 Mobile App (`/mobile/`)
- **Technology**: Flutter (iOS & Android)
- **Architecture**: MVVM + Clean Architecture with Repository pattern
- **Features**: Live radio streaming, program schedules, background audio, notifications
- **Current State**: ✅ Fully functional with mock data
- **Next Steps**: Integrate with real backend API

### 🖥️ Backend (`/backend/` - To Be Created)
- **Technology**: Next.js 14+ with TypeScript (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js (sessions) for web, API keys for mobile
- **Email**: Nodemailer + SMTP
- **Features**: Three API systems (public mobile API, admin API, station API)
- **Current State**: ❌ Not yet implemented
- **Next Steps**: Initialize Next.js project, setup database schema

### 🌐 Web Dashboard (`/backend/` - Frontend Pages)
- **Technology**: Next.js with shadcn/ui components
- **Features**: Two dashboards (admin and station user)
- **Admin Dashboard**: Station registration, API key management, payment tracking, email management
- **Station Dashboard**: Schedule editor, analytics viewing, branding management
- **Current State**: ❌ Not yet implemented
- **Next Steps**: Build admin pages first, then station user pages

## User Roles & Workflows

### Admin (Radio Streamer)
**Capabilities:**
- Register new radio stations with details (name, description, stream URLs, contacts)
- Generate and manage API keys for each station
- Update station information and stream URLs
- Suspend/activate stations
- Track subscription payments manually (Phase 1)
- Send automated subscription reminder emails (7 days and 1 day before due)
- View all stations and their status

**Typical Workflow:**
1. New client contacts admin to put their radio online
2. Admin registers station via web dashboard → API key auto-generated
3. Admin clones mobile template repository
4. Admin configures `.env` file (API key, branding, colors, URLs)
5. Admin builds and deploys customized mobile app
6. Admin monitors subscription due dates and sends reminders

### Radio Station User
**Capabilities:**
- Login to their dedicated dashboard
- Create, edit, and delete program schedules
- View listener analytics (daily totals, geography, peak times)
- Update station branding (logo, colors, description)
- View payment history and subscription status

**Typical Workflow:**
1. Login with credentials (email/password)
2. Manage weekly program schedule (show titles, hosts, time slots)
3. Monitor listener statistics and trends
4. Update branding elements as needed

### Mobile App (End Users)
**Capabilities:**
- Stream live radio with play/pause/stop controls
- Background audio playback
- Media notifications with playback controls
- View program schedules
- Quality selection (high/medium/low bitrate)
- Offline graceful handling

**Typical Workflow:**
1. App launches and makes API call with station's API key
2. Backend validates key and returns: stream URLs, station status
3. If active: display radio player and start streaming
4. If suspended: display "temporarily suspended" message
5. Fetch and display today's program schedule

## Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile Frontend | Flutter | 3.8+ |
| Mobile Language | Dart | 3.0+ |
| Backend Framework | Next.js (App Router) | 14+ |
| Backend Language | TypeScript | 5.0+ |
| Database | PostgreSQL | 15+ |
| ORM | Drizzle | Latest |
| Web UI Components | shadcn/ui | Latest |
| Mobile State Mgmt | Provider (ChangeNotifier) | - |
| Audio Streaming | just_audio | 0.9.36 |
| Background Audio | audio_service | 0.18.12 |
| Email Service | Nodemailer + SMTP | - |
| Authentication | NextAuth.js + API Keys | - |

## Repository Structure

```
radio-app/
├── mobile/                    # Flutter mobile application
│   ├── lib/
│   │   ├── core/             # Services, config, constants
│   │   ├── data/             # Models, datasources, repositories
│   │   ├── domain/           # Entities, repository interfaces, usecases
│   │   └── presentation/     # Views, viewmodels, widgets
│   ├── .env.example          # Environment configuration template
│   ├── pubspec.yaml          # Flutter dependencies
│   └── CLAUDE.md             # Mobile-specific documentation
│
├── backend/                   # Next.js backend + web dashboard (TO BE CREATED)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/          # API routes (public, admin, station)
│   │   │   ├── admin/        # Admin dashboard pages
│   │   │   └── station/      # Station user pages
│   │   ├── components/       # React components
│   │   ├── db/               # Drizzle schema and migrations
│   │   └── lib/              # Utilities, auth, email
│   ├── drizzle.config.ts
│   └── CLAUDE.md             # Backend-specific documentation (TO BE CREATED)
│
├── cloud/                     # Old planning documents (Laravel/React)
│   └── README.md             # Legacy architecture notes
│
├── CLAUDE.md                 # This file - overall project documentation
└── README.md                 # User-facing project readme

```

## Platform Integration Points

### Mobile ↔ Backend Integration

**Authentication:**
- Mobile apps authenticate using API key in `Authorization: Bearer {key}` header
- API keys are unique per station, generated on registration
- Backend validates key and returns associated station data

**Key Endpoints:**
- `GET /api/public/config` - Returns stream URLs, station status, branding
- `GET /api/public/schedule?date=YYYY-MM-DD` - Returns program schedule
- `POST /api/public/analytics` - Logs listening session data

**Configuration:**
Mobile app `.env` file contains:
```
API_BASE_URL=https://api.yourplatform.com
API_KEY=generated_station_api_key
APP_NAME=Station Name FM
PRIMARY_COLOR=#FF5733
```

### Web Dashboard ↔ Backend Integration

**Authentication:**
- Session-based authentication using NextAuth.js
- Separate login flows for admin and station users
- Role-based access control (RBAC)

**Admin Features:**
- Station CRUD operations
- API key generation and viewing
- Payment tracking and email scheduling
- Suspension/activation controls

**Station Features:**
- Program schedule CRUD
- Analytics data visualization
- Branding updates
- Payment history viewing

## Database Schema Overview

### Core Tables
- **users** - Admin and station user accounts with roles
- **radio_stations** - Station details, URLs, API keys, branding, status
- **programs** - Program schedules with day/time slots
- **payments** - Payment tracking with due dates and status
- **analytics_daily** - Daily listener metrics per station
- **analytics_geography** - Geographic listener distribution

See `/backend/CLAUDE.md` (when created) for detailed schema documentation.

## Development Workflow

### Current Phase: Phase 0 - Documentation
✅ Creating comprehensive CLAUDE.md files
- Root project overview (this file)
- Mobile-specific documentation
- Backend documentation (when initialized)

### Next Phases (In Order)

1. **Phase 1**: Backend Foundation - Initialize Next.js, setup database schema
2. **Phase 2**: Public Mobile API - Build endpoints for mobile app consumption
3. **Phase 3**: Admin Dashboard Backend - Authentication, station CRUD, payments
4. **Phase 4**: Admin Dashboard Frontend - UI for station management
5. **Phase 5**: Station User Backend - Schedule and analytics APIs
6. **Phase 6**: Station User Frontend - Station dashboard UI
7. **Phase 7**: Mobile App Integration - Replace mock data with real API
8. **Phase 8**: Testing & Polish - End-to-end testing
9. **Phase 9**: Deployment - Production hosting and configuration

## Getting Started for New Developers

### Prerequisites
- Flutter SDK 3.8+ (for mobile development)
- Node.js 18+ (for backend development)
- PostgreSQL 15+ (for database)
- Git

### Setup Steps

**Mobile App:**
```bash
cd mobile
flutter pub get
cp .env.example .env
# Edit .env with your configuration
flutter run
```

**Backend (When Created):**
```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local with database credentials
npm run db:push      # Setup database
npm run db:seed      # Seed initial data
npm run dev          # Start dev server
```

### Project-Specific Conventions

1. **Environment Configuration**: All platform-specific config goes in `.env` files
2. **No Hardcoded Values**: Stream URLs, API keys, branding must be configurable
3. **Template-Based Mobile**: Mobile app is cloned and configured per station
4. **API-First Design**: Mobile app is completely driven by backend APIs
5. **Clean Architecture**: Maintain separation of concerns in all platforms

## Common Cross-Platform Tasks

### Adding a New Radio Station
1. Admin registers station in web dashboard
2. System generates unique API key
3. Admin clones mobile template: `git clone <template-repo> new-station-app`
4. Admin configures `.env` with station-specific values
5. Admin builds and distributes mobile app
6. Station user logs into web dashboard to manage content

### Updating Stream URLs
1. Admin or station user updates URLs in web dashboard
2. Backend updates `radio_stations` table
3. Mobile app fetches new config on next startup (cached for performance)
4. New URLs take effect immediately

### Monitoring Analytics
1. Mobile apps send listening session data to `/api/public/analytics`
2. Backend aggregates data into daily/geographic tables
3. Station users view analytics in their dashboard
4. Admin can see aggregated metrics across all stations

## Testing Strategy

### Mobile Testing
- Unit tests for ViewModels and UseCases
- Widget tests for UI components
- Integration tests for full user flows
- Manual testing on real devices (iOS and Android)

### Backend Testing
- API endpoint tests (Jest or Vitest)
- Database migration tests
- Email sending tests (with sandbox SMTP)
- Authentication flow tests

### End-to-End Testing
- Test full registration → API key generation → mobile config flow
- Test suspension flow (backend suspends → mobile shows message)
- Test schedule updates (dashboard edit → mobile displays)

## Future Enhancements (Post-MVP)

- **Automated Payments**: Stripe integration for automatic billing
- **White-Label System**: Automated mobile app build generation from dashboard
- **Advanced Analytics**: Session duration, program performance, platform breakdown
- **Live Chat**: Real-time chat between listeners
- **Social Integration**: Share programs on social media
- **Multi-Language**: Support for multiple languages in mobile app
- **Push Notifications**: Server-triggered notifications for special broadcasts

## Key Architecture Decisions

1. **Next.js over Laravel**: TypeScript end-to-end, better DX, easier deployment
2. **Drizzle over Prisma**: Lighter weight, more SQL-like, better performance
3. **API Keys for Mobile**: Stateless, simple, perfect for mobile apps
4. **Sessions for Web**: Better UX for dashboard users with persistent login
5. **Manual Payments First**: Faster MVP, Stripe integration later
6. **Template-Based Mobile**: Simple, flexible, admin has full control
7. **shadcn/ui**: Customizable components without bloat

## Troubleshooting

### Mobile App Issues
See `/mobile/CLAUDE.md` for mobile-specific troubleshooting

### Backend Issues
See `/backend/CLAUDE.md` (when created) for backend troubleshooting

### Common Integration Issues
- **API Key Invalid**: Ensure key in mobile `.env` matches backend database
- **Stream URLs Not Loading**: Check mobile app is hitting correct API endpoint
- **Suspension Not Working**: Verify backend returns status='suspended' in config

## Documentation Updates

This documentation should be updated when:
- New major features are added
- Architecture decisions change
- New platforms/services are added
- Development workflow changes significantly

Last Updated: 2025-11-29 (Phase 0 - Initial Documentation)
