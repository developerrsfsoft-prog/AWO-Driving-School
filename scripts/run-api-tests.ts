import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'awo-api-test-'))
let result: ReturnType<typeof spawnSync>
try {
  result = spawnSync(process.execPath, ['--import', 'tsx', '--test', 'tests/api.test.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, AWO_API_TEST_DIR: testDirectory },
    stdio: 'inherit',
  })
} finally {
  fs.rmSync(testDirectory, { recursive: true, force: true })
}

if (result.error) throw result.error
process.exitCode = result.status ?? 1
