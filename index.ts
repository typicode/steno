import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const fsWriteFile = promisify(fs.writeFile)
const fsRename = promisify(fs.rename)

// Returns a temporary file
// Example: for /some/file will return /some/.file.tmp
function getTempFilename(file: string): string {
  return path.join(path.dirname(file), '.' + path.basename(file) + '.tmp')
}

type Resolve = () => void
type Reject = (error: Error) => void

export class Writer {
  private filename: string
  private tempFilename: string
  private locked: boolean
  private prev: [Resolve, Reject] | null
  private next: [Resolve, Reject] | null
  private nextPromise: Promise<void> | null
  private nextData: string | null

  private _add(data: string): Promise<void> {
    // Only keep most recent data
    this.nextData = data

    // Create a singleton promise to resolve all next promises once next data is written
    this.nextPromise ||= new Promise((...args) => (this.next = args))

    // Return a promise that will resolve at the same time as next promise
    return new Promise((resolve, reject) =>
      this.nextPromise?.then(resolve).catch(reject)
    )
  }

  private async _write(data: string): Promise<void> {
    this.locked = true
    try {
      await fsWriteFile(this.tempFilename, data, 'utf-8')
      await fsRename(this.tempFilename, this.filename)
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

  constructor(filename: string) {
    this.filename = filename
    this.tempFilename = getTempFilename(filename)
    this.prev = this.next = this.nextPromise = this.nextData = null
    this.locked = false
  }

  async write(data: string): Promise<void> {
    return this.locked ? this._add(data) : this._write(data)
  }
}
