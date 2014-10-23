var fs = require('fs')
var util = require('util')
var events = require('events')

var writers = {}

function Writer(filename) {
  events.EventEmitter.call(this)
  this.filename = filename
}

util.inherits(Writer, events.EventEmitter)

Writer.prototype.setCallback = function(callback) {
  this.callback = callback
}

Writer.prototype.write = function(data) {

  if (this.lock) {

    this.next = data

  } else if (data !== this.last) {

    this.lock = true
    this.last = data

    var self = this
    fs.writeFile(this.filename, data, function(err) {

      if (err) throw err

      function next() {
        self.lock = false
        if (self.next) {
          var data = self.next
          self.next = null
          self.write(data)
        }
      }

      self.callback ? self.callback(data, next) : next()
    })

  }
}

module.exports = function(filename) {
  return writers[filename] = writers[filename] || new Writer(filename)
}