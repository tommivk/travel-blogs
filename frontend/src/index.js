import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';
import firebase from 'firebase/app';
import WorldMap from './components/WorldMap';
import IndexPage from './components/IndexPage';
import NewBlog from './components/NewBlog';
import HomePage from './components/HomePage';
import Gallery from './components/Gallery';
import SingleBlogPage from './components/SingleBlogPage';
import SinglePicturePage from './components/SinglePicturePage';
import Blogs from './components/Blogs';
import UserPage from './components/UserPage';

import Header from './components/Header';
import './index.css';

require('firebase/storage');
require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FB_DATABASE_URL,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

const App = () => {
  const [user, setUser] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [allPictures, setAllPictures] = useState([]);
  const [filteredPictures, setFilteredPictures] = useState({
    pictures: null,
    filter: null,
  });
  const [picture, setPicture] = useState(null);
  const [blog, setBlog] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', message: '' });

  const handleMessage = (t, m) => {
    setMessage({ type: t, message: m });
    setTimeout(() => setMessage({ type: '', message: '' }), 5000);
  };

  useEffect(() => {
    const loggedUser = localStorage.getItem('loggedTravelBlogUser');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
    axios
      .get('http://localhost:8008/api/blogs')
      .then((response) => setAllBlogs(response.data));

    axios
      .get('http://localhost:8008/api/pictures')
      .then((res) => setAllPictures(res.data));

    axios
      .get('http://localhost:8008/api/users')
      .then((res) => setAllUsers(res.data));
  }, []);

  useEffect(async () => {
    if (user && user.fbtoken) {
      await firebase
        .auth()
        .signInWithCustomToken(user.fbtoken)
        .then((res) => console.log('signed in to firebase with token', res))
        .catch((e) => console.log(e));

      await axios
        .get(`http://localhost:8008/api/notifications/user/${user.id}`)
        .then((res) => setUserNotifications(res.data));
    }
  }, [user]);

  const blogMatch = useRouteMatch('/blogs/:id');

  const pictureMatch = useRouteMatch('/gallery/:id');

  useEffect(() => {
    if (allPictures && pictureMatch) {
      const pic = allPictures.find((p) => p.id === pictureMatch.params.id);
      setPicture(pic);
    }
    if (allBlogs && blogMatch) {
      const foundBlog = allBlogs.find(
        (b) => b.id === blogMatch.params.id,
      );
      setBlog(foundBlog);
    }
  }, [pictureMatch, blogMatch]);

  const userMatch = useRouteMatch('/users/:id');
  let selectedUser = null;
  if (allUsers) {
    selectedUser = userMatch
      ? allUsers.find((u) => u.id === userMatch.params.id)
      : null;
  }

  if (!user) {
    return (
      <IndexPage
        setUser={setUser}
        message={message}
        handleMessage={handleMessage}
        allUsers={allUsers}
        setAllUsers={setAllUsers}
      />
    );
  }
  return (
    <div style={{ height: '100vh' }}>
      {message.message !== '' && (
        <Alert
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '50px',
            zIndex: '9999',
          }}
          severity={message.type}
        >
          {message.message}
        </Alert>
      )}
      <Switch>
        <Route path="/createblog">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
          />

          <NewBlog
            user={user}
            setUser={setUser}
            setAllBlogs={setAllBlogs}
            allBlogs={allBlogs}
            storage={storage}
            allPictures={allPictures}
            setAllPictures={setAllPictures}
            handleMessage={handleMessage}
          />
        </Route>
        <Route path="/explore">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
            activePage="map"
          />

          <WorldMap
            allBlogs={allBlogs}
            allPictures={allPictures}
            user={user}
            setFilteredPictures={setFilteredPictures}
          />
        </Route>
        <Route path="/gallery/:id">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
          />
          <SinglePicturePage
            user={user}
            picture={picture}
            allPictures={allPictures}
            setAllPictures={setAllPictures}
            filteredPictures={filteredPictures}
            setFilteredPictures={setFilteredPictures}
            setPicture={setPicture}
            handleMessage={handleMessage}
          />
        </Route>
        <Route path="/gallery">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
            activePage="gallery"
          />
          <Gallery
            allPictures={allPictures}
            setAllPictures={setAllPictures}
            setFilteredPictures={setFilteredPictures}
            user={user}
            setUser={setUser}
            storage={storage}
            handleMessage={handleMessage}
          />
        </Route>
        <Route path="/users/:id">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
          />
          <UserPage
            userMatch={selectedUser}
            user={user}
            setUser={setUser}
            storage={storage}
            allUsers={allUsers}
            setAllUsers={setAllUsers}
            allBlogs={allBlogs}
            setAllBlogs={setAllBlogs}
            allPictures={allPictures}
            setAllPictures={setAllPictures}
          />
        </Route>
        <Route path="/blogs/:id">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
          />
          <SingleBlogPage
            blog={blog}
            setBlog={setBlog}
            allBlogs={allBlogs}
            setAllBlogs={setAllBlogs}
            user={user}
            handleMessage={handleMessage}
          />
        </Route>
        <Route path="/blogs">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
            activePage="blogs"
          />
          <Blogs allBlogs={allBlogs} />
        </Route>
        <Route path="/">
          <Header
            user={user}
            setUser={setUser}
            allPictures={allPictures}
            allBlogs={allBlogs}
            allUsers={allUsers}
            userNotifications={userNotifications}
            setUserNotifications={setUserNotifications}
          />
          <HomePage allBlogs={allBlogs} allPictures={allPictures} />
        </Route>
      </Switch>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  // eslint-disable-next-line no-undef
  document.getElementById('root'),
);
