const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')
const assert = require('node:assert')

const password = process.argv[2]

const url = MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, 2)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(e => e.content)
  assert.strictEqual(contents.includes('HTML is easy'), true)
})

mongoose.connection.close()