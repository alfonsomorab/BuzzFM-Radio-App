# Quick Start Guide - Phase 3 Admin Dashboard Backend

## 1. Setup (5 minutes)

```bash
# 1. Configure environment
cp .env.example .env.local

# 2. Edit .env.local - Set these REQUIRED variables:
#    JWT_SECRET (min 32 chars) - Generate: openssl rand -base64 32
#    NEXTAUTH_SECRET (min 32 chars) - Generate: openssl rand -base64 32
#    DATABASE_URL (your PostgreSQL connection)

# 3. Push database schema
npm run db:push

# 4. Seed admin user and sample data
npm run db:seed-admin

# 5. Start dev server
npm run dev
```

## 2. Test Credentials

### Admin Login
```
Email: admin@radioplatform.com
Password: Admin123!
```

### Station Users (for Phase 5)
```
Email: manager@magicfm.com
Password: Station123!
```

## 3. Test All Endpoints

```bash
# In a new terminal (make sure dev server is running)
./test-admin-api.sh
```

Expected: All 21 tests pass ✅

## 4. Login Example (cURL)

```bash
# Get session cookie
curl -i -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@radioplatform.com",
    "password": "Admin123!",
    "redirect": false
  }'

# Copy the Set-Cookie header value and use it in subsequent requests:
# Cookie: next-auth.session-token=...
```

## 5. Create Station Example

```bash
curl -X POST http://localhost:3000/api/admin/stations \
  -H "Cookie: YOUR_SESSION_COOKIE_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Radio Station",
    "slug": "my-radio-station",
    "contactEmail": "contact@myradio.com",
    "streamUrlPrimary": "https://streaming.example.com/myradio"
  }'

# Response includes API key - SAVE IT! (shown only once)
```

## 6. Send Test Email

```bash
curl -X POST http://localhost:3000/api/admin/emails/test \
  -H "Cookie: YOUR_SESSION_COOKIE_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "7-day"
  }'

# If SMTP not configured, response includes Ethereal preview URL
```

## 7. Common Issues

### "JWT_SECRET must be set"
- Edit `.env.local` and add: `JWT_SECRET=<32+ character string>`

### "NEXTAUTH_SECRET must be set"
- Edit `.env.local` and add: `NEXTAUTH_SECRET=<32+ character string>`

### Database connection failed
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Create database: `createdb radio_streaming`

### Tests failing
- Ensure dev server is running: `npm run dev`
- Ensure database is seeded: `npm run db:seed-admin`
- Check server logs for errors

## 8. Key Endpoints

### Authentication
```
POST /api/auth/callback/credentials  - Login
GET  /api/auth/session               - Get session
POST /api/auth/signout               - Logout
```

### Stations (Admin Only)
```
GET    /api/admin/stations              - List all
POST   /api/admin/stations              - Create
GET    /api/admin/stations/[id]         - Get one
PUT    /api/admin/stations/[id]         - Update
DELETE /api/admin/stations/[id]         - Delete
POST   /api/admin/stations/[id]/suspend - Suspend
POST   /api/admin/stations/[id]/activate- Activate
```

### Payments (Admin Only)
```
GET  /api/admin/payments           - List all
POST /api/admin/payments           - Create
GET  /api/admin/payments/[id]      - Get one
GET  /api/admin/payments/upcoming  - Expiring soon
```

### Emails (Admin Only)
```
GET  /api/admin/emails/templates   - List templates
POST /api/admin/emails/test        - Send test
POST /api/admin/emails/reminder    - Send reminder
```

## 9. Email Setup (Optional)

### Development (Default)
No setup needed! Uses Ethereal Email automatically.
Preview URLs included in API responses.

### Production (Gmail Example)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Generate in Gmail settings
SMTP_FROM=Radio Platform <noreply@yourdomain.com>
```

## 10. Next Steps

1. ✅ Phase 3 complete - Backend working
2. ➡️ Phase 4 - Build admin dashboard frontend
3. ⏭️ Phase 5 - Station user backend API
4. ⏭️ Phase 6 - Station user frontend
5. ⏭️ Phase 7 - Mobile app integration

---

**Need Help?** Check `PHASE_3_IMPLEMENTATION_REPORT.md` for detailed documentation.
