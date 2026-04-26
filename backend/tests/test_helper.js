const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
    user: '69e0fbc001e17d6e8c3a5345'
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
    user: '69e0fbc001e17d6e8c3a5345'
  },
  {
    content: 'the tragedy of darth plagueis the wise',
    important: true,
    user: '69e0fbc001e17d6e8c3a5345'
  }
]

const initialUsers = [
  {
    username: 'root',
    name: 'admin',
    passwordHash: '$2b$10324325jfdsljfw0Ziov0.M9nA3eTMz0tOFqjXGZLY50I6D2VMBEq'
  },
  {
    _id: '69e0fbc001e17d6e8c3a5345',
    username: 'jon-snow',
    name: 'jon snow',
    passwordHash: '$2b$10$P/5cvRe.XBTqzlx0Ziov0.M9nA3eTMz0tOFqjXGZLY50I6D2VMBEq'
  }
]

const initialToken = async () => {
  const userForToken = {
    username: 'jon-snow',
    id: '69e0fbc001e17d6e8c3a5345'
  }

  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

  // console.log(token)
  return token
}

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

module.exports = { initialNotes, initialUsers, initialToken, nonExistingId, notesInDb, usersInDb }