import React, { useState } from 'react'
import firebase from 'firebase/app'
import axios from 'axios'
import { Button, Modal, Input, LinearProgress, Switch } from '@material-ui/core'
import imageModalBG from '../images/imagemodalbg.jpg'
import AddLocations from './AddLocations'
const ImageUploadModal = ({
  user,
  setUser,
  storage,
  uploadModalOpen,
  closeModal,
}) => {
  const [image, setImage] = useState(null)
  const [title, setTitle] = useState('')
  const [locations, setLocations] = useState([])
  const [publishToGallery, setPublishToGallery] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [step, setStep] = useState(0)
  console.log(uploadModalOpen)

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
    setImagePreview(URL.createObjectURL(e.target.files[0]))
    URL.revokeObjectURL(e.target.files[0])
  }

  const cancelImage = () => {
    setImage(null)
    setImagePreview(null)
    setStep(0)
  }

  const handleNextStep = () => {
    setStep(step + 1)
  }
  const handlePreviousStep = () => {
    setStep(step - 1)
  }

  const uploadPicture = async (uploadedPictureURL) => {
    const locationData = locations[locations.length - 1]
    const newPicture = {
      imgURL: uploadedPictureURL,
      public: publishToGallery,
      location: locationData,
      title: title,
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
      newUser.pictures = [response.data].concat(user.pictures)
      setUser(newUser)
      setUploadedImages([uploadedPictureURL].concat(uploadedImages))
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user))
      setImagePreview(null)
      setImage(null)
      setTitle('')
      setLocations([])
      setStep(0)
      setPublishToGallery(false)
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
        setUploadProgress(progress)
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
            width: '60%',
            height: '60%',
            backgroundImage: `url(${imageModalBG})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'left bottom',
            color: 'white',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: 'fit-content',
                backgroundColor: 'rgb(0,0,0)',
                padding: '8px',
                borderRadius: '5px',
              }}
            >
              Upload Images
            </span>
          </h2>
          <div style={{ position: 'absolute', top: '20%', left: '42%' }}>
            <div
              style={{
                border: '3px solid black',
                width: '300px',
                height: '300px',
                backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              {imagePreview && step === 0 && (
                <img alt='' src={imagePreview} height='300' width='300'></img>
              )}
              {step === 1 && (
                <div>
                  <div>Choose title</div>
                  <div>
                    <Input
                      placeholder='title'
                      style={{ color: 'white' }}
                      onChange={({ target }) => setTitle(target.value)}
                    ></Input>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <div>Choose location</div>
                  search for city
                  <AddLocations
                    locations={locations}
                    setLocations={setLocations}
                  ></AddLocations>
                  <div>Or select from map: [O]</div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <div>Publish image to Gallery?</div>
                  No{' '}
                  <Switch
                    checked={publishToGallery}
                    onChange={() => setPublishToGallery(!publishToGallery)}
                  ></Switch>{' '}
                  Yes
                </div>
              )}
            </div>

            <LinearProgress variant='determinate' value={uploadProgress} />

            <div
              style={{ position: 'relative', textAlign: 'center', top: '10px' }}
            >
              {image ? (
                <div>
                  <Button
                    onClick={cancelImage}
                    variant='contained'
                    style={{ marginRight: '5px' }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePreviousStep}>Back</Button>
                  <Button variant='contained' onClick={handleNextStep}>
                    next
                  </Button>
                </div>
              ) : (
                <input type='file' onChange={handleImageChange}></input>
              )}
            </div>
          </div>

          {step !== 0 && (
            <div
              style={{
                position: 'absolute',
                right: '2%',
                top: '3%',
                width: '25%',
                height: '94%',
                // overflowY: 'scroll',
                textAlign: 'center',
                border: '2px solid black',
                borderRadius: '2%',
                overflow: 'hidden',
                backgroundColor: '#1d1f1e',
              }}
            >
              {step > 0 && (
                <div>
                  <h2>Preview</h2>

                  <img alt='' src={imagePreview} height='150' width='150'></img>
                  <p>{title}</p>
                  <p>
                    Location: {locations[locations.length - 1]?.lat},{' '}
                    {locations[locations.length - 1]?.lng}{' '}
                  </p>
                  <p>Publish to gallery: {publishToGallery ? 'yes' : 'no'}</p>
                  <form onSubmit={handleImageUpload}>
                    <Button variant='contained' color='primary' type='submit'>
                      Upload
                    </Button>
                  </form>
                </div>
              )}
              {/* <h4>My Images ({user.pictures.length})</h4>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexDirection: 'row',
                alignContent: 'stretch',
                flexWrap: 'wrap',
              }}
            >
              {user.pictures.length === 0 && <p>No images uploaded.</p>}
              {user.pictures.map((picture) => (
                <div>
                  <img
                    key={picture.id}
                    alt=''
                    src={picture.imgURL}
                    height='100'
                    width='100'
                  ></img>
                </div>
              ))}
            </div> */}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImageUploadModal
