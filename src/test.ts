import { strictEqual as equal } from 'node:assert'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as url from 'node:url'

import { Writer } from './index.js'

export async function testStenoStrings(): Promise<void> {
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
}

export async function testStenoUintArrays(): Promise<void> {
    const max = 1000
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'steno-test-2'))

    const file = path.join(dir, 'file.txt')
    const fileURL = url.pathToFileURL(path.join(dir, 'fileURL.txt'))
    for (const f of [file, fileURL]) {
        const textEncoder = new TextEncoder()
        const textDecoder = new TextDecoder()
        const writer = new Writer(f)
        const promises = []

        // Test race condition
        for (let i = 1; i <= max; ++i) {
            promises.push(writer.write(textEncoder.encode(String(i))))
        }

        // All promises should resolve
        await Promise.all(promises)
        equal(parseInt(textDecoder.decode(fs.readFileSync(file))), max)
    }
}

export async function testStenoBuffers(): Promise<void> {
    const max = 1000
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'steno-test-2'))

    const file = path.join(dir, 'file.txt')
    const fileURL = url.pathToFileURL(path.join(dir, 'fileURL.txt'))
    for (const f of [file, fileURL]) {
        const writer = new Writer(f)
        const promises = []

        // Test race condition
        for (let i = 1; i <= max; ++i) {
            promises.push(writer.write(Buffer.from(String(i), 'utf-8')))
        }

        // All promises should resolve
        await Promise.all(promises)
        equal(parseInt(fs.readFileSync(file, 'utf-8')), max)
    }
}
