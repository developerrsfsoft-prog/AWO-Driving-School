# AWO Driving School

Responsive React, TypeScript, Vite, Tailwind CSS, and Express application. The existing public website and admin experience are retained.

## Local development

1. Use Node.js 20 or newer and copy `.env.example` to `.env`.
2. Set `JWT_SECRET` to a private random value of at least 32 characters, `ADMIN_EMAIL` to a valid email address, and `ADMIN_PASSWORD` to a private password of at least 12 characters.
3. Leave `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` empty to use local SQLite, then run `npm install` and `npm run dev`.

The API listens on port 4000, and Vite proxies `/api` and `/uploads` to it. Local SQLite defaults to `server/data/awo.sqlite`; `SQLITE_PATH` and `UPLOADS_DIR` can override local paths. Never replace or delete the checked-out database/backups or files in `wwwroot/uploads`.

## Database

The Express API uses `@libsql/client` for both Turso and local SQLite. Versioned migrations under `server/migrations` execute as multi-statement transactions and record versions in `schema_migrations`. On local SQLite only, initial users and default content are inserted when the corresponding tables are empty. Production Turso initialization never seeds or replaces user data.

`npm run db:import` copies every user table, row, ID, schema object, and SQLite autoincrement sequence to an **empty** Turso database. It intentionally refuses to run when the destination already contains tables. Configure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` before running it. Verify the source and destination with `npm run db:verify`; comparison ignores only `schema_migrations.applied_at` and `smtp_settings.updated_at`.

## Media storage

New local-development uploads are stored under `wwwroot/uploads`. Production uploads are validated and stored in Vercel Blob; the API does not depend on Vercel's temporary filesystem. `npm run media:migrate` uploads existing local files and replaces references across text columns in Turso. The script requires `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `BLOB_READ_WRITE_TOKEN`. It does not remove or alter the source files, and it can be rerun safely.

## Production deployment

Create a Vercel project connected to this repository, a Turso database, and a Vercel Blob store. Configure these values in Vercel's Production environment (do not commit `.env` or enter secrets into source files):

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `BLOB_READ_WRITE_TOKEN`
- `JWT_SECRET` (at least 32 characters)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (at least 12 characters)
- `FRONTEND_ORIGIN` (the deployed site origin, such as `https://example.com`)

For a **new empty** Turso database, import the preserved SQLite data before deploying:

```powershell
npm run db:import
npm run db:verify
npm run media:migrate
```

For the already-populated Turso database that has been verified against the local SQLite records, do **not** run `db:import`; it will refuse to overwrite the database. Once the Blob token is configured, run only `npm run media:migrate` to move the existing uploads and URLs.

Link and deploy with the Vercel CLI:

```powershell
npx vercel login
npx vercel link
npx vercel env add TURSO_DATABASE_URL production
npx vercel env add TURSO_AUTH_TOKEN production
npx vercel env add BLOB_READ_WRITE_TOKEN production
npx vercel env add JWT_SECRET production
npx vercel env add ADMIN_EMAIL production
npx vercel env add ADMIN_PASSWORD production
npx vercel env add FRONTEND_ORIGIN production
npm run build
npx vercel --prod
```

The API is exported by `api/index.ts`; `vercel.json` routes API requests to the Express application and refreshes of client-side routes to the Vite SPA. Vercel deploys only after the external project and environment variables are configured. Confirm the deployment in Vercel and check `/api/health` before sharing a live URL.

## Checks

```powershell
npm run build
npm run lint
npm run test:api
npm run db:verify
```
