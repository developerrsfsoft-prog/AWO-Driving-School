import 'dotenv/config'
import Database from 'better-sqlite3'
import { createClient, type InValue } from '@libsql/client'
import path from 'node:path'

const databaseUrl = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const sourcePath = path.resolve(process.env.SQLITE_PATH || 'server/data/awo.sqlite')

if (!databaseUrl || databaseUrl.startsWith('file:') || !authToken) {
  throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before importing the local SQLite database.')
}

const source = new Database(sourcePath, { readonly: true, fileMustExist: true })
const target = createClient({ url: databaseUrl, authToken })
const quoteIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`

try {
  const existing = await target.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  )
  if (existing.rows.length) {
    throw new Error(`Turso is not empty (${existing.rows.length} tables found); refusing to overwrite production data.`)
  }

  const objects = source.prepare(
    "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY rowid",
  ).all() as Array<{ type: string; name: string; tbl_name: string; sql: string }>
  const tables = objects.filter((object) => object.type === 'table')
  if (!tables.length) throw new Error('The SQLite source contains no user tables.')

  const transaction = await target.transaction('write')
  try {
    for (const table of tables) {
      await transaction.executeMultiple(table.sql)
    }

    const report: Array<{ table: string; rows: number }> = []
    for (const table of tables) {
      const tableName = quoteIdentifier(table.name)
      const columns = source.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>
      const columnNames = columns.map(({ name }) => name)
      const rows = source.prepare(`SELECT * FROM ${tableName} ORDER BY rowid`).all() as Array<Record<string, InValue>>
      for (const row of rows) {
        await transaction.execute({
          sql: `INSERT INTO ${tableName} (${columnNames.map(quoteIdentifier).join(', ')}) VALUES (${columnNames.map(() => '?').join(', ')})`,
          args: columnNames.map((column) => row[column]),
        })
      }
      report.push({ table: table.name, rows: rows.length })
    }

    for (const object of objects.filter((item) => item.type === 'index' || item.type === 'trigger')) {
      await transaction.executeMultiple(object.sql)
    }

    const sequences = source.prepare('SELECT name, seq FROM sqlite_sequence').all() as Array<{ name: string; seq: number }>
    for (const sequence of sequences) {
      const update = await transaction.execute({
        sql: 'UPDATE sqlite_sequence SET seq = ? WHERE name = ?',
        args: [sequence.seq, sequence.name],
      })
      if (Number(update.rowsAffected) === 0) {
        await transaction.execute({
          sql: 'INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)',
          args: [sequence.name, sequence.seq],
        })
      }
    }

    await transaction.commit()
    console.log(JSON.stringify({ importedTables: report.length, tables: report }, null, 2))
  } catch (error) {
    await transaction.rollback()
    throw error
  }
} finally {
  source.close()
  await target.close()
}
