var fs = require('fs')
var path = require('path')
var after = require('after')
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

  var next = after(max, function () {
    t.notEqual(+fs.readFileSync('tmp.txt'), max)
  })

  for (var i= 0; i < max; ++i) {
    fs.writeFile('tmp.txt', i, function (err) {
      if (err) throw err
      next()
    })
  }
})

test('There should not be a race condition with steno', function(t) {
  reset()
  t.plan(1)

  var next = after(max, function () {
    t.notEqual(+fs.readFileSync('tmp.txt'), max)
  })

  for (var i= 0; i < max; ++i) {
    steno.writeFile('tmp.txt', i, function (err) {
      if (err) throw er
      next()
    })
  }
})

test('There should be a synchronous version', function (t) {
  reset()
  t.plan(1)

  steno.writeFileSync('tmp.txt', 0)
  t.equal(+fs.readFileSync('tmp.txt'), 0)
})

test('Error handling with steno', function(t) {
  reset()
  t.plan(1)

  var file = __dirname + '/dir/doesnt/exist'

  steno.writeFile(file, '', function(err) {
    t.equal(err.code, 'ENOENT')
  })
})
