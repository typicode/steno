import { strictEqual as equal } from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test';
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