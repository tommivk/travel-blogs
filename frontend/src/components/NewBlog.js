/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Create from '@material-ui/icons/Create';
import { Editor } from '@tinymce/tinymce-react';
import EditLocation from '@material-ui/icons/EditLocation';
import Subject from '@material-ui/icons/Subject';
import Visibility from '@material-ui/icons/Visibility';
import { Button, TextField, Modal } from '@material-ui/core';
import AddLocations from './AddLocations';
import ImageUploadModal from './ImageUploadModal';
import '../styles/newBlog.css';

const UserImagesModal = ({
  open,
  closeModal,
  user,
  setUploadModalOpen,
  setHeaderImageURL,
}) => {
  const handleImagePick = (image) => {
    setHeaderImageURL(image);
    closeModal();
  };
  return (
    <Modal open={open} onClose={closeModal}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '55vh',
          backgroundColor: '#33302a',
          color: 'white',
        }}
      >
        <div
          className="user-image-modal-content"
          style={{ height: '100%', width: '100%' }}
        >
          <h2>My Images</h2>
          <div className="user-image-modal-pictures">
            {user.pictures.map((pic) => (
              <img
                onClick={() => handleImagePick(pic.imgURL)}
                src={pic.imgURL}
                alt=""
              />
            ))}
          </div>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Images
          </Button>
        </div>
      </div>
    </Modal>
  );
};

UserImagesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  setUploadModalOpen: PropTypes.func.isRequired,
  setHeaderImageURL: PropTypes.func.isRequired,
};

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
  const [headerImageURL, setHeaderImageURL] = useState(null);
  const [locations, setLocations] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [userImageModalOpen, setUserImageModalOpen] = useState(false);
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

  const closeUserImageModal = () => {
    setUserImageModalOpen(false);
  };

  const handleLocationRemove = (location) => {
    let locationCopy = locations;
    locationCopy = locationCopy.filter((loc) => loc !== location);
    setLocations(locationCopy);
  };
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8008/api/blogs',
        {
          username: user.username,
          content,
          title,
          description,
          headerImageURL,
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
                {!headerImageURL && (
                  <Button
                    id="new-blog-image-add-button"
                    onClick={() => setUserImageModalOpen(true)}
                  >
                    Choose A Cover Image
                  </Button>
                )}
                {headerImageURL && (
                  <div className="new-blog-preview-image">
                    <img src={headerImageURL} alt="preview" />
                    <button
                      type="button"
                      id="preview-image-close-button"
                      onClick={() => setHeaderImageURL(null)}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
              <UserImagesModal
                closeModal={closeUserImageModal}
                open={userImageModalOpen}
                user={user}
                setUploadModalOpen={setUploadModalOpen}
                setHeaderImageURL={setHeaderImageURL}
              />
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
