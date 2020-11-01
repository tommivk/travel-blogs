import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link, Modal, Button, TextField } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import { Search, Language, Notifications } from '@material-ui/icons'
import Menu from '@material-ui/core/Menu'
import Container from '@material-ui/core/Container'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import { Editor } from '@tinymce/tinymce-react'
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

const NewBlog = () => {
  const [content, setContent] = useState('')
  const handleBlogChange = (content, editor) => {
    setContent(content)
  }
  const handleBlogSubmit = (e) => {
    e.preventDefault()
    console.log('asd')
  }
  return (
    <div style={{}}>
      <Container maxWidth='md'>
        <h2 style={{ textAlign: 'center' }}>Create New Blog</h2>
        <form onSubmit={handleBlogSubmit}>
          <TextField
            placeholder='Title'
            variant='outlined'
            size='small'
            style={{ marginBottom: '5px', width: '30%' }}
          ></TextField>
          <Editor
            init={{
              height: 600,
              menubar: true,
              paste_data_images: true,
              plugins: ['paste'],
            }}
            onEditorChange={handleBlogChange}
          ></Editor>
          <Button style={{ float: 'right' }} type='submit'>
            Submit
          </Button>
        </form>
      </Container>
    </div>
  )
}

const Header = ({ user, setUser }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  const handleMenuOpen = (e) => {
    setMenuAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedTravelBlogUser')
    setUser(null)

    firebase
      .auth()
      .signOut()
      .then(() => console.log('signout successful'))
      .catch((error) => console.log('error happened'))

    setMenuAnchorEl(null)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid black',
        marginBottom: '10px',
      }}
    >
      <div>
        <h2 style={{ marginLeft: '10px' }}>TITLE</h2>
      </div>
      <div style={{ margin: 'auto', display: 'flex' }}>
        <Paper component='form' style={{ paddingLeft: '10px' }}>
          <InputBase
            variant='outlined'
            size='small'
            placeholder='Search...'
          ></InputBase>
          <IconButton>
            <Search />
          </IconButton>
        </Paper>
        <div style={{ margin: 'auto', paddingLeft: '20px', cursor: 'pointer' }}>
          <Language fontSize='large' />
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <Notifications fontSize='large' style={{ margin: 'auto' }} />
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img
            src={user.avatar}
            height='50'
            width='50'
            alt='profile picture'
          ></img>
        </div>
      </div>
      <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MenuItem onClick={handleMenuClose}>Add new blog</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  )
}

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
      <Header user={user} setUser={setUser}></Header>
      <NewBlog></NewBlog>
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
