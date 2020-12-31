import React, { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import Modal from '@material-ui/core/Modal'
import Checkbox from '@material-ui/core/Checkbox'
import '../styles/userPage.css'

const UserPage = ({
  userMatch,
  user,
  allUsers,
  setAllUsers,
  setUser,
  storage,
}) => {
  const [userData, setUserData] = useState(userMatch)
  const [content, setContent] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [subscribeBlogs, setsubscribeBlogs] = useState(false)
  const [subscribePictures, setSubscribePictures] = useState(false)
  const [isUser, setIsUser] = useState(false)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [editUsername, setEditUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user.username)

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0])
      setImagePreview(URL.createObjectURL(e.target.files[0]))
      URL.revokeObjectURL(e.target.files[0])
    }
  }

  const handleCancelUpdate = () => {
    setImagePreview(null)
    setImage(null)
    setEditUsername(false)
    setNewUsername(user.username)
  }
  const updateUser = async (uploadedPictureURL) => {
    const newUserData = {}

    if (!uploadedPictureURL && newUsername === user.username) {
      handleCancelUpdate()
      return
    }
    if (uploadedPictureURL) {
      newUserData.avatar = uploadedPictureURL
    }
    if (newUsername !== user.username) {
      newUserData.username = newUsername
    }

    try {
      const response = await axios.put(
        'http://localhost:8008/api/users',
        newUserData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      const updatedUser = response.data
      updatedUser.fbtoken = user.fbtoken
      setUser(updatedUser)
      setUserData(response.data)
      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(response.data)
      )
      handleCancelUpdate()
      setNewUsername(response.data.username)

      const newUsers = allUsers.map((u) =>
        u.id === user.id ? response.data : u
      )
      setAllUsers(newUsers)
    } catch (error) {
      console.log(error)
    }
  }

  const handleUserUpdate = async (e) => {
    e.preventDefault()
    if (!image) {
      updateUser()
      return
    }
    const fbuser = firebase.auth().currentUser
    const userID = fbuser.uid
    let uploadTask = storage
      .ref()
      .child(`/avatars/${userID}/${image.name}`)
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
          .then((downloadURL) => updateUser(downloadURL))
      }
    )
  }

  useEffect(() => {
    if (userMatch) {
      setUserData(userMatch)
      userMatch.id === user.id ? setIsUser(true) : setIsUser(false)
    }
  }, [userMatch])

  useEffect(() => {
    if (userData && user) {
      setsubscribeBlogs(userData.blogSubscribers.includes(user.id))
      setSubscribePictures(userData.pictureSubscribers.includes(user.id))
    }
  }, [userData, modalOpen])

  if (!userData) return null

  const joinDate = DateTime.fromISO(userData.joinDate)

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const isSubscribed = () => {
    if (
      userData.blogSubscribers.includes(user.id) ||
      userData.pictureSubscribers.includes(user.id)
    ) {
      return true
    }
    return false
  }

  const handleSubscription = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8008/api/users/${userData.id}/subscription`,
        {
          blogSubscription: subscribeBlogs,
          pictureSubscription: subscribePictures,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      setUserData(response.data)
      const newUsers = allUsers.map((u) =>
        u.id === response.data.id ? response.data : u
      )
      setAllUsers(newUsers)
      setModalOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="user-page-main-container">
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div className="subscribe-modal">
          <h2>Subscribe to {userData.username}</h2>
          <div>
            Blogs
            <Checkbox
              checked={subscribeBlogs}
              onChange={() => setsubscribeBlogs(!subscribeBlogs)}
            ></Checkbox>
          </div>
          <div>
            Pictures
            <Checkbox
              checked={subscribePictures}
              onChange={() => setSubscribePictures(!subscribePictures)}
            ></Checkbox>
          </div>
          <button onClick={handleSubscription}>OK</button>
        </div>
      </Modal>
      <div className="user-page-user-info">
        {isUser && (
          <div>
            <form onSubmit={handleUserUpdate}>
              <input
                type="file"
                id="avatar-upload-button"
                hidden
                onChange={handleImageChange}
              ></input>
              <label htmlFor="avatar-upload-button">
                {imagePreview ? (
                  <img src={imagePreview}></img>
                ) : (
                  <img src={userData.avatar}></img>
                )}
              </label>
              {image || editUsername ? (
                <div className="userpage-update-buttons">
                  <button onClick={() => handleCancelUpdate()}>Cancel</button>
                  {newUsername !== user.username && (
                    <button type="submit">Update</button>
                  )}
                </div>
              ) : null}
            </form>
          </div>
        )}
        {!isUser && <img src={userData.avatar}></img>}

        {editUsername && isUser ? (
          <div>
            <input
              type="text"
              value={newUsername}
              onChange={({ target }) => setNewUsername(target.value)}
            ></input>
          </div>
        ) : null}

        {isUser && !editUsername && (
          <h1 onClick={() => setEditUsername(true)}>{userData.username}</h1>
        )}
        {!isUser && <h1>{userData.username}</h1>}

        <div>
          Member Since {joinDate.monthLong} {joinDate.weekYear}
        </div>
        <div>Created Blogs: {userData.blogs.length}</div>
        <div>Uploaded Pictures: {userData.pictures.length}</div>
        {!isUser && (
          <div>
            <button onClick={() => setModalOpen(true)}>
              {isSubscribed() === true
                ? 'Modify Your Subscription'
                : 'Subscribe'}
            </button>
          </div>
        )}
      </div>
      <button onClick={() => setContent(0)}>Pictures</button>
      <button onClick={() => setContent(1)}>Blogs</button>
      {content === 0 && (
        <div>
          {userData.username}'s Uploaded Pictures
          <div>
            {userData.pictures.map((p) => (
              <Link to={`/gallery/${p.id}`}>
                <img src={p.imgURL}></img>
              </Link>
            ))}
          </div>
        </div>
      )}
      {content === 1 && (
        <div>
          {userData.username}'s Blogs
          <div>
            {userData.blogs.length === 0 ? (
              <div>No blogs created yet</div>
            ) : (
              userData.blogs.map((b) => (
                <Link to={`/blogs/${b.id}`}>{b.title}</Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPage
