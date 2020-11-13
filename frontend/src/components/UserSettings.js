import React, { useState } from 'react'
import axios from 'axios'
import firebase from 'firebase/app'

const UserSettings = ({ user, setUser, storage }) => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
    setImagePreview(URL.createObjectURL(e.target.files[0]))
    URL.revokeObjectURL(e.target.files[0])
  }

  const updateUser = async (uploadedPictureURL) => {
    const newUserData = {
      avatar: uploadedPictureURL,
    }

    try {
      await axios.put('http://localhost:8008/api/users', newUserData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      console.log(user)
      const newUser = user
      newUser.avatar = uploadedPictureURL
      setUser(newUser)
      console.log(user)
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user))
      setImagePreview(null)
      setImage(null)
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

  return (
    <div>
      <h3>Change avatar</h3>
      {imagePreview && (
        <img src={imagePreview} height='200px' width='200px'></img>
      )}
      <form onSubmit={handleImageUpload}>
        <input type='file' onChange={handleImageChange}></input>
        <button>Submit</button>
      </form>
    </div>
  )
}

export default UserSettings
