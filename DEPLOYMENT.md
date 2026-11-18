# AWO Driving School - Production Deployment Guide

## Pre-Deployment Status

### ✅ Completed
- **Database Migration**: Turso database fully migrated with all 20 tables
- **Data Verification**: All local and Turso data verified as matching
- **Build System**: Frontend builds successfully with Vite
- **Lint Status**: No blocking errors (minor React hook warnings only)
- **Database Layer**: All queries converted to async/await with `@libsql/client`
- **API Routes**: Express backend properly structured for Vercel serverless
- **Migration Scripts**: Database and media migration scripts ready
- **Git Configuration**: `.env` properly ignored, no secrets in repository

### ⚠️ Requires Configuration
- **Vercel Blob Storage**: Token needed for persistent media uploads
- **Vercel Environment Variables**: Need to be configured in Vercel dashboard

---

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link to Vercel Project
```bash
cd E:\AWO-Driving-School
vercel link
```

If this is a new project, create it during the linking process.

### 4. Configure Vercel Environment Variables

Set these environment variables in the Vercel dashboard or using the CLI:

```bash
# Required Production Secrets
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add JWT_SECRET production
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add FRONTEND_ORIGIN production
```

**Environment Variable Values:**

| Variable | Source | Notes |
|----------|--------|-------|
| `TURSO_DATABASE_URL` | From your local `.env` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | From your local `.env` | Your Turso auth token |
| `JWT_SECRET` | From your local `.env` | Min 32 characters |
| `ADMIN_EMAIL` | From your local `.env` | Admin login email |
| `ADMIN_PASSWORD` | From your local `.env` | Min 12 characters |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage | Get from Vercel dashboard |
| `FRONTEND_ORIGIN` | Your Vercel domain | e.g., `https://awo-driving-school.vercel.app` |

#### Getting Vercel Blob Token

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Create a new Blob store if you don't have one
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Add it to your environment variables

### 5. Migrate Local Media to Vercel Blob

After configuring the blob token in Vercel, add it to your local `.env` temporarily to run the migration:

```bash
# Add to .env temporarily
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx...

# Run migration
npm run media:migrate
```

Expected output:
```json
{
  "localFilesFound": 6,
  "blobUrlsUpdated": 6
}
```

This will:
- Upload all images from `wwwroot/uploads` to Vercel Blob
- Update all database references to use the new Blob URLs
- Preserve existing media in the database

### 6. Deploy to Production

```bash
vercel --prod
```

This will:
- Build the frontend with Vite
- Deploy the Express API as serverless functions
- Configure all routes and rewrites
- Make the site live

### 7. Verify Deployment

After deployment, test these critical endpoints:

**Public Endpoints:**
- `https://your-domain.vercel.app/` - Homepage
- `https://your-domain.vercel.app/api/health` - API health check
- `https://your-domain.vercel.app/api/pages/home` - Page content
- `https://your-domain.vercel.app/api/gallery` - Gallery with Blob images

**Admin Endpoints:**
- `https://your-domain.vercel.app/admin` - Admin login
- Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Test dashboard statistics
- Test page editing
- Test media upload (should use Vercel Blob)
- Test booking/enquiry management

### 8. Post-Deployment Configuration

Update `FRONTEND_ORIGIN` in Vercel environment variables to match your actual deployed domain:

```bash
vercel env add FRONTEND_ORIGIN production
# Enter: https://your-actual-domain.vercel.app
```

Redeploy after updating:
```bash
vercel --prod
```

---

## Database Status

### Tables (20 total)

| Table | Local Rows | Turso Rows | Status |
|-------|-----------|-----------|--------|
| users | 2 | 2 | ✅ Synced |
| pages | 16 | 16 | ✅ Synced |
| page_sections | 26 | 26 | ✅ Synced |
| services | 6 | 6 | ✅ Synced |
| faqs | 4 | 4 | ✅ Synced |
| testimonials | 0 | 0 | ✅ Synced |
| service_areas | 2 | 2 | ✅ Synced |
| pricing_plans | 3 | 3 | ✅ Synced |
| bookings | 4 | 4 | ✅ Synced |
| enquiries | 2 | 2 | ✅ Synced |
| gallery_items | 6 | 6 | ✅ Synced |
| media | 6 | 6 | ✅ Synced |
| site_settings | 5 | 5 | ✅ Synced |
| smtp_settings | 1 | 1 | ✅ Synced |
| schema_migrations | 5 | 5 | ✅ Synced |
| email_logs | 0 | 0 | ✅ Synced |
| password_reset_tokens | 0 | 0 | ✅ Synced |
| navigation_items | 0 | 0 | ✅ Synced |
| navigation_items_cms | 0 | 0 | ✅ Synced |
| contact_messages | 0 | 0 | ✅ Synced |

### Media Files

- **Local uploads**: 6 images in `wwwroot/uploads/2026/11/`
- **Status**: Ready for Vercel Blob migration
- **Action**: Run `npm run media:migrate` after configuring `BLOB_READ_WRITE_TOKEN`

---

## Troubleshooting

### Database Connection Issues

If you see database errors:
1. Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel
2. Run `npm run db:verify` locally to confirm sync
3. Check Vercel function logs for connection errors

### Media Upload Issues

If media uploads fail in production:
1. Verify `BLOB_READ_WRITE_TOKEN` is set correctly
2. Check Vercel Blob storage is enabled for your project
3. Ensure token has write permissions

### Authentication Issues

If admin login fails:
1. Verify `JWT_SECRET` is at least 32 characters
2. Confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD` match what's in the database
3. Check that `FRONTEND_ORIGIN` matches your deployed domain

### Build Errors

If build fails on Vercel:
1. Test build locally: `npm run build`
2. Check Node.js version matches (use Node 18+)
3. Review Vercel build logs for specific errors

---

## Local Development

The project remains compatible with local development:

```bash
# Start both API and client
npm run dev

# Or run separately
npm run dev:server  # API on http://localhost:4000
npm run dev:client  # Frontend on http://localhost:5173
```

Local development uses:
- SQLite database at `server/data/awo.sqlite`
- Local file uploads at `wwwroot/uploads`
- Environment variables from `.env`

---

## Security Checklist

- ✅ `.env` is git-ignored
- ✅ No secrets in repository
- ✅ JWT authentication implemented
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on login endpoint
- ✅ CORS configured with explicit origins
- ✅ Helmet security headers
- ✅ Input validation with Zod
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation
- ✅ Admin-only routes protected with `requireAuth`

---

## Next Steps After Deployment

1. **Test All Features**: Systematically test each admin and public feature
2. **Configure SMTP**: Set up email settings in admin dashboard for contact/booking emails
3. **Custom Domain**: Configure a custom domain in Vercel if desired
4. **Monitoring**: Set up Vercel Analytics and error monitoring
5. **Backup Strategy**: Schedule regular Turso database backups
6. **Content Review**: Review and publish any draft pages/services
7. **SSL Certificate**: Verify HTTPS is working (Vercel provides this automatically)

---

## Support Commands

```bash
# Verify database sync
npm run db:verify

# Re-import database (CAUTION: only on empty Turso)
npm run db:import

# Migrate media to Blob
npm run media:migrate

# Run API tests
npm run test:api

# Check build
npm run build

# Check lint
npm run lint
```

---

## Production URLs

After deployment, your site will be available at:
- **Production**: `https://[your-project].vercel.app`
- **Admin**: `https://[your-project].vercel.app/admin`
- **API**: `https://[your-project].vercel.app/api/health`

The exact URL will be shown in the Vercel CLI output after deployment.
