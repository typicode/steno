# steno [![](https://badge.fury.io/js/steno.svg)](http://badge.fury.io/js/steno) [![](https://travis-ci.org/typicode/steno.svg?branch=master)](https://travis-ci.org/typicode/steno)

> Fast and safe file writer that prevents race condition

```javascript
var steno = require('steno')
steno('file.txt').write('data')
```

## Example

If you need to write to file, you either use `writeFileSync` or `writeFile`. The first is blocking and the second doesn't prevent race condition.

For example:

```javascript
// Very slow but file's content will always be 10000
for (var i = 0; i <= 10000; i++) {
  fs.writeFileSync('file.txt', i)
}
```

```javascript
// Very fast but file's content may be 5896, 2563, 9856, ...
for (var i = 0; i <= 10000; i++) {
  fs.writeFile('file.txt', i, function() {})
}
```

With steno:

```javascript
// Very fast and file's content will always be 10000
for (var i = 0; i <= 10000; i++) {
  steno('file.txt').write(i)
}
```

Race condition is prevented and it runs in `2ms` versus `~5500ms` with `fs.writeFileSync`.

## How it works

```javascript
steno('file.txt').write('A') // starts writing A to file
steno('file.txt').write('B') // still writing A, B is buffered
steno('file.txt').write('C') // still writing A, B is replaced by C
                             // ...
                             // A has been written to file
                             // starts writting C (B has been skipped)
```

When file is being written, data is stored in memory and flushed to disk as soon as possible. Please note also that steno skips intermediate data (B in this example) and assumes to be run in a single process.

## Methods

__steno(filename)__

Returns writer for filename.

__writer.write(data, [cb])__

Writes data to file. If file is already being written, data is buffered until it can be written.

```javascript
steno('file.txt').write('data')
```

An optional callback can be set to be notified when data has been flushed.

```javascript
function w(data) {
  steno('file.txt').write(data, function(err) {
    if (err) throw err
    console.log('OK')
  })
}

w('A')
w('B')
w('C')

// OK
// OK
// OK
```

__writer.setCallback(cb)__

Sets a writer level callback that is called __only__ after file has been written. Useful for creating atomic writers, logging, delaying, ...

```javascript
var atomicWriter = steno('tmp.txt').setCallback(function(err, data, next) {
  if (err) throw err
  fs.rename('tmp.txt', 'file.txt', function(err) {
    if (err) throw err
    console.log('OK')
    next()
  })
})

atomicWriter.write('A')
atomicWriter.write('B')
atomicWriter.write('C')

// OK
// OK

// File has been actually written twice
```

## License

MIT - [Typicode](https://github.com/typicode)
