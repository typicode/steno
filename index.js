var fs = require('graceful-fs')
var path = require('path')

var writers = {}

// Returns a temporary file
// Example: for /some/file will return /some/.~file
function getTempFile(file) {
  return path.join(path.dirname(file), '.~' + path.basename(file))
}

function Writer(file) {
  this.file = file
  this.callbacks = []
}

Writer.prototype.write = function(data, cb) {

  // Save callback for later
  this.callbacks.push(cb)

  if (this.lock) {
    // File is locked
    // Save data for later
    this.next = data
  } else {
    // File is not locked
    // Lock it
    this.lock = true

    // Write data to a temporary file
    var tmpFile = getTempFile(this.file)
    fs.writeFile(tmpFile, data, function(err) {
      var c
      if (err) {
        // On error, call all the callbacks and return
        while (c = this.callbacks.shift()) c(err)
        return
      }

      // On success rename the temporary file to the real file
      fs.rename(tmpFile, this.file, function(err) {

        // Call all the callbacks
        while (c = this.callbacks.shift()) c(err)

        // Unlock file
        this.lock = false

        // Write next data if any
        if (this.next) {
          var data = this.next
          this.next = null
          this.write(data)
        }

      }.bind(this))

    }.bind(this))

  }
}

module.exports.writeFile = function(file, data, cb) {
  // Convert to absolute path
  file = path.resolve(file)

  // Create or get writer
  writers[file] = writers[file] || new Writer(file)

  // Write
  writers[file].write(data, cb)
}

module.exports.writeFileSync = function(file, data) {
  fs.writeFileSync(getTempFile(file), data)
  fs.renameSync(getTempFile(file), file)
}
