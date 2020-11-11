import axios from 'axios'
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import WorldMap from './components/WorldMap'
import Index from './components/Index'
import NewBlog from './components/NewBlog'
import HomePage from './components/HomePage'
import Gallery from './components/Gallery'
import SingleBlogPage from './components/SingleBlogPage'
import SinglePicturePage from './components/SinglePicturePage'

import UserSettings from './components/UserSettings'
import Grid from '@material-ui/core/Grid'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
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

const App = () => {
  const [user, setUser] = useState(null)
  const [allBlogs, setAllBlogs] = useState(null)
  const [allPictures, setAllPictures] = useState(null)

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedTravelBlogUser')
    if (loggedUser) {
      setUser(JSON.parse(loggedUser))
    }

    axios
      .get('http://localhost:8008/api/blogs')
      .then((response) => setAllBlogs(response.data))

    axios
      .get('http://localhost:8008/api/pictures')
      .then((res) => setAllPictures(res.data))
  }, [])

  useEffect(() => {
    if (user && user.fbtoken) {
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

  const pictureMatch = useRouteMatch('/gallery/:id')
  let picture = null
  if (allPictures) {
    picture = pictureMatch
      ? allPictures.find((pic) => pic.id === pictureMatch.params.id)
      : null
  }
  if (!user) {
    return <Index setUser={setUser}></Index>
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
                setUser={setUser}
                setAllBlogs={setAllBlogs}
                allBlogs={allBlogs}
                storage={storage}
              ></NewBlog>
            </Grid>
            <Grid xs={3}>
              {/* <ImageUpload
                user={user}
                setUser={setUser}
                storage={storage}
              ></ImageUpload> */}
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
            <WorldMap allBlogs={allBlogs} allPictures={allPictures}></WorldMap>
          </div>
        </Route>
        <Route path='/gallery/:id'>
          <Header user={user} setUser={setUser}></Header>
          <SinglePicturePage
            picture={picture}
            allPictures={allPictures}
          ></SinglePicturePage>
        </Route>
        <Route path='/gallery'>
          <Header user={user} setUser={setUser}></Header>
          <Gallery allPictures={allPictures}></Gallery>
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

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
