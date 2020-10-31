import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link, Modal, Button, TextField } from '@material-ui/core'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import './index.css'

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
  console.log(user)
  if (!user) {
    return <Index setUser={setUser}></Index>
  }
  return (
    <div>
      {user && (
        <img
          style={{ float: 'right' }}
          src={user.avatar}
          height='50'
          width='50'
        ></img>
      )}

      {user && <LogOut setUser={setUser}></LogOut>}
      {!user && <Login setUser={setUser}></Login>}
      {!user && <SignUp></SignUp>}
    </div>
  )
}
const IndexModal = ({ modalOpen, closeModal, setUser }) => {
  if (!modalOpen.open) return null
  if (modalOpen.modal !== 'login' && modalOpen.modal !== 'signup') return null
  return (
    <div>
      <Modal
        open={modalOpen.open}
        onClose={closeModal}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            backgroundColor: 'white',
          }}
        >
          {modalOpen.modal === 'login' ? (
            <Login setUser={setUser}></Login>
          ) : (
            <SignUp></SignUp>
          )}
        </div>
      </Modal>
    </div>
  )
}
const Index = ({ setUser }) => {
  const [modalOpen, setModalOpen] = useState({ open: false, modal: '' })

  const openSignUpModal = () => {
    setModalOpen({ open: true, modal: 'signup' })
  }
  const openLoginModal = () => {
    setModalOpen({ open: true, modal: 'login' })
  }
  const closeModal = () => {
    setModalOpen({ open: false, modal: '' })
  }

  return (
    <div style={{ height: '100vh', backgroundColor: 'rgb(60,60,60)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        {modalOpen && (
          <IndexModal
            modalOpen={modalOpen}
            closeModal={closeModal}
            setUser={setUser}
          ></IndexModal>
        )}
        <Button
          style={{ margin: '20px' }}
          onClick={openSignUpModal}
          size='large'
          variant='outlined'
          color='secondary'
        >
          Sign Up
        </Button>
        <div style={{ cursor: 'pointer' }}>
          Already a member? <Link onClick={openLoginModal}>Login</Link>
        </div>
      </div>
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
        <TextField
          id='outlined-textarea'
          variant='outlined'
          type='text'
          label='Username'
          autoComplete='off'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        ></TextField>
        <br></br>
        <TextField
          id='outlined-textarea'
          label='Password'
          variant='outlined'
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        ></TextField>
        <br></br>
        <Button type='submit' color='primary' variant='contained'>
          Sign up
        </Button>
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
      <Button variant='contained' color='primary' onClick={handleLogout}>
        Logout
      </Button>
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
        <TextField
          id='outlined-textarea'
          variant='outlined'
          type='text'
          placeholder='Username'
          autoComplete='off'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        ></TextField>
        <br></br>
        <TextField
          id='outlined-textarea'
          placeholder='Password'
          variant='outlined'
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        ></TextField>
        <br></br>
        <Button type='submit' color='primary' variant='contained'>
          Login
        </Button>
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
