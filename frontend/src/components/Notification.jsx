

const Notification = ({ message, notification }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='notification' id={notification ? 'success' : 'error'}>
      {message}
    </div>
  )
}

export default Notification