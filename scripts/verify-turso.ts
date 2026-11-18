import 'dotenv/config'
import { createHash } from 'node:crypto'
import Database from 'better-sqlite3'
import { createClient } from '@libsql/client'
import path from 'node:path'

const databaseUrl = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const sourcePath = path.resolve(process.env.SQLITE_PATH || 'server/data/awo.sqlite')

if (!databaseUrl || databaseUrl.startsWith('file:') || !authToken) {
  throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before verifying Turso.')
}

const source = new Database(sourcePath, { readonly: true, fileMustExist: true })
const target = createClient({ url: databaseUrl, authToken })
const quoteIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`
const volatileColumns: Record<string, Set<string>> = {
  schema_migrations: new Set(['applied_at']),
  smtp_settings: new Set(['updated_at']),
}
const normalize = (value: unknown) => {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Uint8Array) return [...value]
  return value
}
const hashRows = (rows: Array<Record<string, unknown>>, ignored: Set<string>) => createHash('sha256')
  .update(JSON.stringify(rows.map((row) => Object.fromEntries(
    Object.entries(row)
      .filter(([column]) => !ignored.has(column))
      .map(([column, value]) => [column, normalize(value)]),
  ))))
  .digest('hex')

try {
  const sourceTables = source.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ).all() as Array<{ name: string }>
  const targetTables = await target.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  )
  const targetNames = new Set(targetTables.rows.map((row) => String(row.name)))
  const tables = []
  for (const { name } of sourceTables) {
    if (!targetNames.has(name)) {
      tables.push({ table: name, localRows: -1, tursoRows: 0, contentMatch: false })
      continue
    }
    const tableName = quoteIdentifier(name)
    const localRows = source.prepare(`SELECT * FROM ${tableName} ORDER BY rowid`).all() as Array<Record<string, unknown>>
    const remoteRows = (await target.execute(`SELECT * FROM ${tableName} ORDER BY rowid`)).rows as Array<Record<string, unknown>>
    const ignored = volatileColumns[name] ?? new Set<string>()
    tables.push({
      table: name,
      localRows: localRows.length,
      tursoRows: remoteRows.length,
      contentMatch: localRows.length === remoteRows.length
        && hashRows(localRows, ignored) === hashRows(remoteRows, ignored),
      ignoredMetadataColumns: [...ignored],
    })
  }
  const result = {
    localTableCount: sourceTables.length,
    tursoTableCount: targetNames.size,
    contentMatch: sourceTables.length === targetNames.size && tables.every((table) => table.contentMatch),
    tables,
  }
  console.log(JSON.stringify(result, null, 2))
  if (!result.contentMatch) process.exitCode = 1
} finally {
  source.close()
  await target.close()
}
