import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const fsWriteFile = promisify(fs.writeFile)

// Returns a temporary file
// Example: for /some/file will return /some/.file.tmp
function getTempFilename(file: string): string {
  return path.join(path.dirname(file), '.' + path.basename(file) + '.tmp')
}

type Resolve = () => void
type Reject = (error: Error) => void

export class Writer {
  filename: string
  tempFilename: string
  locked: boolean
  prev: [Resolve, Reject] | null
  next: [Resolve, Reject] | null
  nextPromise: Promise<void> | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextData: any

  constructor(filename: string) {
    this.filename = filename
    this.tempFilename = getTempFilename(filename)
    this.prev = this.next = this.nextPromise = this.nextData = null
    this.locked = false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _add(data: any): Promise<void> {
    // Only keep most recent data
    this.nextData = data

    // Create a singleton promise to resolve all next promises once next data is written
    this.nextPromise =
      this.nextPromise || new Promise((...args) => (this.next = args))

    // Return a promise that will resolve at the same time as next promise
    return new Promise((resolve, reject) =>
      this.nextPromise?.then(resolve).catch(reject),
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _write(data: any): Promise<void> {
    this.locked = true
    try {
      await fsWriteFile(this.filename, data, 'utf-8')
      this.prev?.[0].call(this)
    } catch (err) {
      this.prev?.[1].call(this, err)
      throw err
    } finally {
      this.locked = false

      this.prev = this.next
      this.next = this.nextPromise = null

      if (this.nextData !== null) {
        const nextData = this.nextData
        this.nextData = null
        await this.write(nextData)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async write(data: any): Promise<void> {
    return this.locked ? this._add(data) : this._write(data)
  }
}

