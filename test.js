var fs = require('fs')
var path = require('path')
var test = require('tape')
var steno = require('./')

function reset() {
  if (fs.existsSync('tmp.txt')) fs.unlinkSync('tmp.txt')
}

var max = 10 * 1000 * 1000
var writer = steno('tmp.txt')

test('writer without callback', function(t) {
  reset()
  t.plan(1)

  setTimeout(function() {
    t.equal(+fs.readFileSync('tmp.txt'), max)
  }, 1000)

  for (var i= 0; i <= max; i++) {
    writer.write(i)
  }
})

test('writer default callback', function(t) {
  reset()
  t.plan(2)

  // default callback should call function next
  // when err is null
  var err = null
  var next = function() {
    t.pass('next was called')
  }
  writer._callback(err, '', next)

  // default callback should throw an error
  t.throws(function() {
    writer._callback(new Error())
  })
})

test('writer with callback', function(t) {
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

test('writer error with callback', function(t) {
  reset()
  t.plan(1)

  var writer = steno(__dirname + '/dir/doesnt/exist')

  writer.setCallback(function(err) {
    t.equal(err.code, 'ENOENT')
  })

  writer.write('')
})

test('write callback', function(t) {
  reset()
  t.plan(3)

  writer.write('A', t.false)
  writer.write('B', t.false)
  writer.write('C', t.false)
})

test('store absolute paths', function(t) {
  reset()
  t.plan(1)

  t.equal(writer, steno(path.resolve('tmp.txt')))
})
