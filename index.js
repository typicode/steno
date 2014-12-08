var fs = require('fs')
var path = require('path')

var writers = {}

function Writer(filename) {
  this.filename = filename
  this._callbacks = []
}

Writer.prototype._callback = function(err, data, next) {
  if (err) throw err
  next()
}

Writer.prototype.setCallback = function(cb) {
  this._callback = cb
  return this
}

Writer.prototype.write = function(data, cb) {

  if (this.lock) {

    this.next = data
    if (cb) this._callbacks.push(cb)

  } else {

    this.lock = true

    var self = this
    fs.writeFile(this.filename, data, function(err) {

      function next() {
        self.lock = false
        if (self.next) {
          var data = self.next
          self.next = null
          self.write(data)
        }
      }

      self._callback(err, data, next)

      var c
      while (c = self._callbacks.shift()) {
        c(err)
      }
      if (cb) cb(err)
    })

  }

  return this
}

module.exports = function(filename) {
  filename = path.resolve(filename)
  return writers[filename] = writers[filename] || new Writer(filename)
}
