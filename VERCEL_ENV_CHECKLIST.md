# Vercel Environment Variables Checklist

## Required for Production Deployment

Before deploying to Vercel, configure these environment variables in the Vercel dashboard:

### 1. Database Configuration
```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here
```
**Source**: Copy from your local `.env` file
**Status**: ✅ Already configured and verified in Turso

### 2. Authentication & Security
```bash
JWT_SECRET=your_jwt_secret_min_32_characters
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_admin_password_min_12_chars
```
**Source**: Copy from your local `.env` file
**Security**: Never commit these to Git

### 3. Frontend Configuration
```bash
FRONTEND_ORIGIN=https://your-project-name.vercel.app
```
**Note**: Update this after first deployment with your actual Vercel domain

### 4. Media Storage
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```
**Source**: Get from Vercel Dashboard → Storage → Blob
**Required for**: Persistent image uploads in production

---

## How to Set Environment Variables

### Option 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Select "Production" environment
6. Click "Save"

### Option 2: Vercel CLI
```bash
vercel env add TURSO_DATABASE_URL production
# Paste value when prompted

vercel env add TURSO_AUTH_TOKEN production
# Paste value when prompted

vercel env add JWT_SECRET production
# Paste value when prompted

vercel env add ADMIN_EMAIL production
# Paste value when prompted

vercel env add ADMIN_PASSWORD production
# Paste value when prompted

vercel env add BLOB_READ_WRITE_TOKEN production
# Paste value when prompted (get from Vercel Blob Storage first)

vercel env add FRONTEND_ORIGIN production
# Enter your Vercel domain: https://your-project.vercel.app
```

---

## Verification Steps

### Before Deployment
- [ ] Local build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Database verified: `npm run db:verify`
- [ ] All env vars ready (except BLOB_READ_WRITE_TOKEN)

### During Deployment
- [ ] Create Vercel Blob storage
- [ ] Copy BLOB_READ_WRITE_TOKEN
- [ ] Set all environment variables in Vercel
- [ ] Deploy: `vercel --prod`

### After Deployment
- [ ] Test homepage loads
- [ ] Test API health: `/api/health`
- [ ] Test admin login
- [ ] Run media migration: `npm run media:migrate`
- [ ] Update FRONTEND_ORIGIN to actual domain
- [ ] Redeploy: `vercel --prod`
- [ ] Test media uploads work
- [ ] Test all admin functions
- [ ] Test public forms (contact, booking)

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Turso Database | ✅ Ready | 20 tables, all data migrated and verified |
| Frontend Build | ✅ Ready | Builds successfully with no errors |
| API Backend | ✅ Ready | All routes converted to async/await |
| Lint | ✅ Ready | No blocking errors |
| Git Configuration | ✅ Ready | .env ignored, no secrets in repo |
| Local Media | ⚠️ Pending | 6 images need Blob migration |
| Vercel Blob | ⚠️ Not Set | Need to create and get token |
| Deployment | ⚠️ Pending | Ready to deploy once Blob configured |

---

## Quick Deploy Commands

```bash
# 1. Login to Vercel
vercel login

# 2. Link project
vercel link

# 3. Set environment variables (one by one)
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add JWT_SECRET production
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add FRONTEND_ORIGIN production

# 4. Create Vercel Blob storage in dashboard, then add token
vercel env add BLOB_READ_WRITE_TOKEN production

# 5. Deploy
vercel --prod

# 6. After deployment, migrate media (add BLOB token to local .env first)
npm run media:migrate

# 7. Update FRONTEND_ORIGIN in Vercel to actual domain, then redeploy
vercel --prod
```
