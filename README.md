# steno [![](http://img.shields.io/npm/dm/steno.svg?style=flat)](https://www.npmjs.org/package/steno) [![](https://travis-ci.org/typicode/steno.svg?branch=master)](https://travis-ci.org/typicode/steno)

> Specialized fast async file writer

If you often write to the same file, steno can make things a lot faster and more reliable. Used in [lowdb](https://github.com/typicode/lowdb).

_https://en.wikipedia.org/wiki/Stenotype_

## Features

- Fast
- Lightweight
- Promise-based
- Atomic write
- No race condition
- TypeScript definitions

## Install

```shell
npm install steno
```

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

```javascript
console.time('fs')
for (let i = 0; i < 1000; i++) {
  await fs.writeFile('fs.txt', String(i))
}
console.timeEnd('fs')

console.time('steno')
const steno = new Writer('steno.txt')
for (let i = 0; i < 1000; i++) {
  steno.write(String(i))
}
console.timeEnd('steno')
```

```
fs: 69.155ms
steno: 0.706ms
```

Both files will contain the same data in the end.

## License

MIT - [Typicode](https://github.com/typicode)
