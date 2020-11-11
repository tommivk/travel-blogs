import React, { useState } from 'react'
import firebase from 'firebase/app'
import axios from 'axios'
import { Button, Modal, Input } from '@material-ui/core'

const ImageUploadModal = ({
  user,
  setUser,
  storage,
  uploadModalOpen,
  closeModal,
}) => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  console.log(uploadModalOpen)

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
  if (!uploadModalOpen) return null
  return (
    <div>
      <Modal
        open={uploadModalOpen}
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
            width: '60%',
            height: '60%',
          }}
        >
          <h2 style={{ textAlign: 'center' }}>Upload Images</h2>

          <div style={{ position: 'absolute', left: '5%', bottom: '5%' }}>
            {imagePreview && (
              <img alt='' src={imagePreview} height='200' width='200'></img>
            )}

            <form onSubmit={handleImageUpload}>
              <input type='file' onChange={handleImageChange}></input>

              <Button type='submit' variant='contained' color='secondary'>
                upload
              </Button>
            </form>
          </div>
          <div
            style={{
              position: 'absolute',
              right: '2%',
              top: '3%',
              width: '25%',
              height: '94%',
              overflowY: 'scroll',
              textAlign: 'center',
              border: '2px solid black',
              borderRadius: '2%',
              overflowX: 'hidden',
            }}
          >
            <h4>My Images</h4>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexDirection: 'row',
                alignContent: 'stretch',
                flexWrap: 'wrap',
              }}
            >
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
        </div>
      </Modal>
    </div>
  )
}

export default ImageUploadModal
