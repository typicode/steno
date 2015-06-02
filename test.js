var fs = require('fs')
var path = require('path')
var test = require('tape')
var steno = require('./')

function reset() {
  if (fs.existsSync('tmp.txt')) fs.unlinkSync('tmp.txt')
}

var max = 10 * 1000 * 1000
var writer = steno('tmp.txt')

test('should prevent race condition', function(t) {
  reset()
  t.plan(1)

  setTimeout(function() {
    t.equal(+fs.readFileSync('tmp.txt'), max)
  }, 1000)

  for (var i= 0; i <= max; i++) {
    writer.write(i)
  }
})

test('should reuse existing writers', function(t) {
  reset()
  t.plan(1)

  t.equal(writer, steno(path.resolve('tmp.txt')))
})
