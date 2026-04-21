const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

/*
  Function for user authentication
  Bearer scheme
  - isolates the token from the authorization header
*/
const getTokenFrom = request => {
  const authorisation = request.get('authorisation')
  if (authorisation && authorisation.startsWith('Bearer ')) {
    return authorisation.replace('Bearer ', '')
  }
  return null
}

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

notesRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  /*
    Creating new notes should only be possible to logged-in users
    Verifying that user with token exists (getTokenFrom function returns null if no matching user)
    - validity of token checked by jwt
  */
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(400).json({ error: 'UserId missing or invalid' })
  }

  const note = new Note ({
    content: body.content,
    important: body.important || false,
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  // console.log(`logging: ${user}`)

  response.status(201).json(savedNote)
})

notesRouter.put('/:id', (request, response, next) => {
  const id = request.params.id

  const { content, important } = request.body

  Note.findById(id).then(note => {
    if (!note) {
      return response.status(404).end()
    }

    note.content = content
    note.important = important

    return note.save().then(updatedNote => {
      response.json(updatedNote)
    }).catch(error => next(error))
  })
})

notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = notesRouter