import { deepStrictEqual, strictEqual as equal } from 'node:assert'
import fs from 'node:fs'
import { syncBuiltinESMExports } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import url from 'node:url'

import { Writer } from './index.js'

await test('steno', async () => {
  const max = 1000

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'steno-test-'))

  const file = path.join(dir, 'file.txt')
  const fileURL = url.pathToFileURL(path.join(dir, 'fileURL.txt'))

  for (const f of [file, fileURL]) {
    const writer = new Writer(f)
    const promises = []

    // Test race condition
    for (let i = 1; i <= max; ++i) {
      promises.push(writer.write(String(i)))
    }

    // All promises should resolve
    await Promise.all(promises)
    equal(parseInt(fs.readFileSync(file, 'utf-8')), max)
  }
})

for (const failure of ['first', 'second']) {
  await test(`a failed ${failure} write keeps the other write's result`, async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'steno-error-test-'))
    const file = path.join(dir, 'file.txt')
    const writeFile = fs.promises.writeFile
    const error = new Error(`${failure} write failed`)

    fs.promises.writeFile = async (...args) => {
      if (args[1] === failure) throw error
      return writeFile(...args)
    }
    syncBuiltinESMExports()

    try {
      const writer = new Writer(file)
      const results = await Promise.allSettled([
        writer.write('first'),
        writer.write('second'),
      ])
      const statuses =
        failure === 'first'
          ? ['rejected', 'fulfilled']
          : ['fulfilled', 'rejected']
      deepStrictEqual(
        results.map((result) => result.status),
        statuses,
      )
      const failed = results.find((result) => result.status === 'rejected')
      if (failed?.status === 'rejected') equal(failed.reason, error)
      equal(
        fs.readFileSync(file, 'utf-8'),
        failure === 'first' ? 'second' : 'first',
      )

      await writer.write('recovered')
      equal(fs.readFileSync(file, 'utf-8'), 'recovered')
    } finally {
      fs.promises.writeFile = writeFile
      syncBuiltinESMExports()
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
}
