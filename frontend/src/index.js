import axios from 'axios'
import React, { useState, useEffect, Fragment } from 'react'
import GoogleMapReact from 'google-map-react'
import { Modal, Button, TextField } from '@material-ui/core'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import { Search, Language, Notifications } from '@material-ui/icons'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import Grid from '@material-ui/core/Grid'
import Menu from '@material-ui/core/Menu'
import Container from '@material-ui/core/Container'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import CardHeader from '@material-ui/core/CardHeader'
import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import InputBase from '@material-ui/core/InputBase'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Settings from '@material-ui/icons/Settings'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2,
} from 'react-html-parser'
import { Editor } from '@tinymce/tinymce-react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useRouteMatch,
} from 'react-router-dom'
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

const getSteps = () => {
  return ['Set Title', 'Write Content', 'Add Location', 'Preview And Submit']
}

const AddLocations = ({ locations, setLocations }) => {
  const [filter, SetFilter] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const URL =
    'http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix='

  useEffect(() => {
    if (filter !== '') {
      axios.get(`${URL}${filter}`).then((res) => setSearchResult(res.data))
    }
  }, [filter])

  const handleAddLocation = (city) => {
    console.log(city)
    const newLocation = [
      {
        lat: city.latitude,
        lng: city.longitude,
      },
    ]
    setLocations(locations.concat(newLocation))
  }
  return (
    <div>
      {Location && (
        <ul>
          {locations.map((l) => (
            <li>
              {l.lat} {l.lng}
            </li>
          ))}
        </ul>
      )}
      Add locations
      <ul>
        {searchResult &&
          searchResult.data &&
          searchResult.data.map((city) => (
            <div style={{ display: 'flex' }}>
              <li>
                {city.city} {', '} {city.country}
              </li>
              <Button onClick={() => handleAddLocation(city)}>Add</Button>
            </div>
          ))}
      </ul>
      <TextField
        variant='outlined'
        placeholder='search by city'
        onChange={({ target }) => SetFilter(target.value)}
      ></TextField>
    </div>
  )
}

const NewBlog = ({ user, allBlogs, setAllBlogs }) => {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [headerImageURL, setHeaderImageURL] = useState(null)
  const [locations, setLocations] = useState([])
  const steps = getSteps()

  const handleNext = () => {
    setActiveStep((prevState) => prevState + 1)
  }

  const handleBack = () => {
    setActiveStep((prevState) => prevState - 1)
  }

  const handleBlogChange = (content, editor) => {
    setContent(content)
  }

  const handleBlogSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'http://localhost:8008/api/blogs',
        {
          username: user.username,
          content: content,
          title: title,
          headerImageURL: headerImageURL,
          locations: locations,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      setContent('')
      setTitle('')
      const newBlog = {
        author: {
          avatar: user.avatar,
          username: user.username,
        },
        content: response.data.content,
        date: response.data.date,
        id: response.data.id,
        stars: response.data.stars,
        title: response.data.title,
        headerImageURL: response.data.headerImageURL,
        locations: locations,
      }
      setAllBlogs(allBlogs.concat(newBlog))
    } catch (error) {
      console.log(error.message)
    }
    setActiveStep(4)
  }

  switch (activeStep) {
    case 0:
      return (
        <div>
          <Stepper alternativeLabel activeStep={activeStep}>
            {steps.map((step) => (
              <Step>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          Add title:
          <TextField
            placeholder='Title'
            variant='outlined'
            size='small'
            style={{ marginBottom: '5px', width: '30%' }}
            onChange={({ target }) => setTitle(target.value)}
          ></TextField>
          Add Header Image:
          <div>
            <TextField
              onChange={({ target }) => setHeaderImageURL(target.value)}
              variant='outlined'
              style={{ height: '200px', width: '200px' }}
            ></TextField>
          </div>
          <div>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    case 1:
      return (
        <div>
          <div>
            <h2 style={{ textAlign: 'center' }}>Create New Blog</h2>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((step) => (
                <Step>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Editor
              value={content}
              init={{
                height: 600,
                menubar: true,
                paste_data_images: true,
                plugins: ['paste'],
              }}
              onEditorChange={handleBlogChange}
            ></Editor>
            <div style={{ float: 'left' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        </div>
      )
    case 2:
      return (
        <div>
          location
          <Stepper alternativeLabel activeStep={activeStep}>
            {steps.map((step) => (
              <Step>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <AddLocations
            locations={locations}
            setLocations={setLocations}
          ></AddLocations>
          <div style={{ float: 'left' }}>
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    case 3:
      return (
        <div>
          preview
          <Stepper alternativeLabel activeStep={activeStep}>
            {steps.map((step) => (
              <Step>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div style={{ float: 'left' }}>
            <Button onClick={handleBack}>Back</Button>
          </div>
          <form onSubmit={handleBlogSubmit}>
            <Button style={{ float: 'right' }} type='submit'>
              Submit
            </Button>
          </form>
        </div>
      )
    case 4:
      return (
        <div>
          <Stepper alternativeLabel activeStep={activeStep}>
            {steps.map((step) => (
              <Step>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
          Blog submitted!
        </div>
      )
    default:
      return null
  }
}

const ImageUpload = ({ user, setUser }) => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  console.log(user)

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
    setImagePreview(URL.createObjectURL(e.target.files[0]))
  }

  const uploadPicture = async (uploadedPictureURL) => {
    const newPicture = {
      imgURL: uploadedPictureURL,
      public: false,
    }
    try {
      const response = await axios.post(
        'http://localhost:8008/api/pictures',
        newPicture,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      const newUser = user
      newUser.pictures = user.pictures.concat(response.data)
      setUser(newUser)
      setUploadedImages([uploadedPictureURL].concat(uploadedImages))
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user))
      setImagePreview(null)
    } catch (error) {
      console.log(error)
    }
  }

  const handleImageUpload = async (e) => {
    e.preventDefault()
    const fbuser = firebase.auth().currentUser
    console.log(fbuser)
    const userID = fbuser.uid
    let uploadTask = storage
      .ref()
      .child(`/images/${userID}/${image.name}`)
      .put(image)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log('Upload is ' + progress + '% done')
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED:
            console.log('Upload is paused')
            break
          case firebase.storage.TaskState.RUNNING:
            console.log('Upload is running')
            break
        }
      },
      (error) => {
        console.log('error happened')
      },
      () => {
        uploadTask.snapshot.ref
          .getDownloadURL()
          .then((downloadURL) => uploadPicture(downloadURL))
      }
    )
  }
  return (
    <div style={{ height: '100%' }}>
      <h3 style={{ textAlign: 'center' }}>My images</h3>
      {imagePreview && (
        <img alt='' src={imagePreview} height='200' width='200'></img>
      )}
      <form onSubmit={handleImageUpload}>
        <input type='file' onChange={handleImageChange}></input>
        <Button type='submit'>upload</Button>
      </form>
      <div style={{ display: 'block', height: '100%' }}>
        {user.pictures.map((picture, i) => (
          <div>
            <img
              key={i}
              alt=''
              src={picture.imgURL}
              height='100'
              width='100'
            ></img>
          </div>
        ))}
      </div>
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
        <Link to='/' style={{ textDecoration: 'none', color: 'black' }}>
          <h2 style={{ marginLeft: '10px' }}>TITLE</h2>
        </Link>
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
          <Link to='/explore' style={{ color: 'black' }}>
            <Language fontSize='large' />
          </Link>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <Notifications fontSize='large' style={{ margin: 'auto' }} />
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img src={user.avatar} height='50' width='50' alt='avatar'></img>
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
        <MenuItem onClick={handleMenuClose}>
          <Link
            to='/createblog'
            style={{
              textDecoration: 'none',
              color: 'black',
            }}
          >
            Add new blog
          </Link>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>{' '}
        <MenuItem onClick={handleMenuClose}>
          <Link to='/settings'>
            <Settings></Settings>
          </Link>
        </MenuItem>
      </Menu>
    </div>
  )
}

const App = () => {
  const [user, setUser] = useState(null)
  const [allBlogs, setAllBlogs] = useState(null)

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedTravelBlogUser')
    if (loggedUser) {
      setUser(JSON.parse(loggedUser))
    }

    axios
      .get('http://localhost:8008/api/blogs')
      .then((response) => setAllBlogs(response.data))
  }, [])

  useEffect(() => {
    if (user && user.fbtoken) {
      console.log('asd')
      firebase
        .auth()
        .signInWithCustomToken(user.fbtoken)
        .then((res) => console.log('signed in to firebase with token'))
        .catch((e) => console.log(e))
    }
  }, [user])
  const match = useRouteMatch('/blogs/:id')
  let blog = null
  if (allBlogs) {
    blog = match ? allBlogs.find((blog) => blog.id === match.params.id) : null
  }
  if (!user) {
    return <Index setUser={setUser}></Index>
  }
  if (allBlogs) {
  }
  return (
    <div>
      <Switch>
        <Route path='/login'>
          <Header user={user} setUser={setUser}></Header>
        </Route>

        <Route path='/createblog'>
          <Header user={user} setUser={setUser}></Header>
          <Grid container justify='center' spacing={2}>
            <Grid item xs={3}>
              <div></div>
            </Grid>
            <Grid item xs={5}>
              <NewBlog
                user={user}
                setAllBlogs={setAllBlogs}
                allBlogs={allBlogs}
              ></NewBlog>
            </Grid>
            <Grid xs={3}>
              <ImageUpload user={user} setUser={setUser}></ImageUpload>
            </Grid>
          </Grid>
        </Route>
        <Route path='/settings'>
          <Header user={user} setUser={setUser}></Header>
          <UserSettings user={user} setUser={setUser}></UserSettings>
        </Route>
        <Route path='/explore'>
          <div>
            <Header user={user} setUser={setUser}></Header>
            <WorldMap allBlogs={allBlogs}></WorldMap>
          </div>
        </Route>
        <Route path='/blogs/:id'>
          <Header user={user} setUser={setUser}></Header>
          <SingleBlogPage blog={blog}></SingleBlogPage>
        </Route>
        <Route path='/'>
          <Header user={user} setUser={setUser}></Header>
          <HomePage allBlogs={allBlogs}></HomePage>
        </Route>
      </Switch>
    </div>
  )
}
const UserSettings = ({ user, setUser }) => {
  return (
    <div>
      <h3>Change avatar</h3>
      asd
    </div>
  )
}
const WorldMap = ({ allBlogs }) => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        }}
        defaultCenter={{ lat: 59, lng: 30 }}
        defaultZoom={0}
      >
        {allBlogs &&
          allBlogs.map((blog) =>
            blog.locations.map((location) => (
              <ChatOutlined
                lat={location.lat}
                lng={location.lng}
                text='Blog'
              ></ChatOutlined>
            ))
          )}
      </GoogleMapReact>
    </div>
  )
}

const HomePage = ({ allBlogs }) => {
  if (allBlogs == null) return null
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {allBlogs.map((blog) => (
          <div style={{ margin: '5px' }}>
            <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
              <div>
                <Card style={{ width: '250px', height: '400px' }}>
                  <CardHeader
                    avatar={
                      <Avatar alt='author profile' src={blog.author.avatar} />
                    }
                    title={blog.title}
                    subheader={`written by: ${blog.author.username}`}
                    // subheader={blog.date}
                  />
                  <CardMedia>
                    <img
                      src={blog.headerImageURL}
                      height='200px'
                      width='200px'
                    />
                  </CardMedia>
                  <CardContent>
                    {ReactHtmlParser(blog.content, {
                      transform: (node) => {
                        if (node.type === 'tag' && node.name === 'img') {
                          return null
                        }
                      },
                    })}
                  </CardContent>
                </Card>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

const SingleBlogPage = ({ blog }) => {
  if (!blog) return null
  return (
    <div>
      <Container maxWidth='md'>
        <div>
          <h1 style={{ textAlign: 'center' }}>{blog.title}</h1>
          <div style={{ display: 'flex' }}>
            <Avatar alt='author profile' src={blog.author.avatar} />
            {blog.author.username} {blog.date}
          </div>
          {ReactHtmlParser(blog.content)}
        </div>
        <Link to='/'>
          <Button>Go back</Button>
        </Link>
      </Container>
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
          Already a member? <span onClick={openLoginModal}>Login</span>
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
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
