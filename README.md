# AWO Driving School

Responsive AWO Driving School site built with React, TypeScript, Vite, Tailwind CSS, Express, and SQLite. The existing homepage, header, and footer remain the public site's design foundation.

## Local setup

1. Install Node.js 20 or newer and copy `.env.example` to `.env`.
2. Replace `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` with private values. The secret must contain at least 32 characters and the initial admin password at least 12.
3. Run `npm install`, then `npm run dev`. This starts Vite on port 5173 and the Express API on port 4000; Vite proxies `/api` requests to Express.

The API creates `server/data/awo.sqlite` and its parent directory automatically. Set `SQLITE_PATH` to an absolute path to store the database elsewhere. The first server start creates the initial admin user from the environment variables and seeds the editable page/service data. Passwords are stored as bcrypt hashes.

`npm run server` starts only the backend. `npm run dev:client` starts only Vite. `npm run build` builds the frontend; `npm run lint` runs Oxlint.

## Content and bookings

Public content pages are loaded from `/api/pages/:slug`; published content and metadata are stored in SQLite. Public APIs return errors rather than substituting hardcoded page/settings content when the API is unavailable. The homepage retains its existing layout and hero while lesson cards, FAQs, and contact details are loaded from public APIs. The booking and contact forms validate in the browser and again in Express, then persist requests to SQLite. A booking response includes its generated reference. Refreshable public routes are served by the SPA fallback in the Express server when a frontend build exists.

The admin dashboard at `/admin` provides authenticated search and create/edit/publish/unpublish/delete workflows for pages (including sections and SEO), services, FAQs, testimonials, areas, pricing, bookings, enquiries, and settings. The editor uses validated JSON records rather than field-specific forms. The homepage's bespoke hero, teaching-process copy, practice-area copy, and motion remain in `HomePage.tsx`; those presentation sections are not yet editable through the seeded `home` page.

## Database migrations and backups

Versioned SQL migrations live under `server/migrations/` and are recorded in the `schema_migrations` table. They run transactionally when the server starts. Existing seed data is inserted idempotently by server initialization.

For a consistent local backup, stop the server and copy the database file configured by `SQLITE_PATH` (or `server/data/awo.sqlite`) to a secure backup location. Keep backups private because they contain contact and booking details. Test restores periodically.

## Deployment storage

The current database adapter is `better-sqlite3` and is intended for a persistent local filesystem. A typical Vercel function filesystem is ephemeral and must not be used to store this database. For Vercel, configure a persistent SQLite-compatible provider such as Turso/libSQL and adapt the database connection layer to its client/transaction API before deployment; that remote adapter is not configured in this repository yet. Keep the JWT secret, initial admin credentials, allowed frontend origin, and database credentials in the hosting provider's environment settings. Do not deploy until the persistent adapter and production origin are configured.

## Checks

```sh
npm run lint
npm run build
```
