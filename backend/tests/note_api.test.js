const assert = require('node:assert')
const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
// const { info } = require('../utils/logger')
const app = require('../app')
const Note = require('../models/note')
const helper = require('./test_helper')
const { default: notes } = require('../../frontend/src/services/notes')

// user
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

describe('when there are initial notes left', () => {
  // initialise the database
  beforeEach(async () => {
    await Note.deleteMany({})
    // console.log('cleared database')

    // const noteObjects = helper.initialNotes.map(note => new Note(note))
    // const promiseArray = noteObjects.map(note => note.save())
    // await Promise.all(promiseArray)

    // if promises need to be executed in particular order, the above will be problematic, thus use a for...of loop:
    for (let note of helper.initialNotes) {
      let noteObject = new Note(note)
      await noteObject.save()
      // console.log('saving')
    }

    // mongoose has a specific built-in method for storing multiple:
    // await Note.insertMany(helper.initialNotes)

    // console.log('stored notes in database')
  })

  test('notes are returned as json', async () => {
    await api.get('/api/notes').expect(200).expect('Content-Type', /application\/json/)
  })

  test.only('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test.only('a specific note is within the returned notes', async () => {
    // const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert.strictEqual(contents.includes('HTML is easy'), true)
  })

  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true
    }

    await api.post('/api/notes').send(newNote).expect(201).expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

    // const response = await api.get('/api/notes')
    // assert.strictEqual(response.body.length, helper.initialNotes.length)

    const contents = notesAtEnd.map(n => n.content)
    assert(contents.includes(newNote.content))
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }

    await api.post('/api/notes').send(newNote).expect(400)

    const notesAtEnd = await helper.notesInDb()

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
  })

  // fetching a single note
  test('fetching a specific note', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const resultNote = await api.get(`/api/notes/${noteToView.id}`).expect(200).expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, noteToView)
  })

  // deleting a note
  test('deleting a note', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

    const notesAtEnd = await helper.notesInDb()

    const ids = notesAtEnd.map(n => n.id)
    assert(!ids.includes(noteToDelete.id))

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'dvd123',
      name: 'dvd dvd',
      password: 'salainen',
    }

    await api.post('/api/users').send(newUser).expect(201).expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtStart.length + 1, usersAtEnd.length)

    const usernames = usersAtEnd.map(user => user.username)
    console.log(usernames)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper status code and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      console.log(usersAtStart)
  
      const newUser = {
        username: 'root',
        name: 'dvd',
        password: 'hello123'
      }
  
      console.log(newUser)
  
      const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
  
      assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })
})


after(async () => {
  await mongoose.connection.close()
})