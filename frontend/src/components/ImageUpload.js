import React, { useState } from 'react'
import firebase from 'firebase/app'
import axios from 'axios'
import { Button } from '@material-ui/core'

const ImageUpload = ({ user, setUser, storage }) => {
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
      public: true,
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

export default ImageUpload
