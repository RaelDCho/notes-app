// const http = require('http')
const express = require('express')
const app = express()
// to access data 
app.use(express.json())

app.use(express.static('dist'))

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(note => Number(note.id))) : 0
  return String(maxId) + 1
}

app.get('/', (request, response) => {
  response.json('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = notes.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false
  }

  notes = notes.concat(note)

  response.json(note)
})

// app.put('/api/notes/:id', (request, response) => {
//   const id = request.params.id
//   // const notes = notes.map(note => note.id === id ? !note.important : null)
//   // console.log(id)
//   // response.status(204).end()
//   const { content, important } = request.body
//   notes = notes.map(note => {
//     if (note.id === id) {
//       note.content = content
//       note.important = important

//       console.log(`${note.content} + ${note.important}`)
//       // console.log(`${content} + ${important}`)
//       return response.json(note)
//     }
//   })
// })

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

/* 
  Middleware
*/
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(requestLogger)
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})