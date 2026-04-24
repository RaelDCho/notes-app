const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

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
    Creating new notes should only be possible to logged-in user
  */
  const user = request.user

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
  const user = request.user

  const note = await Note.findById(request.params.id)
  if (note.user.toString() === user.id.toString()) {
    user.notes = user.notes.filter(note => !note.id !== request.params.id)
    await Note.findByIdAndDelete(request.params.id)
  }
  response.status(204).end()
})

module.exports = notesRouter