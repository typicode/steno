import os from 'os'
import path from 'path'
import { mkdtemp, writeFile } from 'fs/promises'
import { Writer } from './index'

async function run(): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'steno-'))
  console.log(`temp dir: ${dir}`)

  const fsFile = path.join(dir, 'fs.txt')
  const stenoFile = path.join(dir, 'steno.txt')

  console.time('fs')
  for (let i = 0; i < 1000; i++) {
    await writeFile(fsFile, String(i))
  }
  console.timeEnd('fs')

  console.time('steno')
  const steno = new Writer(stenoFile)
  for (let i = 0; i < 1000; i++) {
    // eslint-disable-next-line
    steno.write(String(i))
  }
  console.timeEnd('steno')
}

void run()
