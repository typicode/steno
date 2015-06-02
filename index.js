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
}

Writer.prototype.write = function(data, cb) {

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

      if (err) throw err

      // On success rename the temporary file to the real file
      fs.rename(tmpFile, this.file, function(err) {
        if (err) throw err

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

  return this
}

module.exports = function(file) {
  file = path.resolve(file)
  return writers[file] = writers[file] || new Writer(file)
}
