const assert = require('assert')
const { test, after, describe, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there are initial notes left', () => {
  // initialise the database
  beforeEach(async () => {
    // delete all users and notes
    await Note.deleteMany({})
    await User.deleteMany({})
    // console.log('cleared database')

    // const noteObjects = helper.initialNotes.map(note => new Note(note))
    // const promiseArray = noteObjects.map(note => note.save())
    // await Promise.all(promiseArray)

    // if promises need to be executed in particular order, the above will be problematic, thus use a for...of loop:
    for (let note of helper.initialNotes) {
      let noteObject = new Note(note)
      await noteObject.save()
      // console.log(note)
    }

    // mongoose has a specific built-in method for storing multiple:
    // await Note.insertMany(helper.initialNotes)

    // initialise user
    for (let user of helper.initialUsers) {
      let userObject = new User(user)
      await userObject.save()
    }
    // console.log(userObject)

    // console.log('stored notes in database')
  })

  test('notes are returned as json', async () => {
    await api.get('/api/notes').expect(200).expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert.strictEqual(contents.includes('HTML is easy'), true)
  })

  test('a valid note can be added', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
      userId: '69e0fbc001e17d6e8c3a5345'
    }

    const token = await helper.initialToken()

    await api.post('/api/notes').set('authorisation', `Bearer ${token}`)
      .send(newNote).expect(201).expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

    // const response = await api.get('/api/notes')
    // assert.strictEqual(response.body.length, helper.initialNotes.length)

    const users = await helper.usersInDb()
    // console.log(users)

    const contents = notesAtEnd.map(n => n.content)
    assert(contents.includes(newNote.content))
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }

    const token = await helper.initialToken()

    await api.post('/api/notes').set('authorisation', `Bearer ${token}`)
      .send(newNote).expect(400)

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
    const noteToDelete = notesAtStart[2]

    const token = await helper.initialToken()

    await api.delete(`/api/notes/${noteToDelete.id}`).set('authorisation', `Bearer ${token}`).expect(204)

    // await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)
    
    const notesAtEnd = await helper.notesInDb()

    const ids = notesAtEnd.map(n => n.id)
    assert(!ids.includes(noteToDelete.id))

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})