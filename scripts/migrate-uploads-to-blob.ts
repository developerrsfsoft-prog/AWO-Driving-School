import 'dotenv/config'
import { list, put } from '@vercel/blob'
import fs from 'node:fs/promises'
import path from 'node:path'
import { closeDb, dbAll, dbTransaction } from '../server/db.js'

const token = process.env.BLOB_READ_WRITE_TOKEN
const uploadsDirectory = path.resolve(process.env.UPLOADS_DIR || 'wwwroot/uploads')
const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}
const quoteIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`

if (!process.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL.startsWith('file:')) {
  throw new Error('Set TURSO_DATABASE_URL to the production Turso database before migrating media.')
}
if (!process.env.TURSO_AUTH_TOKEN || !token) {
  throw new Error('Set TURSO_AUTH_TOKEN and BLOB_READ_WRITE_TOKEN before migrating media.')
}

async function findFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await findFiles(fullPath))
    else if (entry.isFile()) files.push(fullPath)
  }
  return files
}

async function listExistingBlobs() {
  const byPath = new Map<string, string>()
  let cursor: string | undefined
  do {
    const page = await list({ prefix: 'awo-uploads/', cursor, token })
    for (const blob of page.blobs) byPath.set(blob.pathname, blob.url)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return byPath
}

try {
  const files = await findFiles(uploadsDirectory)
  const existingBlobs = await listExistingBlobs()
  const migrated: Array<{ oldUrl: string; newUrl: string }> = []

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase()
    const contentType = contentTypes[extension]
    if (!contentType) continue
    const relativePath = path.relative(uploadsDirectory, filePath).split(path.sep).join('/')
    const pathname = `awo-uploads/${relativePath}`
    let url = existingBlobs.get(pathname)
    if (!url) {
      const result = await put(pathname, await fs.readFile(filePath), {
        access: 'public',
        addRandomSuffix: false,
        contentType,
        token,
      })
      url = result.url
      existingBlobs.set(pathname, url)
    }
    migrated.push({ oldUrl: `/uploads/${relativePath}`, newUrl: url })
  }

  const tables = await dbAll<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  )
  await dbTransaction(async (tx) => {
    for (const { name } of tables) {
      const tableName = quoteIdentifier(name)
      const columns = await tx.execute(`PRAGMA table_info(${tableName})`)
      const textColumns = columns.rows
        .filter((row) => /TEXT|CHAR|CLOB/i.test(String(row.type ?? '')))
        .map((row) => String(row.name))
      for (const column of textColumns) {
        const columnName = quoteIdentifier(column)
        for (const item of migrated) {
          await tx.execute({
            sql: `UPDATE ${tableName} SET ${columnName} = replace(${columnName}, ?, ?) WHERE instr(${columnName}, ?) > 0`,
            args: [item.oldUrl, item.newUrl, item.oldUrl],
          })
        }
      }
    }
  })

  console.log(JSON.stringify({ localFilesFound: files.length, blobUrlsUpdated: migrated.length }))
} finally {
  await closeDb()
}
