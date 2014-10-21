// var fs = require('fs')
// var util = require('util')
// var events = require('events')

// var writers = {}

// function Writer(filename) {
//   events.EventEmitter.call(this)
//   this.filename = filename
// }

// util.inherits(Writer, events.EventEmitter)

// Writer.prototype.write = function(data) {

//   if (this.writing) {

//     this.next = data

//   } else if (data !== this.last) {

//     this.writing = true
//     this.last = data

//     var self = this
//     fs.writeFile(this.filename, data, function(err) {

//       if (err) throw err

//       self.writing = false
//       self.emit('flush', data)

//       if (self.next) self.write.apply(self, [self.next])

//     })

//   }
// }

// module.exports = function(filename) {
//   return writers[filename] = writers[filename] || new Writer(filename)
// }


var fs = require('fs')
var util = require('util')
var events = require('events')

var writers = {}

function Writer(filename) {
  events.EventEmitter.call(this)
  this.filename = filename
}

util.inherits(Writer, events.EventEmitter)

Writer.prototype.callback = function(data, next) { next() }

Writer.prototype.write = function(data) {

  if (this.writing) {

    this.next = data

  } else if (data !== this.last) {

    this.writing = true
    this.last = data

    var self = this
    fs.writeFile(this.filename, data, function(err) {

      if (err) throw err

      self.writing = false
      self.callback(data, function() {
        if (self.next) self.write(self.next)
      })
    })

  }
}

module.exports = function(filename) {
  return writers[filename] = writers[filename] || new Writer(filename)
}