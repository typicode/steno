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

test('steno default callback', function(t) {
  reset()
  t.plan(2)

  writer.callback(null, '', function() {
    t.pass('next was called')
  })

  t.throws(function() {
    writer.callback(new Error())
  })
})

test('steno with callback', function(t) {
  reset()
  t.plan(1)

  writer.setCallback(function(err, data, next) {
    if (data === max) {
      t.equal(+fs.readFileSync('tmp.txt'), max)
    }
    next()
  })

  for (var i= 0; i <= max; i++) {
    writer.write(i)
  }
})

test('steno error with callback', function(t) {
  reset()
  t.plan(1)

  var writer = steno(__dirname + '/dir/doesnt/exist')

  writer.setCallback(function(err) {
    t.equal(err.code, 'ENOENT')
  })

  writer.write('')
})
