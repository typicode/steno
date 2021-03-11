import os from 'os'
import path from 'path'
import { mkdtemp, writeFile } from 'fs/promises'
import { Writer } from './index'

async function benchmark(data: string, msg: string): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'steno-'))
  const fsFile = path.join(dir, 'fs.txt')
  const stenoFile = path.join(dir, 'steno.txt')
  const steno = new Writer(stenoFile)

  // console.log(`temp dir: ${dir}`)
  console.log(msg)
  console.time('  fs   ')
  for (let i = 0; i < 1000; i++) {
    await writeFile(fsFile, data)
  }
  console.timeEnd('  fs   ')

  console.time('  steno')
  for (let i = 0; i < 1000; i++) {
    // eslint-disable-next-line
    steno.write(data)
  }
  console.timeEnd('  steno')
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
