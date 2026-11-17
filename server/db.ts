import { createClient, type Client, type InArgs } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'

export type DbClient = Client

let client: Client

export function getDb() {
  if (client) return client
  const url = process.env.TURSO_DATABASE_URL || (process.env.SQLITE_PATH ? `file:${path.resolve(process.env.SQLITE_PATH)}` : `file:${path.resolve(process.cwd(), 'server/data/awo.sqlite')}`)
  const authToken = process.env.TURSO_AUTH_TOKEN
  client = createClient({ url, authToken })
  return client
}

export async function dbAll<T = any>(sql: string, args: InArgs = []): Promise<T[]> {
  const r = await getDb().execute({ sql, args: args as any })
  return r.rows as unknown as T[]
}

export async function dbGet<T = any>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const rows = await dbAll<T>(sql, args)
  return rows[0]
}

export async function dbRun(sql: string, args: InArgs = []) {
  const r = await getDb().execute({ sql, args: args as any })
  return { lastInsertRowid: r.lastInsertRowid, changes: Number(r.rowsAffected ?? 0) }
}

export async function dbExec(sql: string) {
  await getDb().executeMultiple(sql)
}

export async function dbTransaction<T>(fn: () => Promise<T>): Promise<T> {
  const db = getDb()
  // @libsql/client transaction
  const tx = await db.transaction('write')
  const orig = client
  // simple: run sequentially in tx by temporarily swapping? easier use tx directly - but callers use helpers.
  // Provide tx-bound helpers via global swap is risky; instead expose tx helpers.
  try {
    ;(globalThis as any).__tx = tx
    const result = await fn()
    await tx.commit()
    return result
  } catch (e) {
    try { await tx.rollback() } catch {}
    throw e
  } finally {
    ;(globalThis as any).__tx = undefined
  }
}

function active() : any {
  return (globalThis as any).__tx || getDb()
}

export async function txAll<T = any>(sql: string, args: InArgs = []): Promise<T[]> {
  const r = await active().execute({ sql, args: args as any })
  return r.rows as unknown as T[]
}
export async function txGet<T = any>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const rows = await txAll<T>(sql, args)
  return rows[0]
}
export async function txRun(sql: string, args: InArgs = []) {
  const r = await active().execute({ sql, args: args as any })
  return { lastInsertRowid: r.lastInsertRowid, changes: Number(r.rowsAffected ?? 0) }
}
