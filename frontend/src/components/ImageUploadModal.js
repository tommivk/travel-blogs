import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import axios from 'axios';
import {
  Button,
  Modal,
  LinearProgress,
  TextField,
} from '@material-ui/core';
import Explore from '@material-ui/icons/Explore';
import Room from '@material-ui/icons/Room';
import GoogleMapReact from 'google-map-react';
import { v4 as uuidv4 } from 'uuid';
// import imageModalBG from '../images/imagemodalbg.jpg';
import AddLocations from './AddLocations';
import '../styles/imageUploadModal.css';

const GEO_API_KEY = process.env.REACT_APP_GEOCODE_API_KEY;

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
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [locations, setLocations] = useState([]);
  const [publishToGallery, setPublishToGallery] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [uploadBarVisible, setUploadBarVisible] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    if (step === 2 && locations.length > 0) {
      setStep(3);
    }
  }, [locations]);

  const handleLocationSelect = () => {
    const { lat, lng } = { lat: markerPosition.lat, lng: markerPosition.lng };
    try {
      axios
        .get(
          `https://eu1.locationiq.com/v1/reverse.php?key=${GEO_API_KEY}&lat=${lat}&lon=${lng}&accept-language=en&format=json`,
        )
        .then((res) => setLocations([
          {
            lat,
            lng,
            city: res.data.address.city,
            country: res.data.address.country,
          },
        ]));
    } catch (error) {
      console.log(error);
    }

    setStep(3);
    setMapOpen(false);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
    URL.revokeObjectURL(e.target.files[0]);
  };

  const handleSetPublicity = (selection) => {
    setPublishToGallery(selection);
    setStep(4);
  };

  const cancelImage = () => {
    setImage(null);
    setImagePreview(null);
    setTitle('');
    setLocations([]);
    setStep(0);
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const uploadPicture = async (uploadedPictureURL, firebaseID) => {
    let locationData = {
      lat: null, lng: null, city: null, country: null,
    };

    if (locations.length > 0) {
      locationData = locations[locations.length - 1];
    }

    const newPicture = {
      imgURL: uploadedPictureURL,
      firebaseID,
      public: publishToGallery,
      location: locationData,
      title,
    };
    try {
      const response = await axios.post(
        'http://localhost:8008/api/pictures',
        newPicture,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      const newUser = user;
      newUser.pictures = [response.data].concat(user.pictures);
      setUser(newUser);
      setAllPictures(allPictures.concat(response.data));
      setUploadedImages([uploadedPictureURL].concat(uploadedImages));
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user));
      setImagePreview(null);
      setImage(null);
      setTitle('');
      setLocations([]);
      setStep(0);
      setUploadProgress(0);
      setPublishToGallery(false);
      setUploadBarVisible(false);
      handleMessage('success', 'Image uploaded!');
    } catch (error) {
      handleMessage('error', error.message);
      console.log(error);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (title.length < 5) {
      handleMessage('error', 'Title must be at least 5 characters long');
      setStep(1);
      return;
    }
    setUploadBarVisible(true);
    const fbuser = firebase.auth().currentUser;
    const userID = fbuser.uid;
    const imageID = uuidv4();
    const uploadTask = storage
      .ref()
      .child(`/images/${userID}/${imageID}`)
      .put(image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress} % done`);
        setUploadProgress(progress);
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED:
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING:
            console.log('Upload is running');
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log({ error });
        handleMessage('error', error.message);
      },
      () => {
        uploadTask.snapshot.ref
          .getDownloadURL()
          .then((downloadURL) => uploadPicture(downloadURL, imageID));
      },
    );
  };

  const handleMapDrag = (e) => {
    setMarkerPosition({ lat: e.center.lat(), lng: e.center.lng() });
  };

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
            transform: 'translate(-50%, -50%)',
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
                transform: 'translate(0, -100%)',
              }}
            />
            <GoogleMapReact
              options={{ gestureHandling: 'greedy' }}
              yesIWantToUseGoogleMapApiInternals
              bootstrapURLKeys={{
                key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
              }}
              defaultCenter={{ lat: 59, lng: 30 }}
              defaultZoom={1}
              onDrag={(e) => handleMapDrag(e)}
            />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div>
      <Modal
        open={uploadModalOpen}
        onClose={closeModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className="image-upload-modal-main-container">
          <h2
            style={{
              textAlign: 'center',
            }}
          >
            <span
              id="image-upload-modal-title"
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
          <div className="upload-modal-middle-container">
            <div className="upload-modal-midddle-content">
              {imagePreview && step === 0 && (
                <img alt="" src={imagePreview} height="300" width="300" />
              )}
              {step === 1 && (
                <div>
                  <h3>Choose title</h3>
                  <div>
                    <TextField
                      id="image-upload-title-input"
                      placeholder="title"
                      value={title}
                      onChange={({ target }) => setTitle(target.value)}
                      variant="outlined"
                      autoFocus
                    />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3>Choose location</h3>
                  search for city
                  <AddLocations
                    locations={locations}
                    setLocations={setLocations}
                  />
                  <div>
                    Or select from map:
                    {' '}
                    <Explore
                      fontSize="large"
                      onClick={() => setMapOpen(true)}
                    />
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3>Publish This Image To Gallery?</h3>
                  <div className="upload-modal-publicicity-select-buttons">
                    <Button id="upload-modal-yes-button" variant="contained" onClick={() => handleSetPublicity(true)}>Yes</Button>
                    <Button id="upload-modal-red-button" variant="contained" onClick={() => handleSetPublicity(false)}>No</Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {image && step < 4 ? (
                <div>
                  {step > 0 && (
                    <Button id="upload-modal-back-button" variant="contained" onClick={handlePreviousStep}>{'<-'}</Button>
                  )}
                  {step < 3 && (
                    <Button id="upload-modal-next-button" variant="contained" onClick={handleNextStep}>
                      {step === 2 ? 'skip' : 'next'}
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {!image && (
          <div className="upload-modal-image-form">
            <label id="upload-modal-file-label" htmlFor="upload-modal-file-input">
              <input type="file" id="upload-modal-file-input" hidden onChange={handleImageChange} />
              Choose Image
            </label>
          </div>
          )}

          {step !== 0 && (
            <div
              className={`upload-modal-preview-container ${step === 4 && 'final-step'}`}
            >
              {step < 4
              && (
              <Button
                type="button"
                variant="contained"
                onClick={cancelImage}
                id="image-modal-preview-cancel-button"
              >
                Cancel
              </Button>
              )}
              {step > 0 && (
                <div>
                  <h2>Preview</h2>

                  <img alt="" src={imagePreview} height="130" width="130" />
                  {step > 1 && <h3>Image Info</h3>}
                  <table className="image-upload-preview-table">
                    <tbody>
                      {step > 1
                      && (
                      <tr>
                        <td>Title:</td>
                        <td>{title}</td>
                      </tr>
                      )}

                      {step > 3
                      && (
                      <tr>
                        <td>Public:</td>
                        <td>{publishToGallery ? 'yes' : 'no'}</td>
                      </tr>
                      )}
                    </tbody>
                  </table>
                    {locations.length > 0 && <h3>Location</h3> }
                  <table className="image-upload-preview-table">
                    <tbody>
                      {locations.length > 0
                      && (
                      <>
                        <tr>
                          <td>Country:</td>
                          <td>
                            {locations[locations.length - 1].country}
                          </td>
                        </tr>
                        <tr>
                          <td>City:</td>
                          <td>{locations[locations.length - 1].city}</td>
                        </tr>
                      </>
                      ) }
                    </tbody>
                  </table>
                  {step === 4 && (
                    <div className="image-modal-preview-bottom">
                      {uploadBarVisible
                      && <LinearProgress id="upload-progress-bar" variant="determinate" value={uploadProgress} /> }
                      <div className="image-modal-upload-form">
                        <form onSubmit={handleImageUpload}>
                          <Button variant="contained" id="image-modal-final-cancel-button" onClick={() => setStep(3)}>{'<-'}</Button>
                          <Button id="image-modal-upload-button" variant="contained" type="submit">
                            Upload
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

ImageUploadModal.propTypes = {
  user: PropTypes.instanceOf(Object).isRequired,
  setUser: PropTypes.func.isRequired,
  storage: PropTypes.instanceOf(Object).isRequired,
  uploadModalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default ImageUploadModal;
