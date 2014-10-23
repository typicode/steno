# steno [![](http://img.shields.io/npm/v/steno.svg?style=flat)](https://www.npmjs.org/package/steno) [![](http://img.shields.io/travis/typicode/steno.svg?style=flat)](https://travis-ci.org/typicode/steno)

> Super fast non-blocking file writer for Node.

```javascript
var steno = require('steno')

for (var i = 0; i < 10000; i++) {
  steno('file.txt').write(i)
}
```

This code runs in `2ms` versus `~5500ms` with `fs.writeFileSync`.

## API

__steno(filename)__

Returns writer for filename.

__writer.write(data)__

Writes data to file. If file is already being written, data is buffered until it can be written.

__writer.setCallback(cb)__

Use it to set a callback that will be executed between two writes. Useful for atomic writing, logging, delaying, ...

```javascript
steno('tmp-file.txt').setCallback(function(data, next) {
  console.log(data + ' has been written to ' + this.filename)
  fs.rename('tmp-file.txt', 'file.txt', function(err) {
    if (err) throw err
    next() // next must be called
  })
})
```
