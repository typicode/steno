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
    promises.push(writer.write(String(i)))
  }

  await Promise.all(promises)
  expect(parseInt(fs.readFileSync('tmp.txt', 'utf-8'))).toBe(max)
})
