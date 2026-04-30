import { useState, useEffect } from "react"

//import css
import '../assets/Notes.css'

// import components
import Note from './Note'
import Notification from './Notification'
import NoteForm from './NoteForm'
import LoginForm from './LoginForm'

// import services
import noteService from '../services/notes'
import loginService from '../services/login'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(true)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  /*
    useEffect function
      - updates page with a getAll from notes database through axios
  */
  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      console.log('promise fulfilled')
      setNotes(initialNotes)
    })
  }, [notes.length])

  // now a user should stay logged in, even if refreshed tab
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  /*
    Handler Functions
  */
  const handleNoteChange = async event => await setNewNote(event.target.value)

  const handleLogin = async event => {
    event.preventDefault()
    console.log('handling login')

    try {
      const user = await loginService.login({ username, password })

      // saving details of logged-in user to local storage so that refreshing does not remove their token
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )

      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('invalid credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }
  }

  const handleLogout = async event => {
    
  }

  /*
    Function to add a new note
  */
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

  /*
    Function to update note to !importance
  */
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
      {
        !user && (
          <LoginForm
            onSubmit={handleLogin}
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
          />
        )
      }
      {
        user && (
          <div>
            <p>Welcome, {user.name}!</p>
          </div>
        )
      }
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)} user={user} />)}
      </ul>
      { user && (<NoteForm addNote={addNote} newNote={newNote} onChange={handleNoteChange} />) }
      <Notification message={errorMessage} notification={notification}/>
    </div>
  )
}

export default Notes