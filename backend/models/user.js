const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v)
      },
      message: props => `${props.value} is not a valid username`
    }
  },
  name: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z ]+$/.test(v)
      },
      message: props => `${props.value} is not a valid name`
    }
  },
  passwordHash: {
    type: String,
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User