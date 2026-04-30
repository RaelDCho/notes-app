

const LoginForm = (props) => {

  return (
    <div className='login-file'>
      <h3>Login</h3>
      <form className='login-form' onSubmit={ props.onSubmit }>
        <div className='login-input'>
          <label>
            username:
            <input
              type='text'
              value={props.username}
              onChange={({ target }) => props.setUsername(target.value)}
            />
          </label>
        </div>
        <div className='login-input'>
          <label>
            password:
            <input
              type='password'
              value={props.password}
              onChange={({ target }) => props.setPassword(target.value)}
            />
          </label>
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm