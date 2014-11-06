var fs = require('fs')

var writers = {}

function Writer(filename) {
  this.filename = filename
}

Writer.prototype.setCallback = function(callback) {
  this.callback = callback
}

Writer.prototype.callback = function(err, data, next) {
  if (err) throw err
  next()
}

Writer.prototype.write = function(data) {

  if (this.lock) {

    this.next = data

  } else if (data !== this.last) {

    this.lock = true
    this.last = data

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

      self.callback ? self.callback(err, data, next) : next()
    })

  }
}

module.exports = function(filename) {
  return writers[filename] = writers[filename] || new Writer(filename)
}
