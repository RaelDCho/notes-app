
const Note = ({ note, toggleImportance, user }) => {
  const label = note.important ? 'make not important' : 'make important'

  // why is this not working
  const makeImportant = () => {
    <button onClick={toggleImportance}>{label}</button>
  }

  return (
    <li className='note'>
      <span>{note.content}</span>
      {user && <button onClick={toggleImportance}>{label}</button>}
      {/* {user && makeImportant()} */}
    </li>
  )
}

export default Note