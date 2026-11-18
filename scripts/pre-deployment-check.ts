import 'dotenv/config'
import { createClient } from '@libsql/client'

const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message: string }> = []

function check(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
  checks.push({ name, status, message })
}

// Check environment variables
const requiredEnvVars = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    check(envVar, 'fail', `Missing required environment variable: ${envVar}`)
  } else if (envVar === 'JWT_SECRET' && process.env[envVar].length < 32) {
    check(envVar, 'fail', 'JWT_SECRET must be at least 32 characters')
  } else if (envVar === 'ADMIN_PASSWORD' && process.env[envVar].length < 12) {
    check(envVar, 'fail', 'ADMIN_PASSWORD must be at least 12 characters')
  } else {
    check(envVar, 'pass', 'Configured correctly')
  }
}

// Check blob token
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  check('BLOB_READ_WRITE_TOKEN', 'warn', 'Not configured - media uploads will not work in production')
} else {
  check('BLOB_READ_WRITE_TOKEN', 'pass', 'Configured')
}

// Check Turso connection
try {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  if (url && !url.startsWith('file:') && token) {
    const client = createClient({ url, authToken: token })
    const result = await client.execute('SELECT COUNT(*) as count FROM users')
    const userCount = Number(result.rows[0]?.count ?? 0)
    check('Turso Connection', 'pass', `Connected successfully. Found ${userCount} users.`)
    
    // Check critical tables
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    check('Database Tables', 'pass', `Found ${tables.rows.length} tables`)
    
    // Check pages
    const pages = await client.execute('SELECT COUNT(*) as count FROM pages WHERE status = ?', ['published'])
    const pageCount = Number(pages.rows[0]?.count ?? 0)
    check('Published Pages', 'pass', `${pageCount} pages ready`)
    
    // Check services
    const services = await client.execute('SELECT COUNT(*) as count FROM services WHERE status = ?', ['published'])
    const serviceCount = Number(services.rows[0]?.count ?? 0)
    check('Published Services', 'pass', `${serviceCount} services ready`)
    
    await client.close()
  }
} catch (error) {
  check('Turso Connection', 'fail', `Connection failed: ${error instanceof Error ? error.message : String(error)}`)
}

// Output results
console.log('\n=== Pre-Deployment Check Results ===\n')

const passed = checks.filter((c) => c.status === 'pass').length
const failed = checks.filter((c) => c.status === 'fail').length
const warnings = checks.filter((c) => c.status === 'warn').length

for (const { name, status, message } of checks) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`${icon} ${name}: ${message}`)
}

console.log(`\n=== Summary ===`)
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Warnings: ${warnings}`)
console.log(`Total: ${checks.length}`)

if (failed > 0) {
  console.log('\n❌ Pre-deployment check FAILED. Fix the errors above before deploying.')
  process.exit(1)
} else if (warnings > 0) {
  console.log('\n⚠️ Pre-deployment check passed with warnings. Review warnings before deploying.')
  process.exit(0)
} else {
  console.log('\n✅ All checks passed! Ready for deployment.')
  process.exit(0)
}
