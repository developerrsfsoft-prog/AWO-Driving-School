# 🚀 Deploy AWO Driving School to Vercel NOW

## ✅ Pre-Flight Check Complete
- Build: ✅ Success
- Lint: ✅ Pass
- Database: ✅ Turso migrated and verified
- Code: ✅ Production-ready

---

## 🎯 Deploy in 5 Steps (15 minutes)

### Step 1: Vercel Login (1 min)
```bash
vercel login
```
Follow the browser prompt to authenticate.

### Step 2: Link/Create Project (1 min)
```bash
cd E:\AWO-Driving-School
vercel link
```
- Create new project or link existing
- Accept defaults

### Step 3: Configure Environment Variables (5 min)

**Option A: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these for **Production** environment:

| Variable | Get Value From |
|----------|----------------|
| `TURSO_DATABASE_URL` | Copy from local `.env` |
| `TURSO_AUTH_TOKEN` | Copy from local `.env` |
| `JWT_SECRET` | Copy from local `.env` |
| `ADMIN_EMAIL` | Copy from local `.env` |
| `ADMIN_PASSWORD` | Copy from local `.env` |
| `FRONTEND_ORIGIN` | Enter: `https://your-project.vercel.app` (update after deploy) |
| `BLOB_READ_WRITE_TOKEN` | Get from next step ⬇️ |

**Option B: Vercel CLI**
```bash
vercel env add TURSO_DATABASE_URL production
# Paste value from .env when prompted
vercel env add TURSO_AUTH_TOKEN production
vercel env add JWT_SECRET production
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add FRONTEND_ORIGIN production
# Enter: https://your-project.vercel.app
```

### Step 4: Create Vercel Blob Storage (2 min)
1. Go to Vercel Dashboard → Your Project → **Storage**
2. Click **"Create Database"** → Select **"Blob"**
3. Name: `awo-media`
4. Click **Create**
5. **Copy** the `BLOB_READ_WRITE_TOKEN` shown
6. Add it to Environment Variables:
   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN production
   # Paste the token
   ```

### Step 5: Deploy! (5 min)
```bash
vercel --prod
```

Wait for:
```
✅ Build Complete
✅ Deployed to Production
🔗 https://your-project.vercel.app
```

---

## 🎉 Post-Deployment (5 min)

### 1. Migrate Media to Blob
```bash
# Add BLOB_READ_WRITE_TOKEN to your local .env
# Then run:
npm run media:migrate
```
Expected output:
```json
{ "localFilesFound": 6, "blobUrlsUpdated": 6 }
```

### 2. Update FRONTEND_ORIGIN
1. Copy your actual deployed URL from Vercel
2. Go to Vercel Dashboard → Environment Variables
3. Update `FRONTEND_ORIGIN` to your actual URL
4. Redeploy:
   ```bash
   vercel --prod
   ```

### 3. Test Your Site ✅
- **Homepage**: `https://your-domain.vercel.app`
- **API Health**: `https://your-domain.vercel.app/api/health`
- **Admin**: `https://your-domain.vercel.app/admin`
  - Login with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`

---

## 🆘 Quick Troubleshooting

### Build Fails?
```bash
# Test locally first
npm run build
```

### Can't Login?
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel env vars
- Verify `JWT_SECRET` is set and at least 32 characters

### API Errors?
- Check Vercel function logs in dashboard
- Verify all environment variables are set
- Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`

### Images Don't Upload?
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Blob storage is created
- Run `npm run media:migrate` to sync existing images

---

## 📊 What You Get

**Live Production Site With:**
- ✅ 16 SEO-optimized pages
- ✅ 6 driving lesson services
- ✅ Contact and booking forms
- ✅ Admin dashboard
- ✅ CMS for content management
- ✅ Image gallery
- ✅ Persistent database (Turso)
- ✅ Persistent media storage (Vercel Blob)
- ✅ Secure authentication
- ✅ Email notifications (SMTP)
- ✅ Mobile responsive
- ✅ Fast CDN delivery

**Admin Features:**
- Manage pages, services, FAQs
- Upload and manage images
- View and respond to bookings
- Track enquiries
- Configure site settings
- Manage pricing and areas
- Monitor email logs

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Homepage loads
- [ ] `/api/health` returns `{"ok": true}`
- [ ] Admin login works
- [ ] Dashboard shows statistics
- [ ] Pages can be edited
- [ ] Images upload successfully
- [ ] Forms submit (contact & booking)
- [ ] Submissions appear in admin
- [ ] All navigation works

---

## 🎯 Your Deployment Commands

```bash
# 1. Login
vercel login

# 2. Link project
vercel link

# 3. Deploy
vercel --prod

# 4. Migrate media (after configuring Blob token)
npm run media:migrate

# 5. Redeploy (after updating FRONTEND_ORIGIN)
vercel --prod
```

---

## 📚 Need More Details?

- **Full Guide**: See `DEPLOYMENT.md`
- **Environment Vars**: See `VERCEL_ENV_CHECKLIST.md`
- **Complete Status**: See `DEPLOYMENT_SUMMARY.md`
- **Quick Reference**: See `README_DEPLOYMENT.md`

---

## 🚀 Ready? Let's Deploy!

```bash
vercel --prod
```

**Your AWO Driving School website will be live in ~15 minutes!** ✨
