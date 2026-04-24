const User = require('../models/user')
const { info } = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  info('Method:', request.method)
  info('Path:  ', request.path)
  info('Body:  ', request.body || {})
  info('---')
  next()
}

/*
  Function for user authentication
  Bearer scheme
  - isolates the token from the authorisation header
*/
const tokenExtractor = (request, response, next) => {
  const authorisation = request.get('authorisation')
  if (authorisation && authorisation.startsWith('Bearer ')) {
    request.token = authorisation.replace('Bearer ', '')
  }

  next()
}

/*
  Function for extracting user through token provided
  Verifying that user with token exists (getTokenFrom function returns null if no matching user)
    - validity of token checked by jwt
*/
const userExtractor = async (request, respnose, next) => {
  if (request.method === 'POST' || request.method === 'DELETE') {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(400).json({ error: 'UserId missing or invalid' })
    }
    request.user = user
  }

  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

module.exports = {
  requestLogger,
  tokenExtractor,
  userExtractor,
  unknownEndpoint,
  errorHandler
}