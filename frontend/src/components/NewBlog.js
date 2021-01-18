/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import firebase from 'firebase/app';
import PropTypes from 'prop-types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Create from '@material-ui/icons/Create';
import { Editor } from '@tinymce/tinymce-react';
import EditLocation from '@material-ui/icons/EditLocation';
import Subject from '@material-ui/icons/Subject';
import Visibility from '@material-ui/icons/Visibility';
import { Button, TextField } from '@material-ui/core';
import AddLocations from './AddLocations';
import ImageUploadModal from './ImageUploadModal';
import '../styles/newBlog.css';

const getSteps = () => ['Set Title', 'Write Content', 'Add Locations', 'Preview And Submit'];

const NewBlog = ({
  user,
  setUser,
  allBlogs,
  setAllBlogs,
  storage,
  allPictures,
  setAllPictures,
  handleMessage,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [locations, setLocations] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevState) => prevState + 1);
  };

  const handleBack = () => {
    setActiveStep((prevState) => prevState - 1);
  };

  const handleBlogChange = (editorContent) => {
    setContent(editorContent);
  };
  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleLocationRemove = (location) => {
    let locationCopy = locations;
    locationCopy = locationCopy.filter((loc) => loc !== location);
    setLocations(locationCopy);
  };

  const handleMongoUpload = async (headerImageURL, headerImageID) => {
    try {
      const response = await axios.post(
        'http://localhost:8008/api/blogs',
        {
          username: user.username,
          content,
          title,
          description,
          headerImageURL,
          headerImageID,
          locations,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      setContent('');
      setTitle('');
      setAllBlogs(allBlogs.concat(response.data));
      handleMessage('success', 'Blog Submitted!');
    } catch (error) {
      handleMessage('error', error.message);
      console.log(error.message);
    }
    setActiveStep(4);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!headerImage) {
        return handleMongoUpload();
      }

      const fbuser = firebase.auth().currentUser;
      const userID = fbuser.uid;
      const imageID = uuidv4();
      const uploadTask = storage
        .ref()
        .child(`/blogcovers/${userID}/${imageID}`)
        .put(headerImage);

      return uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress} % done`);
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
          console.log('error happened', error);
        },
        () => {
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((headerPictureURL) => handleMongoUpload(headerPictureURL, imageID));
        },
      );
    } catch (error) {
      return console.log(error);
    }
  };

  const handleImageChange = (e) => {
    if (!e.target.files[0]) return;
    setHeaderImage(e.target.files[0]);
    setHeaderImagePreview(URL.createObjectURL(e.target.files[0]));
  };

  const stepperIcons = (p) => {
    const icons = {
      1: <Subject />,
      2: <Create />,
      3: <EditLocation />,
      4: <Visibility />,
    };
    return <div>{icons[String(p.icon)]}</div>;
  };

  switch (activeStep) {
    case 0:
      return (
        <div className="new-blog-main-container">
          <div className="new-blog-stepper-container">
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step key={step}>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    StepIconComponent={stepperIcons}
                  >
                    {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div className="new-blog-info-container">
            <ImageUploadModal
              uploadModalOpen={uploadModalOpen}
              closeModal={closeUploadModal}
              user={user}
              setUser={setUser}
              storage={storage}
              allPictures={allPictures}
              setAllPictures={setAllPictures}
              handleMessage={handleMessage}
            />
            <div>
              <div className="new-blog-textfield">
                <TextField
                  label="Title"
                  variant="outlined"
                  value={title}
                  onChange={({ target }) => setTitle(target.value)}
                />
              </div>
              <div className="new-blog-textfield">
                <TextField
                  label="Blog Description"
                  value={description}
                  onChange={({ target }) => setDescription(target.value)}
                  variant="outlined"
                />
              </div>
            </div>
            <div>
              <div className="new-blog-image-preview">
                {!headerImagePreview && (
                  <input type="file" onChange={handleImageChange} />
                )}
                {headerImagePreview && (
                  <div className="new-blog-preview-image">
                    <img src={headerImagePreview} alt="preview" />
                    <button
                      type="button"
                      id="preview-image-close-button"
                      onClick={() => setHeaderImagePreview(null)}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="new-blog-nav-button-right">
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      );
    case 1:
      return (
        <div className="new-blog-main-container">
          <div>
            <div className="new-blog-stepper-container">
              <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((step, index) => (
                  <Step>
                    <StepLabel
                      onClick={() => setActiveStep(index)}
                      StepIconComponent={stepperIcons}
                    >
                      {step}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
            <Editor
              value={content}
              init={{
                height: 650,
                menubar: true,
                paste_data_images: true,
                plugins: ['paste'],
              }}
              onEditorChange={handleBlogChange}
            />
          </div>
          <div className="new-blog-bottom-navigation">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      );
    case 2:
      return (
        <div className="new-blog-main-container">
          <div className="new-blog-stepper-container">
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    StepIconComponent={stepperIcons}
                  >
                    {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div className="location-select-wrapper">
            <div className="new-blog-selected-locations">
              <h3>Locations selected</h3>
              {locations.map((loc) => (
                <div>
                  {loc.city}
                  ,
                  {loc.country}
                  <span onClick={() => handleLocationRemove(loc)}>(x)</span>
                </div>
              ))}
            </div>
            <div className="location-select-form">
              <AddLocations
                locations={locations}
                setLocations={setLocations}
              />
            </div>
          </div>
          <div className="new-blog-bottom-navigation">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="new-blog-main-container">
          <div className="new-blog-stepper-container">
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    StepIconComponent={stepperIcons}
                  >
                    {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div className="new-blog-bottom-navigation">
            <div>
              <Button onClick={handleBack}>Back</Button>
            </div>
            <div>
              <form onSubmit={handleBlogSubmit}>
                <Button className="new-blog-nav-button-right" type="submit">
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="new-blog-main-container">
          <div className="new-blog-stepper-container">
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step>
                  <StepLabel
                    onClick={() => setActiveStep(index)}
                    StepIconComponent={stepperIcons}
                  >
                    {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          Blog submitted!
        </div>
      );
    default:
      return null;
  }
};

NewBlog.propTypes = {
  user: PropTypes.instanceOf(Object).isRequired,
  setUser: PropTypes.func.isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  setAllBlogs: PropTypes.func.isRequired,
  storage: PropTypes.instanceOf(Object).isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default NewBlog;
