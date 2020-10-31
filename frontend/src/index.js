import axios from 'axios'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
require('firebase/storage')
require('firebase/auth')

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FB_DATABASE_URL,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_APP_ID,
}

firebase.initializeApp(firebaseConfig)
const storage = firebase.storage()

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
      {user && <LogOut setUser={setUser}></LogOut>}
      {!user && <Login setUser={setUser}></Login>}
      {!user && <SignUp></SignUp>}
    </div>
  )
}

const SignUp = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const user = await axios.post('http://localhost:8008/api/users', {
        username,
        password,
      })
      setUsername('')
      setPassword('')
      console.log(user.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSignup}>
        username
        <input
          type='text'
          onChange={({ target }) => setUsername(target.value)}
        ></input>
        <br></br>
        password
        <input
          type='password'
          onChange={({ target }) => setPassword(target.value)}
        ></input>
        <br></br>
        <button type='submit'>Sign up</button>
      </form>
    </div>
  )
}

const LogOut = ({ setUser }) => {
  const handleLogout = () => {
    window.localStorage.removeItem('loggedTravelBlogUser')
    setUser(null)

    firebase
      .auth()
      .signOut()
      .then(() => console.log('signout successful'))
      .catch((error) => console.log('error happened'))
  }
  return (
    <div style={{ float: 'right' }}>
      <button onClick={handleLogout}>Logout</button>
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
      await firebase.auth().signInWithCustomToken(user.data.fbtoken)
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
