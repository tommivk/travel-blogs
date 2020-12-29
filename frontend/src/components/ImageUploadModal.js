import React, { useState, useEffect } from 'react'
import firebase from 'firebase/app'
import axios from 'axios'
import { Button, Modal, Input, LinearProgress, Switch } from '@material-ui/core'
import Explore from '@material-ui/icons/Explore'
import Room from '@material-ui/icons/Room'
import GoogleMapReact from 'google-map-react'
import imageModalBG from '../images/imagemodalbg.jpg'
import AddLocations from './AddLocations'
import { v4 as uuidv4 } from 'uuid'
const GEO_API_KEY = process.env.REACT_APP_GEOCODE_API_KEY

const ImageUploadModal = ({
  user,
  setUser,
  storage,
  uploadModalOpen,
  closeModal,
  allPictures,
  setAllPictures,
  handleMessage,
}) => {
  const [image, setImage] = useState(null)
  const [title, setTitle] = useState('')
  const [locations, setLocations] = useState([])
  const [publishToGallery, setPublishToGallery] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [step, setStep] = useState(0)
  const [mapOpen, setMapOpen] = useState(false)
  const [markerPosition, setMarkerPosition] = useState(null)

  const handleLocationSelect = () => {
    const lat = markerPosition.lat
    const lng = markerPosition.lng
    try {
      axios
        .get(
          `https://eu1.locationiq.com/v1/reverse.php?key=${GEO_API_KEY}&lat=${lat}&lon=${lng}&accept-language=en&format=json`
        )
        .then((res) =>
          setLocations([
            {
              lat,
              lng,
              city: res.data.address.city,
              country: res.data.address.country,
            },
          ])
        )
    } catch (error) {
      console.log(error)
    }

    setStep(3)
    setMapOpen(false)
  }

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

  const uploadPicture = async (uploadedPictureURL, firebaseID) => {
    let locationData = { lat: null, lng: null, city: null, country: null }

    if (locations.length > 0) {
      locationData = locations[locations.length - 1]
    }

    const newPicture = {
      imgURL: uploadedPictureURL,
      firebaseID: firebaseID,
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
      setAllPictures(allPictures.concat(response.data))
      setUploadedImages([uploadedPictureURL].concat(uploadedImages))
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user))
      setImagePreview(null)
      setImage(null)
      setTitle('')
      setLocations([])
      setStep(0)
      setPublishToGallery(false)
      handleMessage('success', 'Image uploaded!')
    } catch (error) {
      handleMessage('error', error.message)
      console.log(error)
    }
  }

  const handleImageUpload = async (e) => {
    e.preventDefault()
    if (title.length < 5) {
      handleMessage('error', 'Title must be at least 5 characters long')
      setStep(1)
      return
    }
    const fbuser = firebase.auth().currentUser
    const userID = fbuser.uid
    const imageID = uuidv4()
    let uploadTask = storage
      .ref()
      .child(`/images/${userID}/${imageID}`)
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
          .then((downloadURL) => uploadPicture(downloadURL, imageID))
      }
    )
  }
  const handleApiLoaded = (map, maps) => {}

  const handleMapDrag = (e) => {
    setMarkerPosition({ lat: e.center.lat(), lng: e.center.lng() })
  }

  if (mapOpen) {
    return (
      <Modal
        open={uploadModalOpen}
        onClose={closeModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            width: '60%',
            height: '60%',
          }}
        >
          <div style={{ height: '100%', width: '100%' }}>
            <Button
              style={{
                position: 'absolute',
                bottom: '1%',
                left: '1%',
                zIndex: '1',
              }}
              variant="outlined"
              color="secondary"
              onClick={() => setMapOpen(false)}
            >
              {'<-'}
            </Button>
            <Button
              style={{
                position: 'absolute',
                zIndex: '1',
                left: '50%',
                bottom: '1%',
                transform: 'translate(-50%, 0)',
              }}
              onClick={handleLocationSelect}
              variant="contained"
              color="primary"
            >
              OK
            </Button>
            <Room
              color="secondary"
              style={{
                position: 'absolute',
                zIndex: '1',
                top: '50%',
                left: '50%',
                transform: `translate(0, -100%)`,
              }}
            ></Room>
            <GoogleMapReact
              options={{ gestureHandling: 'greedy' }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
              bootstrapURLKeys={{
                key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
              }}
              defaultCenter={{ lat: 59, lng: 30 }}
              defaultZoom={1}
              // onChange={(e) => handleMapChange(e)}
              onDrag={(e) => handleMapDrag(e)}
            ></GoogleMapReact>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Modal
        open={uploadModalOpen}
        onClose={closeModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
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
                // border: '3px solid black',
                width: '300px',
                height: '300px',
                // backgroundColor: 'rgba(0,0,0,0.7)',
              }}
            >
              {imagePreview && step === 0 && (
                <img alt="" src={imagePreview} height="300" width="300"></img>
              )}
              {step === 1 && (
                <div>
                  <div>Choose title</div>
                  <div>
                    <Input
                      placeholder="title"
                      style={{ color: 'white' }}
                      value={title}
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
                  <div>
                    Or select from map:{' '}
                    <Explore
                      fontSize="large"
                      onClick={() => setMapOpen(true)}
                    ></Explore>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <div>Publish This Image To Gallery?</div>
                  <div>{publishToGallery ? 'Yes' : 'No'}</div>
                  <Switch
                    checked={publishToGallery}
                    onChange={() => setPublishToGallery(!publishToGallery)}
                  ></Switch>{' '}
                </div>
              )}
            </div>

            <LinearProgress variant="determinate" value={uploadProgress} />

            <div
              style={{ position: 'relative', textAlign: 'center', top: '10px' }}
            >
              {image ? (
                <div>
                  <Button
                    onClick={cancelImage}
                    variant="contained"
                    style={{ marginRight: '5px' }}
                  >
                    Cancel
                  </Button>
                  {step > 0 && (
                    <Button onClick={handlePreviousStep}>Back</Button>
                  )}
                  {step < 4 && (
                    <Button variant="contained" onClick={handleNextStep}>
                      next
                    </Button>
                  )}
                </div>
              ) : (
                <input type="file" onChange={handleImageChange}></input>
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

                  <img alt="" src={imagePreview} height="150" width="150"></img>
                  <p>{title}</p>

                  <p>Location</p>
                  <div>
                    {locations.length > 0 &&
                      `Country: ${locations[locations.length - 1].country}`}
                  </div>
                  <div>
                    {locations.length > 0 &&
                      `City: ${locations[locations.length - 1].city}`}
                  </div>

                  <p>Publish to gallery: {publishToGallery ? 'yes' : 'no'}</p>
                  {step === 4 && (
                    <form onSubmit={handleImageUpload}>
                      <Button variant="contained" color="primary" type="submit">
                        Upload
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ImageUploadModal
