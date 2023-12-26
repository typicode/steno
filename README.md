# Steno [![](http://img.shields.io/npm/dm/steno.svg?style=flat)](https://www.npmjs.org/package/steno) [![Node.js CI](https://github.com/typicode/steno/actions/workflows/node.js.yml/badge.svg)](https://github.com/typicode/steno/actions/workflows/node.js.yml)

> Super fast async file writer with atomic write

**Steno** makes writing concurrently fast and safe.

Battle-tested in [lowdb](https://github.com/typicode/lowdb).

## Features

- ⚡ Fast (see benchmark)
- 🐦 Lightweight (~6kb)
- 🩵 Written in TypeScript
- 🖊️ Writes are atomic (no partial writes)
- 🏎️ Writes are ordered even if they're async (no race conditions)
- ♻️ Automatic retry

## Usage

```javascript
import { Writer } from 'steno'

// Create a singleton writer
const file = new Writer('file.txt')

// Use it in the rest of your code
async function save() {
  await file.write('some data')
}
```

## Benchmark

`npm run benchmark` (see `src/benchmark.ts`)

```
Write 1KB data to the same file x 1000
  fs     :   62ms
  steno  :    1ms

Write 1MB data to the same file x 1000
  fs     : 2300ms
  steno  :    5ms
```

_Steno uses a smart queue and avoids unnecessary writes._

## Name

https://en.wikipedia.org/wiki/Stenotype

## License

MIT - [Typicode](https://github.com/typicode)
