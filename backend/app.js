const express = require('express')
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')
const { info, error } = require('./utils/logger')
const middleware = require('./utils/middleware')
const notesRouter = require('./controllers/notes')
const userRouter = require('./controllers/users')

const app = express()

info(`connecting to ${MONGODB_URI}`)

mongoose.connect(MONGODB_URI, { family: 4 }).then(() => {
  info('connected to MongoDB')
}).catch(error => {
  error('error connecting to MongoDB', error.message)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)
app.use('/api/users', userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app