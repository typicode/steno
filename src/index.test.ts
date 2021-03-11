import os from 'os'
import fs from 'fs'
import path from 'path'
import { Writer } from './'

test('Steno', async () => {
  const max = 1000
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'steno-test-'))
  const file = path.join(dir, 'tmp.txt')

  const writer = new Writer(file)
  const promises = []

  // Test race condition
  for (let i = 1; i <= max; ++i) {
    promises.push(writer.write(String(i)))
  }

  // All promises should resolve
  await Promise.all(promises)
  expect(parseInt(fs.readFileSync(file, 'utf-8'))).toBe(max)
})
