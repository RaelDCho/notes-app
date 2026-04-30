const NoteForm = ({ addNote, newNote, onChange }) => {

  return(
    <>
      <form onSubmit={addNote}>
        <input value={newNote} placeholder='enter a new note' onChange={onChange} />
        <button type='submit'>save</button>
      </form>
    </>
  )
}

export default NoteForm