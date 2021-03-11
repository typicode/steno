# steno [![](http://img.shields.io/npm/dm/steno.svg?style=flat)](https://www.npmjs.org/package/steno) [![](https://travis-ci.org/typicode/steno.svg?branch=master)](https://travis-ci.org/typicode/steno)

> Specialized fast async file writer

If you often write to the same file, steno can make things a lot faster and more reliable.

Used in [lowdb](https://github.com/typicode/lowdb).

_https://en.wikipedia.org/wiki/Stenotype_

## Features

- Fast
- Lightweight
- Promise-based
- Atomic write
- No race condition
- TypeScript definitions

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

`npm run benchmark`

```
Write 1KB data to the same file x 1000
  fs   : 68.464ms
  steno: 0.578ms

Write 1MB data to the same file x 1000
  fs   : 2.166s
  steno: 1.153ms
```

## License

MIT - [Typicode](https://github.com/typicode)
