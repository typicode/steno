# steno ![](http://img.shields.io/npm/v/steno.svg?style=flat) ![](http://img.shields.io/travis/typicode/steno.svg?style=flat)

> Super fast non-blocking file writer for Node.

```javascript
var steno = require('steno')

for (var i = 0; i < 10000; i++) {
  steno('file.txt').write(i)
}
```

## API

__steno(filename)__

Returns writer for filename.

__writer.write(data)__

Writes data to filename or buffers it if filename is being written.

__writer.callback__

Use it to set a callback that will be executed between two writes. Useful for atomic writing, logging, delaying, ...

```javascript
steno('tmp-file.txt').callback = function(data, next) {
  console.log(data + ' has been written to ' + this.filename)
  fs.rename('tmp-file.txt', 'file.txt', function(err) {
    if (err) throw err
    next()
  })
}
```
