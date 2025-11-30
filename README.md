# 📻 Radio Streaming Management Platform

A comprehensive multi-platform radio streaming management system that enables radio streamers to manage multiple radio station clients with custom-branded mobile apps and centralized web dashboards.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

## 🎯 Project Overview

This platform is designed for **radio streamers (admins)** who manage multiple radio station clients. Each client gets their own customized mobile app and access to a web dashboard, while the admin has full control over all stations, subscriptions, and deployments.

### 🏗️ Business Model

1. **Admin** registers radio stations in the web platform → API keys auto-generated
2. **Admin** clones Flutter mobile template → configures branding and API key
3. **Admin** builds and distributes customized mobile apps for each station
4. **Admin** tracks subscription payments and sends automated email reminders
5. **Radio stations** manage their own schedules, analytics, and branding via web dashboard
6. **Mobile app users** stream live radio from their favorite stations

## 📁 Project Structure

```
radio-app/
├── mobile/                     # Flutter mobile application (iOS & Android)
│   ├── lib/
│   │   ├── core/              # Services, dependency injection, config
│   │   ├── data/              # Models, repositories, data sources
│   │   ├── domain/            # Entities, repository interfaces, use cases
│   │   └── presentation/      # Views, view models, widgets
│   ├── .env.example           # Environment configuration template
│   ├── pubspec.yaml           # Flutter dependencies
│   └── README.md              # Mobile-specific documentation
│
├── cloud/backend/             # Next.js backend + web dashboards
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/          # API routes (public, admin, station)
│   │   │   ├── admin/        # Admin dashboard pages (Phase 4)
│   │   │   └── station/      # Station user pages (Phase 6)
│   │   ├── components/       # React components (Phase 4+)
│   │   ├── db/               # Drizzle schema, migrations, seed
│   │   └── lib/              # Utilities, auth, email
│   ├── drizzle.config.ts
│   ├── package.json
│   └── README.md              # Backend-specific documentation
│
├── CLAUDE.md                  # Project architecture documentation
└── README.md                  # This file
```

## 🚀 Technology Stack

### Mobile App
| Technology | Version | Purpose |
|------------|---------|---------|
| Flutter | 3.8+ | Cross-platform framework |
| Dart | 3.0+ | Programming language |
| just_audio | 0.9.36 | Audio streaming |
| audio_service | 0.18.12 | Background playback |
| Provider | Latest | State management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ | Full-stack framework |
| TypeScript | 5.0+ | Type-safe development |
| PostgreSQL | 15+ | Database |
| Drizzle ORM | Latest | Type-safe ORM |
| NextAuth.js | Latest | Authentication (Phase 3) |
| Nodemailer | Latest | Email service (Phase 3) |

## ⚙️ Getting Started

### Prerequisites

**For Mobile Development:**
- Flutter SDK 3.8+
- Dart SDK 3.0+
- Android Studio or Xcode
- Android/iOS device or emulator

**For Backend Development:**
- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- Git

### Quick Setup

#### 1. Mobile App

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# (Update API_KEY, stream URLs, branding)

# Run the app
flutter run

# Or build for release
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

**Mobile App Status:** ✅ Fully functional with mock data

For detailed mobile setup instructions, see [mobile/README.md](./mobile/README.md)

#### 2. Backend (Next.js)

```bash
# Navigate to backend directory
cd cloud/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your PostgreSQL credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/radio_streaming

# Create PostgreSQL database
createdb radio_streaming

# Push database schema
npm run db:push

# Seed sample data
npm run db:seed

# Run development server
npm run dev
```

**Backend Status:**
- ✅ Phase 1 Complete: Database schema, seed data
- ⏳ Phase 2 In Progress: Public mobile API endpoints

For detailed backend setup instructions, see [cloud/backend/README.md](./cloud/backend/README.md)

## 👥 User Roles & Capabilities

### Admin (Radio Streamer)
**Access:** Full platform control via admin dashboard

**Can:**
- Register and manage radio stations
- Generate and view API keys for each station
- Update station information, stream URLs, and branding
- Suspend/activate stations
- Track subscription payments manually
- Send automated subscription reminder emails (7 days, 1 day before due)
- View all stations and their status
- Monitor analytics across all stations

### Radio Station User
**Access:** Station-specific dashboard

**Can:**
- Manage their station's program schedules
- View listener analytics (daily totals, geography, peak times)
- Update station branding (logo, colors, description)
- View payment history and subscription status

### Mobile App User (End Users)
**Access:** Station-specific mobile app

**Can:**
- Stream live radio with play/pause/stop controls
- Play audio in background
- View today's program schedule
- Select streaming quality (high/medium/low)
- Receive media notifications with playback controls

## 🗄️ Database Schema

### Core Tables

**users** - Admin and station user accounts
- Fields: id, email, password_hash, name, role, station_id, timestamps
- Roles: admin, station

**radio_stations** - Radio station details and configuration
- Fields: id, name, slug, contact info, stream URLs, api_key, status, subscription dates, branding (JSON)
- Status: active, suspended

**programs** - Program schedules per station
- Fields: id, station_id, title, host_name, day_of_week, start_time, end_time, is_active

**payments** - Payment tracking records
- Fields: id, station_id, amount, payment_date, due_date, status, notes

**analytics_daily** - Daily listener metrics per station
- Fields: id, station_id, date, total_listeners, peak_listeners, peak_time

**analytics_geography** - Geographic listener distribution
- Fields: id, station_id, date, country, city, listener_count

## 🔌 API Endpoints (Planned)

### Public Mobile API (`/api/public/*`)
Authentication: API key in header

- `GET /api/public/config` - Station configuration and stream URLs
- `GET /api/public/schedule?date=YYYY-MM-DD` - Program schedule
- `POST /api/public/analytics` - Log listening session

### Admin API (`/api/admin/*`)
Authentication: NextAuth.js session (admin role)

- `GET /api/admin/stations` - List all stations
- `POST /api/admin/stations` - Create new station
- `PUT /api/admin/stations/[id]` - Update station
- `POST /api/admin/stations/[id]/suspend` - Suspend station
- `GET /api/admin/payments` - Payment management
- `POST /api/admin/emails/reminder` - Send reminders

### Station User API (`/api/station/*`)
Authentication: NextAuth.js session (station role)

- `GET /api/station/programs` - Get programs
- `POST /api/station/programs` - Create program
- `PUT /api/station/programs/[id]` - Update program
- `DELETE /api/station/programs/[id]` - Delete program
- `GET /api/station/analytics` - View analytics
- `PUT /api/station/branding` - Update branding

## 📋 Development Roadmap

### Phase 0: Documentation ✅ Complete
- [x] Project architecture documentation
- [x] CLAUDE.md files for each component
- [x] README files

### Phase 1: Backend Foundation ✅ Complete
- [x] Next.js 14+ with TypeScript
- [x] PostgreSQL database setup
- [x] Drizzle ORM schema
- [x] Database migrations and seeding

### Phase 2: Public Mobile API ⏳ In Progress
- [ ] API key validation middleware
- [ ] `/api/public/config` endpoint
- [ ] `/api/public/schedule` endpoint
- [ ] `/api/public/analytics` endpoint
- [ ] Rate limiting
- [ ] Error handling

### Phase 3: Admin Dashboard Backend
- [ ] NextAuth.js authentication setup
- [ ] Admin API endpoints (stations CRUD)
- [ ] Payment tracking endpoints
- [ ] Email service with Nodemailer
- [ ] Subscription reminder automation

### Phase 4: Admin Dashboard Frontend
- [ ] shadcn/ui components setup
- [ ] Station management interface
- [ ] API key management UI
- [ ] Payment tracking UI
- [ ] Email reminder controls

### Phase 5: Station User Backend
- [ ] Station API endpoints (programs CRUD)
- [ ] Analytics endpoints
- [ ] Branding update endpoints

### Phase 6: Station User Frontend
- [ ] Station dashboard UI
- [ ] Program schedule editor
- [ ] Analytics data visualization
- [ ] Branding management interface

### Phase 7: Mobile App Integration
- [ ] Replace mock data with real API
- [ ] API service layer in Flutter
- [ ] Error handling and offline support
- [ ] Suspension flow implementation

### Phase 8: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion

### Phase 9: Deployment
- [ ] Production database setup
- [ ] Next.js deployment (Vercel/custom)
- [ ] Mobile app store submission
- [ ] Monitoring and logging setup

## 🔒 Security Features

- **API Key Authentication**: Secure mobile app access
- **Session-based Auth**: NextAuth.js for web dashboards
- **Role-based Access Control**: Admin vs Station user permissions
- **Password Hashing**: bcrypt for user credentials
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Rate Limiting**: API abuse prevention
- **HTTPS**: Secure connections in production

## 🧪 Testing

### Mobile App
```bash
cd mobile
flutter test              # Run unit tests
flutter analyze           # Static code analysis
flutter build apk --debug # Test build
```

### Backend
```bash
cd cloud/backend
npm run lint              # Run ESLint
npm run build             # Test build
npm run db:studio         # Open Drizzle Studio
```

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Overall project architecture
- **[mobile/README.md](./mobile/README.md)** - Mobile app setup and development
- **[mobile/CLAUDE.md](./mobile/CLAUDE.md)** - Mobile architecture and API integration
- **[cloud/backend/README.md](./cloud/backend/README.md)** - Backend setup and API docs
- **[cloud/backend/CLAUDE.md](./cloud/backend/CLAUDE.md)** - Backend architecture and database

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Areas We Need Help With
- 📱 Mobile app features and improvements
- 🌐 Web dashboard development
- 🔧 Backend API development
- 🎨 UI/UX enhancements
- 📖 Documentation improvements
- 🧪 Testing and QA

## 🐛 Troubleshooting

### Mobile App Issues
- **Build fails**: Run `flutter clean && flutter pub get`
- **Stream not playing**: Check stream URLs in `.env` file
- **Hot reload not working**: Restart the app completely

### Backend Issues
- **Database connection fails**: Verify PostgreSQL is running and `DATABASE_URL` is correct
- **Schema push fails**: Check for syntax errors in `src/db/schema.ts`
- **Seed fails**: Ensure database is empty or drop/recreate it
- **Port already in use**: Change port in `package.json` dev script

## 📞 Support

- **Documentation**: Check README files in each directory
- **Issues**: [Create an issue on GitHub](https://github.com/yourusername/radio-app/issues)
- **Email**: support@radiostreaming.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flutter Team** - Cross-platform mobile framework
- **Vercel Team** - Next.js framework
- **Drizzle Team** - Type-safe ORM
- **Open Source Community** - Amazing tools and libraries

---

**Built with ❤️ for the radio streaming community**

*Transform your radio station management with modern mobile apps and powerful web dashboards.*
