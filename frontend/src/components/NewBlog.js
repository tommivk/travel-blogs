/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Create from '@material-ui/icons/Create';
import { Editor } from '@tinymce/tinymce-react';
import EditLocation from '@material-ui/icons/EditLocation';
import Subject from '@material-ui/icons/Subject';
import Visibility from '@material-ui/icons/Visibility';
import { Button, TextField } from '@material-ui/core';
import Explore from '@material-ui/icons/Explore';
import Avatar from '@material-ui/core/Avatar';
import ReactHtmlParser from 'react-html-parser';
import { DateTime } from 'luxon';
import StarBorder from '@material-ui/icons/StarBorder';
import ChatBubbleOutline from '@material-ui/icons/ChatBubbleOutline';
import Container from '@material-ui/core/Container';
import AddLocations from './AddLocations';
import ImageUploadModal from './ImageUploadModal';
import '../styles/newBlog.css';

const getSteps = () => ['Set Title', 'Write Content', 'Add Locations', 'Preview And Submit'];

const NewBlog = ({
  user,
  setUser,
  allBlogs,
  setAllBlogs,
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
  const [uploadedBlogID, setUploadedBlogID] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const steps = getSteps();

  const searchRef = useRef(null);

  useEffect(() => {
    document.title = 'Create New Blog | TravelBlogs';
  }, []);

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

  const handleAddLocation = (city) => {
    const newLocation = [
      {
        lat: city.latitude,
        lng: city.longitude,
        city: city.city,
        country: city.country,
      },
    ];
    setLocations(locations.concat(newLocation));
  };

  const handleLocationRemove = (location) => {
    let locationCopy = locations;
    locationCopy = locationCopy.filter((loc) => loc !== location);
    setLocations(locationCopy);
  };

  const handleBlogSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('image', headerImage);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('content', content);
      formData.append('locations', JSON.stringify(locations));

      const response = await axios.post(
        '/api/blogs',
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      setContent('');
      setTitle('');
      setDescription('');
      setHeaderImage(null);
      setLocations([]);
      setHeaderImagePreview(null);
      setAllBlogs(allBlogs.concat(response.data));
      const userCopy = { ...user };
      userCopy.blogs.unshift(response.data);
      window.localStorage.setItem('loggedTravelBlogUser', JSON.stringify(userCopy));
      setUser(userCopy);
      setUploadedBlogID(response.data.id);
      handleMessage('success', 'Blog Submitted!');
      setActiveStep(5);
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
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
      if (e.target.files[0].size / 1024 / 1024 > 2) {
        handleMessage('error', 'Maximum allowed file size is 2MB');
        return;
      }
    }

    setHeaderImage(e.target.files[0]);
    setHeaderImagePreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    setSearchFilter(searchRef.current.value);
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
              allPictures={allPictures}
              setAllPictures={setAllPictures}
              handleMessage={handleMessage}
            />
            <div className="new-blog-image-preview">
              {!headerImagePreview && (
                <div>
                  <label htmlFor="new-blog-file-input">
                    <input hidden id="new-blog-file-input" type="file" onChange={handleImageChange} />
                    <span id="new-blog-input-label-text">Choose Header Image</span>
                  </label>
                </div>
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
            <div>
              <div className="new-blog-textfield">
                <TextField
                  id="new-blog-title-textfield"
                  label="Blog Title"
                  variant="outlined"
                  value={title}
                  onChange={({ target }) => setTitle(target.value)}
                />
              </div>
              <div className="new-blog-textfield">
                <TextField
                  id="new-blog-description-textfield"
                  label="Blog Description"
                  multiline
                  rows={3}
                  value={description}
                  onChange={({ target }) => setDescription(target.value)}
                  variant="outlined"
                />
              </div>
            </div>
          </div>
          <div>
            <Button variant="contained" onClick={handleNext} id="new-blog-next-button">Next</Button>
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
            <Editor
              id="new-blog-editor"
              value={content}
              init={{
                menubar: true,
                paste_data_images: true,
                plugins: ['paste'],
              }}
              onEditorChange={handleBlogChange}
            />
          </div>
          <div className="new-blog-bottom-navigation">
            <Button variant="contained" onClick={handleBack} id="new-blog-back-button">Back</Button>
            <Button variant="contained" onClick={handleNext} id="new-blog-next-button">Next</Button>
          </div>
        </div>
      );
    case 2:
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
          <div className="location-select-wrapper">
            <div className="new-blog-selected-locations">
              <h3>Locations selected</h3>
              <table>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.city}>
                      <td>
                        {loc.city}
                        ,
                        {' '}
                        {loc.country}
                      </td>
                      <td>
                        <Button variant="contained" onClick={() => handleLocationRemove(loc)}>remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="location-select-form">
              <form onSubmit={handleCitySearch}>
                <input id="location-search-textfield" placeholder="Search for city..." type="text" ref={searchRef} />
                <Button variant="contained" id="new-blog-search-button" type="submit">search</Button>
              </form>
              <div className="new-blog-search-table-wrapper">

                <AddLocations
                  filter={searchFilter}
                  selectFunction={handleAddLocation}
                />
              </div>
            </div>
          </div>
          <div className="new-blog-bottom-navigation">
            <Button variant="contained" onClick={handleBack} id="new-blog-back-button">Back</Button>
            <Button variant="contained" onClick={handleNext} id="new-blog-next-button">Next</Button>
          </div>
        </div>
      );
    case 3:
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
          <Button variant="contained" id="new-blog-preview-button" onClick={() => setActiveStep(4)}>Preview Blog</Button>
          <div className="new-blog-bottom-navigation">
            <div>
              <Button variant="contained" onClick={handleBack} id="new-blog-back-button">Back</Button>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <NewBlogPreview
          title={title}
          description={description}
          headerImage={headerImagePreview}
          content={content}
          locations={locations}
          user={user}
          setActiveStep={setActiveStep}
          handleBlogSubmit={handleBlogSubmit}
        />
      );
    case 5:
      return (
        <div className="new-blog-main-container">
          <div className="new-blog-submitted-content">
            <h1>Blog Submitted!</h1>
            <Link to={`/blogs/${uploadedBlogID}`}>
              <Button variant="contained" id="new-blog-view-blog-button">View Blog</Button>
            </Link>
            <Button onClick={() => setActiveStep(0)} id="new-blog-another-blog-button">Create Another Blog</Button>
          </div>
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
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

const NewBlogPreview = ({
  title, description, headerImage, content, user, locations, setActiveStep, handleBlogSubmit,
}) => {
  const [showLocations, setShowLocations] = useState(false);
  const blogDate = DateTime.fromJSDate(new Date());

  return (
    <div className="main-blog-page-container">
      <div className="new-blog-preview-buttons">
        <Button variant="contained" id="new-blog-preview-submit-button" onClick={handleBlogSubmit}>Submit Blog</Button>
        <Button variant="contained" id="new-blog-preview-cancel-button" onClick={() => setActiveStep(3)}>Go Back</Button>
      </div>
      <Explore id="blog-location-toggle" onClick={() => setShowLocations(!showLocations)} />
      {showLocations
     && (
     <div className="blog-locations-container">
       <h3>Blog Locations</h3>
       {locations.length > 0
         ? (
           <table>
             <tbody>
               {locations.map((loc) => (
                 <tr key={loc.city}>
                   <td>
                     {loc.city}
                   </td>
                   <td>{loc.country}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         )
         : <p>No locations</p>}
       <button id="blog-locations-close-button" type="button" onClick={() => setShowLocations(false)}>X</button>
     </div>
     )}
      <Container maxWidth="md" className="blog-container">
        <div>
          <div style={{ textAlign: 'center' }}>
            <h1 id="blog-title">{title}</h1>
            <div>
              {description}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <div className="author-container">
              <div className="author-picture">
                <Avatar alt="author profile" src={user.avatar} />
              </div>
            </div>
            <div className="blog-info-container">
              <div className="author-username">
                <h3>{user.username}</h3>
              </div>
              <div className="blog-info-date">
                {blogDate.monthLong}
                {' '}
                {blogDate.day}
                {' '}
                {blogDate.year}
              </div>
            </div>
          </div>
          {headerImage
        && <img src={headerImage} alt="cover" width="1000px" />}

          {ReactHtmlParser(content)}
        </div>
        <div className="vote-container">
          <div>
            <StarBorder
              id="unvoted-star"
              fontSize="large"
            />
          </div>
          <div id="vote-count">
            0
            {' '}
          </div>
          <div id="comment-count">
            <ChatBubbleOutline id="blog-comments-icon" />
            0
          </div>
        </div>
      </Container>
    </div>
  );
};

NewBlogPreview.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  headerImage: PropTypes.string,
  content: PropTypes.string.isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  locations: PropTypes.instanceOf(Array).isRequired,
  setActiveStep: PropTypes.func.isRequired,
  handleBlogSubmit: PropTypes.func.isRequired,
};

NewBlogPreview.defaultProps = {
  headerImage: null,
};

export default NewBlog;
