# steno [![](http://img.shields.io/npm/dm/steno.svg?style=flat)](https://www.npmjs.org/package/steno) [![](https://travis-ci.org/typicode/steno.svg?branch=master)](https://travis-ci.org/typicode/steno)

> Fast async file writer with **atomic writing** and **race condition prevention**.

Used in [lowdb](https://github.com/typicode/lowdb).

## Features

- Fast
- Lightweight
- Atomic write
- No race condition

## Install

```shell
npm install steno --save
```

## Usage

```javascript
import { Writer } from 'steno'

const writer = new Writer('file.json')
await writer.write('some data')
```

## The problem it solves

### Without steno

Let's say you have a server and want to save data to disk:

```javascript
var data = { counter: 0 }

server.post('/', (req, res) => {
  // Increment counter
  ++data.counter

  // Save data asynchronously
  fs.writeFile('data.json', JSON.stringify(data), (err) => {
    if (err) throw err
    res.end()
  })
})
```

Now if you have many requests, for example `1000`, there's a risk that you end up with:

```javascript
// In your server
data.counter === 1000

// In data.json
data.counter === 865 // ... or any other value
```

Why? Because, `fs.write` doesn't guarantee that the call order will be kept. Also, if the server is killed while `data.json` is being written, the file can get corrupted.

### With steno

```javascript
server.post('/increment', (req, res) => {
  ++data.counter

  steno.writeFile('data.json', JSON.stringify(data), (err) => {
    if (err) throw err
    res.end()
  })
})
```

With steno you'll always have the same data in your server and file. And in case of a crash, file integrity will be preserved.

if needed, you can also use `steno.writeFileSync()` which offers atomic writing too.

**Important: works only in a single instance of Node.**

## License

MIT - [Typicode](https://github.com/typicode)
