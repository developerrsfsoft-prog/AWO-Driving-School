import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createServer, type Server } from 'node:http'
import { after, test } from 'node:test'
import Database from 'better-sqlite3'
import { createClient } from '@libsql/client'

const sourcePath = path.resolve('server/data/awo.sqlite')
const testDirectory = process.env.AWO_API_TEST_DIR
if (!testDirectory) throw new Error('API test runner did not provide AWO_API_TEST_DIR.')
const testDatabasePath = path.join(testDirectory, 'awo.sqlite')
const testUploadsPath = path.join(testDirectory, 'uploads')
const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured to run API tests.')
}

fs.copyFileSync(sourcePath, testDatabasePath)
const local = new Database(testDatabasePath)
local.prepare('UPDATE smtp_settings SET enabled = 0').run()
const storedSmtpPassword = local.prepare('SELECT password FROM smtp_settings ORDER BY id ASC LIMIT 1').get() as { password: string }
local.close()

process.env.TURSO_DATABASE_URL = `file:${testDatabasePath}`
process.env.TURSO_AUTH_TOKEN = ''
process.env.UPLOADS_DIR = testUploadsPath
process.env.APP_DISABLE_LISTEN = '1'
process.env.VERCEL = ''
process.env.JWT_SECRET = 'api-test-jwt-secret-with-at-least-32-characters'

let server: Server | undefined
let closeDatabase: (() => Promise<void>) | undefined
let baseUrl = ''

test('database migrations apply multiple statements and preserve trigger definitions', async () => {
  const migrationPath = path.join(testDirectory, 'migration.sqlite')
  const client = createClient({ url: `file:${migrationPath}` })
  const migrationsDirectory = path.resolve('server/migrations')
  try {
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    const files = fs.readdirSync(migrationsDirectory)
      .filter((filename) => /^\d+_.+\.sql$/.test(filename))
      .sort()
    for (const filename of files) {
      const tx = await client.transaction('write')
      try {
        await tx.executeMultiple(fs.readFileSync(path.join(migrationsDirectory, filename), 'utf8'))
        await tx.execute({
          sql: 'INSERT INTO schema_migrations (version, filename) VALUES (?, ?)',
          args: [Number(filename.split('_', 1)[0]), filename],
        })
        await tx.commit()
      } catch (error) {
        await tx.rollback()
        throw error
      }
    }
    const versions = await client.execute('SELECT COUNT(*) AS count FROM schema_migrations')
    const triggers = await client.execute("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'trigger'")
    assert.equal(Number(versions.rows[0]?.count), files.length)
    assert.ok(Number(triggers.rows[0]?.count) >= 9)
  } finally {
    await client.close()
  }
})

test('API auth, CMS, bookings, enquiries, SMTP, reset, and media workflows', async () => {
  const { default: app } = await import('../api/index.js')
  const { closeDb } = await import('../server/db.js')
  closeDatabase = closeDb
  server = createServer(app)
  await new Promise<void>((resolve, reject) => {
    server?.once('error', reject)
    server?.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  baseUrl = `http://127.0.0.1:${address.port}`

  const health = await fetch(`${baseUrl}/api/health`)
  assert.equal(health.status, 200)
  const pages = await fetch(`${baseUrl}/api/pages`)
  assert.equal(pages.status, 200)
  assert.ok(Array.isArray(await pages.json()))

  const login = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  })
  assert.equal(login.status, 200)
  const loginData = await login.json() as { token: string }
  assert.ok(loginData.token)
  const authorization = { Authorization: `Bearer ${loginData.token}` }

  const smtp = await fetch(`${baseUrl}/api/admin/smtp`, { headers: authorization })
  assert.equal(smtp.status, 200)
  const smtpData = await smtp.json() as Record<string, unknown>
  assert.equal('password' in smtpData, false)
  const updateSmtp = await fetch(`${baseUrl}/api/admin/smtp`, {
    method: 'PUT',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: smtpData.host,
      port: smtpData.port,
      secure: smtpData.secure,
      username: smtpData.username,
      password: '',
      from_email: smtpData.from_email,
      from_name: smtpData.from_name,
      enabled: false,
    }),
  })
  assert.equal(updateSmtp.status, 200)
  const updatedSmtpDatabase = new Database(testDatabasePath, { readonly: true })
  const afterSmtpUpdate = updatedSmtpDatabase
    .prepare('SELECT password FROM smtp_settings ORDER BY id ASC LIMIT 1').get() as { password: string }
  assert.equal(afterSmtpUpdate.password, storedSmtpPassword.password)
  updatedSmtpDatabase.close()

  const slug = `api-test-${randomUUID()}`
  const pagePayload = {
    slug,
    title: 'API test page',
    description: 'API test page description.',
    status: 'draft',
    sections: [{ heading: 'Test section', body: 'Test body.', items: ['One'] }],
  }
  const createPage = await fetch(`${baseUrl}/api/admin/pages`, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify(pagePayload),
  })
  assert.equal(createPage.status, 201)
  const updatePage = await fetch(`${baseUrl}/api/admin/pages/${slug}`, {
    method: 'PUT',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...pagePayload, title: 'Updated API test page' }),
  })
  assert.equal(updatePage.status, 200)
  const deletePage = await fetch(`${baseUrl}/api/admin/pages/${slug}`, {
    method: 'DELETE',
    headers: authorization,
  })
  assert.equal(deletePage.status, 200)

  const booking = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'API Test Learner',
      phone: '+447700900123',
      email: 'api-test@example.invalid',
      drivingExperience: 'I am testing the booking API end to end.',
      lessonType: 'Beginner lesson',
      preferredDate: '2026-12-01',
      preferredTime: '10:00',
      contactPreference: 'Email',
      message: 'Automated test booking.',
    }),
  })
  assert.equal(booking.status, 201)
  assert.ok((await booking.json() as { bookingReference: string }).bookingReference)

  const contact = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'API Test Contact',
      email: 'api-contact@example.invalid',
      phone: '+447700900123',
      message: 'This is an automated contact form test.',
    }),
  })
  assert.equal(contact.status, 201)

  const forgot = await fetch(`${baseUrl}/api/admin/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail }),
  })
  assert.equal(forgot.status, 200)
  const forgotData = await forgot.json() as Record<string, unknown>
  assert.equal('token' in forgotData, false)
  const resetDatabase = new Database(testDatabasePath, { readonly: true })
  const resetToken = resetDatabase
    .prepare('SELECT token FROM password_reset_tokens ORDER BY id DESC LIMIT 1').get() as { token: string }
  resetDatabase.close()
  const reset = await fetch(`${baseUrl}/api/admin/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken.token, password: 'Temporary-Test-Password-123!' }),
  })
  assert.equal(reset.status, 200)

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf2sAAAAASUVORK5CYII=', 'base64')
  const uploadForm = new FormData()
  uploadForm.append('files', new Blob([png], { type: 'image/png' }), 'api-test.png')
  const upload = await fetch(`${baseUrl}/api/admin/media/upload`, {
    method: 'POST',
    headers: authorization,
    body: uploadForm,
  })
  assert.equal(upload.status, 201)
  const uploadData = await upload.json() as { item: { id: number; url: string } }
  assert.match(uploadData.item.url, /^\/uploads\//)

  const replaceForm = new FormData()
  replaceForm.append('file', new Blob([png], { type: 'image/png' }), 'replacement.png')
  const replace = await fetch(`${baseUrl}/api/admin/media/${uploadData.item.id}`, {
    method: 'PUT',
    headers: authorization,
    body: replaceForm,
  })
  assert.equal(replace.status, 200)
  const updateMedia = await fetch(`${baseUrl}/api/admin/media/${uploadData.item.id}`, {
    method: 'PUT',
    headers: { ...authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: 'API test image' }),
  })
  assert.equal(updateMedia.status, 200)
  const deleteMedia = await fetch(`${baseUrl}/api/admin/media/${uploadData.item.id}`, {
    method: 'DELETE',
    headers: authorization,
  })
  assert.equal(deleteMedia.status, 200)

  const invalidUploadForm = new FormData()
  invalidUploadForm.append('files', new Blob(['not an image'], { type: 'image/png' }), 'unsafe.png')
  const invalidUpload = await fetch(`${baseUrl}/api/admin/media/upload`, {
    method: 'POST',
    headers: authorization,
    body: invalidUploadForm,
  })
  assert.equal(invalidUpload.status, 400)
})

after(async () => {
  if (server?.listening) await new Promise<void>((resolve, reject) => server?.close((error) => error ? reject(error) : resolve()))
  if (closeDatabase) await closeDatabase()
})
