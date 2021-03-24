import os from 'os'
import path from 'path'
import { mkdtemp, writeFile } from 'fs/promises'
import { Writer } from './index'
import { readFileSync } from 'fs'

async function benchmark(data: string, msg: string): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'steno-'))
  const fsLabel = '  fs     '
  const stenoLabel = '  steno  '
  const fsFile = path.join(dir, 'fs.txt')
  const stenoFile = path.join(dir, 'steno.txt')
  const steno = new Writer(stenoFile)

  // console.log(`temp dir: ${dir}`)
  console.log(msg)
  console.log()

  console.time(fsLabel)
  // To avoid race condition issues, we need to wait
  // between write when using fs only
  for (let i = 0; i < 1000; i++) {
    await writeFile(fsFile, `${data}${i}`)
  }
  console.timeEnd(fsLabel)

  console.time(stenoLabel)
  // Steno can be run in parallel
  await Promise.all(
    [...Array(1000).keys()].map((_, i) => steno.write(`${data}${i}`)),
  )
  console.timeEnd(stenoLabel)

  // Testing that the end result is the same
  console.log()
  console.log(
    '  fs.txt = steno.txt',
    readFileSync(fsFile, 'utf-8') === readFileSync(stenoFile, 'utf-8')
      ? '✓'
      : '✗',
  )
  console.log()
  console.log()
}

async function run(): Promise<void> {
  const KB = 1024
  const MB = 1048576
  await benchmark(
    Buffer.alloc(KB, 'x').toString(),
    'Write 1KB data to the same file x 1000',
  )
  await benchmark(
    Buffer.alloc(MB, 'x').toString(),
    'Write 1MB data to the same file x 1000',
  )
}

void run()
