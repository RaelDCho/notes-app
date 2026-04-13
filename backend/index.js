require('dotenv').config()

// const http = require('http')
const express = require('express')
const app = express()
// to access data 
app.use(express.json())

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body || {})
  console.log('---')
  next()
}

app.use(requestLogger)

const Note = require('./models/note')

// const generateId = () => {
//   const maxId = notes.length > 0 ? Math.max(...notes.map(note => Number(note.id))) : 0
//   return String(maxId) + 1
// }

// app.get('/', (request, response) => {
//   response.json("<h1>Hello World</h1>")
// })

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id

  Note.findById(id).then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note ({
    content: body.content,
    important: body.important || false
  })

  return note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.put('/api/notes/:id', (request, response) => {
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

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id

  Note.findByIdAndDelete(id).then(note => {
    response.status(204).end()
  }).catch(error => next(error))
})

/* 
  Middleware
*/
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})