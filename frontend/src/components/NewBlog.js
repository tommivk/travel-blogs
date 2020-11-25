import React, { useState } from 'react'
import ImageUploadModal from './ImageUploadModal'
import AddLocations from './AddLocations'
import axios from 'axios'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Create from '@material-ui/icons/Create'
import { Editor } from '@tinymce/tinymce-react'
import EditLocation from '@material-ui/icons/EditLocation'
import Subject from '@material-ui/icons/Subject'
import Visibility from '@material-ui/icons/Visibility'
import { Button, TextField, Modal } from '@material-ui/core'
import '../styles/newBlog.css'

const UserImagesModal = ({
  open,
  closeModal,
  user,
  setUploadModalOpen,
  setHeaderImageURL,
}) => {
  console.log(user)
  const handleImagePick = (image) => {
    setHeaderImageURL(image)
    closeModal()
  }
  return (
    <Modal open={open} onClose={closeModal}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%)`,
          width: '60vw',
          height: '55vh',
          backgroundColor: '#33302a',
          color: 'white',
        }}
      >
        <div
          className='user-image-modal-content'
          style={{ height: '100%', width: '100%' }}
        >
          <h2>My Images</h2>
          <div className='user-image-modal-pictures'>
            {user.pictures.map((pic) => (
              <img
                onClick={() => handleImagePick(pic.imgURL)}
                src={pic.imgURL}
              ></img>
            ))}
          </div>
          <Button
            color='primary'
            variant='contained'
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Images
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const getSteps = () => {
  return ['Set Title', 'Write Content', 'Add Locations', 'Preview And Submit']
}

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
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [headerImageURL, setHeaderImageURL] = useState(null)
  const [locations, setLocations] = useState([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [userImageModalOpen, setUserImageModalOpen] = useState(false)
  const steps = getSteps()

  const handleNext = () => {
    setActiveStep((prevState) => prevState + 1)
  }

  const handleBack = () => {
    setActiveStep((prevState) => prevState - 1)
  }

  const handleBlogChange = (content, editor) => {
    setContent(content)
  }
  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }

  const closeUserImageModal = () => {
    setUserImageModalOpen(false)
  }

  const handleBlogSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'http://localhost:8008/api/blogs',
        {
          username: user.username,
          content: content,
          title: title,
          description: description,
          headerImageURL: headerImageURL,
          locations: locations,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      setContent('')
      setTitle('')
      setAllBlogs(allBlogs.concat(response.data))
      handleMessage('success', 'Blog Submitted!')
    } catch (error) {
      handleMessage('error', error.message)
      console.log(error.message)
    }
    setActiveStep(4)
  }

  const stepperIcons = (props) => {
    const icons = {
      1: <Subject />,
      2: <Create />,
      3: <EditLocation />,
      4: <Visibility />,
    }
    return <div>{icons[String(props.icon)]}</div>
  }

  switch (activeStep) {
    case 0:
      return (
        <div className='new-blog-main-container'>
          <div className='new-blog-stepper-container'>
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
          <div className='new-blog-info-container'>
            <ImageUploadModal
              uploadModalOpen={uploadModalOpen}
              closeModal={closeUploadModal}
              user={user}
              setUser={setUser}
              storage={storage}
              allPictures={allPictures}
              setAllPictures={setAllPictures}
              handleMessage={handleMessage}
            ></ImageUploadModal>
            {/* <div>
              <Button onClick={() => setUploadModalOpen(true)}>
                upload images
              </Button>
            </div> */}
            <div className='new-blog-textfield'>
              <TextField
                label='Title'
                variant='outlined'
                onChange={({ target }) => setTitle(target.value)}
              ></TextField>
            </div>
            <div className='new-blog-textfield'>
              <TextField
                label='Blog Description'
                onChange={({ target }) => setDescription(target.value)}
                variant='outlined'
              ></TextField>
            </div>
            <div>
              <Button onClick={() => setUserImageModalOpen(true)}>
                Choose Cover Image
              </Button>
              {headerImageURL && (
                <img src={headerImageURL} height='200px'></img>
              )}
              <UserImagesModal
                closeModal={closeUserImageModal}
                open={userImageModalOpen}
                user={user}
                setUploadModalOpen={setUploadModalOpen}
                setHeaderImageURL={setHeaderImageURL}
              ></UserImagesModal>
              {/* <TextField
              onChange={({ target }) => setHeaderImageURL(target.value)}
              variant='outlined'
              style={{ height: '200px', width: '200px' }}
            ></TextField> */}
            </div>
          </div>
          <div className='new-blog-next-button'>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    case 1:
      return (
        <div className='new-blog-main-container'>
          <div>
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

            <Editor
              value={content}
              init={{
                height: 600,
                menubar: true,
                paste_data_images: true,
                plugins: ['paste'],
              }}
              onEditorChange={handleBlogChange}
            ></Editor>
            <div style={{ float: 'left' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        </div>
      )
    case 2:
      return (
        <div className='new-blog-main-container'>
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
          <AddLocations
            locations={locations}
            setLocations={setLocations}
          ></AddLocations>
          <div style={{ float: 'left' }}>
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </div>
      )
    case 3:
      return (
        <div className='new-blog-main-container'>
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
          <div style={{ float: 'left' }}>
            <Button onClick={handleBack}>Back</Button>
          </div>
          <form onSubmit={handleBlogSubmit}>
            <Button style={{ float: 'right' }} type='submit'>
              Submit
            </Button>
          </form>
        </div>
      )
    case 4:
      return (
        <div className='new-blog-main-container'>
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
          Blog submitted!
        </div>
      )
    default:
      return null
  }
}

export default NewBlog
