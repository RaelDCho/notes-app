const Note = require('../models/note')
const User = require('../models/user')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
    userId: '69e0fbc001e17d6e8c3a5345'
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
    userId: '69e0fbc001e17d6e8c3a5345'
  }
]

const initialPerson = [
  {
    _id: '69e0fbc001e17d6e8c3a5345',
    username: 'jon_snow',
    name: 'jon snow',
    password: 'jonsnowthegoat'
  }
]

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = { initialNotes, initialPerson, nonExistingId, notesInDb, usersInDb }