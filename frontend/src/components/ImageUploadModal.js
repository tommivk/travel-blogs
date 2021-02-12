import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Button,
  Modal,
  CircularProgress,
  TextField,
} from '@material-ui/core';
import Explore from '@material-ui/icons/Explore';
import Room from '@material-ui/icons/Room';
import GoogleMapReact from 'google-map-react';
import AddLocations from './AddLocations';
import '../styles/imageUploadModal.css';

const GEO_API_KEY = process.env.REACT_APP_GEOCODE_API_KEY;

const ImageUploadModal = ({
  user,
  setUser,
  uploadModalOpen,
  closeModal,
  allPictures,
  setAllPictures,
  handleMessage,
}) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(null);
  const [publishToGallery, setPublishToGallery] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [step, setStep] = useState(0);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && location) {
      setStep(3);
    }
  }, [location]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    setSearchFilter(inputRef.current.value);
  };

  const handleLocationSelect = () => {
    const { lat, lng } = { lat: markerPosition.lat, lng: markerPosition.lng };
    try {
      axios
        .get(
          `https://eu1.locationiq.com/v1/reverse.php?key=${GEO_API_KEY}&lat=${lat}&lon=${lng}&accept-language=en&format=json`,
        )
        .then((res) => setLocation(
          {
            latitude: lat,
            longitude: lng,
            city: res.data.address.city,
            country: res.data.address.country,
          },
        ));
    } catch (error) {
      console.log(error);
    }

    setStep(3);
    setMapOpen(false);
  };

  const handleImageChange = (e) => {
    if (!e.target.files[0]) return;

    if (e.target.files[0] && e.target.files[0].type && e.target.files[0].type) {
      if (e.target.files[0].type !== 'image/png'
         && e.target.files[0].type !== 'image/jpg'
         && e.target.files[0].type !== 'image/jpeg') {
        handleMessage('error', 'Only JPG, JPEG and PNG file types allowed');
        return;
      }
    }

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
    setLocation(null);
    setStep(0);
  };

  const handleNextStep = () => {
    setStep(step + 1);
    setSearchFilter('');
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
    setSearchFilter('');
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (title.length < 3) {
      handleMessage('error', 'Title must be at least 3 characters long');
      setStep(1);
      return;
    }

    let locationData = {
      lat: null, lng: null, city: null, country: null,
    };

    if (location) {
      locationData = {
        ...location,
        lat: location.latitude,
        lng: location.longitude,
      };
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('location', JSON.stringify(locationData));
    formData.append('public', publishToGallery);
    formData.append('title', title);

    try {
      const response = await axios.post(
        'http://localhost:8008/api/pictures',
        formData,
        {
          onUploadProgress: () => setUploadInProgress(true),
          headers: {
            Authorization: `Bearer ${user.token}`,
          },

        },
      );

      setUploadInProgress(false);

      const newUser = user;
      newUser.pictures = [response.data].concat(user.pictures);
      setUser(newUser);
      setAllPictures(allPictures.concat(response.data));
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(user));
      setImagePreview(null);
      setImage(null);
      setTitle('');
      setLocation(null);
      setStep(0);
      setPublishToGallery(false);
      handleMessage('success', 'Image uploaded!');
    } catch (error) {
      handleMessage('error', error.response.data.error);
      setUploadInProgress(false);
    }
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
            {step < 4
            && (
            <span
              id="image-upload-modal-title"
            >
              Upload Images
            </span>
            )}
          </h2>
          {step < 4
           && (
           <div className={`upload-modal-middle-container ${step === 0 && 'first-step'}`}>
             <div className={`upload-modal-midddle-content ${step === 0 && 'first-step'}`}>
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
                 <h3>(Optional) Choose location</h3>
                 <form onSubmit={handleCitySearch}>
                   <input id="upload-modal-search-input" ref={inputRef} placeholder="Search for cities..." />
                   <button id="upload-modal-search-button" type="submit">Search</button>
                 </form>
                 <div className="image-modal-search-result">
                   <AddLocations
                     filter={searchFilter}
                     selectFunction={setLocation}
                   />
                 </div>
                 <div>
                   {searchFilter === ''
                    && (
                    <div className="upload-modal-map-select">
                      Or select from map:
                      {' '}
                      <Explore
                        id="upload-modal-map-button"
                        onClick={() => setMapOpen(true)}
                      />
                    </div>
                    )}
                 </div>
               </div>
               )}
               {step === 3 && (
               <div>
                 <h3>Publish This Image To Gallery?</h3>
                 <div className="upload-modal-publicicity-select-buttons">
                   <Button id="upload-modal-yes-button" variant="contained" onClick={() => handleSetPublicity(true)}>Yes</Button>
                   <Button id="upload-modal-no-button" variant="contained" onClick={() => handleSetPublicity(false)}>No</Button>
                 </div>
               </div>
               )}
             </div>

             <div>
               {image && step < 4 ? (
                 <div>
                   {step > 1 && (
                   <Button id="upload-modal-back-button" variant="contained" onClick={handlePreviousStep}>{'<-'}</Button>
                   )}
                   {step === 0 && (
                   <Button id="upload-modal-next-button-first" variant="contained" onClick={handleNextStep}>next</Button>
                   )}
                   {step > 0 && step < 3 && (
                   <Button id="upload-modal-next-button" variant="contained" onClick={handleNextStep}>
                     {step === 2 ? 'skip' : 'next'}
                   </Button>
                   )}
                 </div>
               ) : null}
             </div>
           </div>
           )}

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
                Cancel Image
              </Button>
              )}
              {step > 0 && (
                <div>
                  <h2>Preview</h2>

                  <img alt="" src={imagePreview} height="130" width="130" />
                  {step > 1 && <h3>Image Info</h3>}
                  <table className="image-upload-preview-table">
                    <tbody>
                      <>
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
                        <td>{publishToGallery ? 'Yes' : 'No'}</td>
                      </tr>
                      )}
                      </>
                    </tbody>
                  </table>
                    {location && <h3>Location</h3> }
                  <table className="image-upload-preview-table">
                    <tbody>
                      {location
                      && (
                      <>
                        <tr>
                          <td>Country:</td>
                          <td>
                            {location.country}
                          </td>
                        </tr>
                        <tr>
                          <td>City:</td>
                          <td>{location.city ? location.city : 'Unknown'}</td>
                        </tr>
                      </>
                      ) }
                    </tbody>
                  </table>
                  {step === 4 && (
                    <div className="image-modal-preview-bottom">
                      <div className="image-modal-upload-form">
                        <form onSubmit={handleImageUpload}>
                          <Button variant="contained" id="image-modal-final-cancel-button" onClick={() => setStep(3)}>{'<-'}</Button>
                          {uploadInProgress
                            ? (
                              <Button id="image-modal-upload-button" variant="contained" type="button" disabled>
                                <CircularProgress id="image-modal-progress-circle" />
                              </Button>
                            )
                            : (
                              <Button id="image-modal-upload-button" variant="contained" type="submit">
                                Upload
                              </Button>
                            )}
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
  uploadModalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default ImageUploadModal;
