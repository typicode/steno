import { PathLike } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import retry from 'async-retry'

// Returns a temporary file
// Example: for /some/file will return /some/.file.tmp
function getTempFilename(file: PathLike): string {
  const f = file instanceof URL ? fileURLToPath(file) : file.toString()
  return join(dirname(f), `.${basename(f)}.tmp`)
}

type Resolve = () => void
type Reject = (error: Error) => void
type Data = Parameters<typeof writeFile>[1]

export class Writer {
  #filename: PathLike
  #tempFilename: PathLike
  #locked = false
  #prev: [Resolve, Reject] | null = null
  #next: [Resolve, Reject] | null = null
  #nextPromise: Promise<void> | null = null
  #nextData: Data | null = null

  // File is locked, add data for later
  #add(data: Data): Promise<void> {
    // Only keep most recent data
    this.#nextData = data

    // Create a singleton promise to resolve all next promises once next data is written
    this.#nextPromise ||= new Promise((resolve, reject) => {
      this.#next = [resolve, reject]
    })

    // Return a promise that will resolve at the same time as next promise
    return new Promise((resolve, reject) => {
      this.#nextPromise?.then(resolve).catch(reject)
    })
  }

  // File isn't locked, write data
  async #write(data: Data): Promise<void> {
    // Lock file
    this.#locked = true
    try {
      // Atomic write
      await writeFile(this.#tempFilename, data, 'utf-8')
      await retry(
        async () => {
          await rename(this.#tempFilename, this.#filename)
        },
        {
          minTimeout: 100,
        },
      )

      // Call resolve
      this.#prev?.[0]()
    } catch (err) {
      // Call reject
      if (err instanceof Error) {
        this.#prev?.[1](err)
      }
      throw err
    } finally {
      // Unlock file
      this.#locked = false

      this.#prev = this.#next
      this.#next = this.#nextPromise = null

      if (this.#nextData !== null) {
        const nextData = this.#nextData
        this.#nextData = null
        await this.write(nextData)
      }
    }
  }

  constructor(filename: PathLike) {
    this.#filename = filename
    this.#tempFilename = getTempFilename(filename)
  }

  async write(data: Data): Promise<void> {
    return this.#locked ? this.#add(data) : this.#write(data)
  }
}
