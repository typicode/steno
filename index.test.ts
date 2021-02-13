const fs = require('fs')
const { Writer } = require('./')

function reset() {
  if (fs.existsSync('.~tmp.txt')) fs.unlinkSync('.~tmp.txt')
  if (fs.existsSync('tmp.txt')) fs.unlinkSync('tmp.txt')
}

test('No race condition', async () => {
  const max = 1000
  const writer = new Writer('tmp.txt')

  reset()

  const promises = []

  for (let i = 1; i <= max; ++i) {
    promises.push(writer.write(i))
  }

  await Promise.all(promises)
  expect(parseInt(fs.readFileSync('tmp.txt', 'utf-8'))).toBe(max)
})
// test('There should be a synchronous version', function(t) {
//   reset()
//   t.plan(1)

//   steno.writeFileSync('tmp.txt', 0)
//   t.equal(+fs.readFileSync('tmp.txt'), 0)
// })

// test('Error handling with steno', function(t) {
//   reset()
//   t.plan(1)

//   var file = path.join(__dirname, 'dir/doesnt/exist')

//   steno.writeFile(file, '').catch(err => {
//     t.equal(err.code, 'ENOENT')
//   })
// })
