var fs = require('fs')
var test = require('tape')
var steno = require('./')

function reset() {
  if (fs.existsSync('tmp.txt')) fs.unlinkSync('tmp.txt')
}

var max = 10 * 1000 * 1000
var writer = steno('tmp.txt')

test('steno without callback', function(t) {
  reset()
  t.plan(1)

  setTimeout(function() {
    t.equal(+fs.readFileSync('tmp.txt'), max)
  }, 1000)

  for (var i= 0; i <= max; i++) {
    writer.write(i)
  }
})

test('steno with callback', function(t) {
  reset()
  t.plan(1)

  writer.setCallback(function(data, next) {
    if (data === max) {
      t.equal(+fs.readFileSync('tmp.txt'), max)
    }
    next()
  })

  for (var i= 0; i <= max; i++) {
    writer.write(i)
  }
})
