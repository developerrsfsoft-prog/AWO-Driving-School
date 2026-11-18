import { createClient, type Client, type InArgs, type Transaction } from '@libsql/client'
import path from 'node:path'

export type DbExecutor = Client | Transaction

let client: Client | undefined

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
      || `file:${path.resolve(process.env.SQLITE_PATH || path.join(process.cwd(), 'server/data/awo.sqlite'))}`
    client = createClient({
      url,
      authToken: url.startsWith('file:') ? undefined : process.env.TURSO_AUTH_TOKEN || undefined,
    })
  }
  return client
}

export async function closeDb(): Promise<void> {
  client?.close()
  client = undefined
}

export async function dbAll<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
  executor: DbExecutor = getDb(),
): Promise<T[]> {
  const result = await executor.execute({ sql, args })
  return result.rows as unknown as T[]
}

export async function dbGet<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = [],
  executor: DbExecutor = getDb(),
): Promise<T | undefined> {
  return (await dbAll<T>(sql, args, executor))[0]
}

export async function dbRun(
  sql: string,
  args: InArgs = [],
  executor: DbExecutor = getDb(),
) {
  const result = await executor.execute({ sql, args })
  return {
    lastInsertRowid: result.lastInsertRowid == null ? undefined : Number(result.lastInsertRowid),
    changes: Number(result.rowsAffected),
  }
}

export async function dbExec(sql: string, executor: DbExecutor = getDb()): Promise<void> {
  await executor.executeMultiple(sql)
}

export async function dbTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
  const tx = await getDb().transaction('write')
  try {
    const result = await fn(tx)
    await tx.commit()
    return result
  } catch (error) {
    try {
      await tx.rollback()
    } catch (rollbackError) {
      console.error('Database transaction rollback failed:', rollbackError)
    }
    throw error
  }
}
