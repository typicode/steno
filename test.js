var fs = require('fs')
var path = require('path')
var test = require('tape')
var steno = require('./')

function reset() {
  if (fs.existsSync('.~tmp.txt')) fs.unlinkSync('.~tmp.txt')
  if (fs.existsSync('tmp.txt')) fs.unlinkSync('tmp.txt')
}

var max = 1000

test('There should be a race condition with fs', function (t) {
  reset()
  t.plan(1)

  setTimeout(function() {
    t.notEqual(+fs.readFileSync('tmp.txt'), max)
  }, 1000)

  for (var i= 0; i <= max; ++i) {
    fs.writeFile('tmp.txt', i, function (err) {
      if (err) throw err
    })
  }
})

test('There should not be a race condition with steno', function(t) {
  reset()
  t.plan(2)

  setTimeout(function() {
    t.equal(+fs.readFileSync('tmp.txt'), max)
    t.equal(counter - 1, max)
  }, 1000)

  var counter = 0

  for (var i= 0; i <= max; ++i) {
    steno.writeFile('tmp.txt', i, function (err) {
      if (err) throw er
      ++counter
    })
  }
})

test('Error handling with steno', function(t) {
  reset()
  t.plan(1)

  var file = __dirname + '/dir/doesnt/exist'

  steno.writeFile(file, '', function(err) {
    t.equal(err.code, 'ENOENT')
  })
})
