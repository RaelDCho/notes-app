import { useState, useEffect } from "react"

import '../assets/Notes.css'

import Note from './Note'
import Notification from './Notification'

import noteService from '../services/notes'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(true)

  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      console.log('promise fulfilled')
      setNotes(initialNotes)
    })
  }, [notes.length])

  const addNote = event => {
    event.preventDefault()
    console.log('button clicked', event.target)

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5
    }

    noteService.create(noteObject).then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNewNote('')
      setNotification(true)
    }).catch(error => {
      setErrorMessage(error.response.data.error)
      setNotification(false)
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    })
  }

  const handleNoteChange = event => setNewNote(event.target.value)

  const toggleImportanceOf = (id) => {
    const note = notes.find(note => note.id === id)
    const changedNote = {
      ...note,
      important: !note.important
    }

    noteService.update(id, changedNote).then(returnedNote => {
      setNotes(notes.map(note => note.id === id ? returnedNote : note))
      setNotification(true)
    }).catch(error => {
      setErrorMessage(`\'${note.content}\' has already been deleted`)
      setNotification(false)
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      setNotes(notes.filter(note => note.id !== id))
    })
  }

  const notesToShow = showAll ? notes : notes.filter(note => note.important === true)

  return (
    <div className='notes'>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)} />)}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} placeholder='enter a new note' onChange={handleNoteChange} />
        <button type='submit'>save</button>
      </form>
      <Notification message={errorMessage} notification={notification}/>
    </div>
  )
}

export default Notes