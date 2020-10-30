import axios from 'axios'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

const App = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedTravelBlogUser')
    if (loggedUser) {
      setUser(JSON.parse(loggedUser))
    }
  }, [])

  return (
    <div>
      {user === null ? 'Hello, world!' : `Hello ${user.username}`}
      {!user && <Login setUser={setUser}></Login>}
    </div>
  )
}

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const user = await axios.post('http://localhost:8008/api/login', {
        username: username,
        password: password,
      })
      setUsername('')
      setPassword('')
      setUser(user.data)
      console.log(user.data)
      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(user.data)
      )
    } catch (error) {
      console.log(error.message)
    }
  }
  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type='text'
          onChange={({ target }) => setUsername(target.value)}
        ></input>
        <input
          type='password'
          onChange={({ target }) => setPassword(target.value)}
        ></input>
        <button type='submit'>Login</button>
      </form>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
