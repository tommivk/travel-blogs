/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import IndexModal from './IndexModal';
import handPicture from '../images/hand.png';
import bgvideo from '../videos/background.mp4';
import '../styles/indexPage.css';
import imagePath from '../images/image-path';

const IndexPage = ({
  setUser, message, handleMessage, allUsers, setAllUsers,
}) => {
  const [modalOpen, setModalOpen] = useState({ open: false, modal: '' });
  const [mouseOnImage, setMouseOnImage] = useState(false);
  const openSignUpModal = () => {
    setModalOpen({ open: true, modal: 'signup' });
  };
  const openLoginModal = () => {
    setModalOpen({ open: true, modal: 'login' });
  };
  const closeModal = () => {
    setModalOpen({ open: false, modal: '' });
    setMouseOnImage(false);
  };

  return (
    <div className="index-page-main-container">
      <div className="indexpage-title">
        <h1>TravelBlogs</h1>
      </div>
      <div className="indexpage-login-link" onClick={openLoginModal}>
        <h1>Login</h1>
      </div>
      <div className={`video-container ${(mouseOnImage || modalOpen.open) && 'video-blur'}`}>
        <video loop autoPlay muted>
          <source src={bgvideo} type="video/mp4" />
        </video>
      </div>
      <div className={`svg-wrapper ${(mouseOnImage || modalOpen.open) && 'mouse-over'}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80vh"
          height="80vh"
          viewBox="0 0 837 1028"
          className="svg-content"
          preserveAspectRatio="xMidYMax meet"
        >
          <g className="svg-path">
            <path
              id="Selection"
              onMouseEnter={() => setMouseOnImage(true)}
              onMouseLeave={() => setMouseOnImage(false)}
              fill="none"
              stroke="none"
              d={imagePath}
            />
          </g>
          <image href={handPicture} />
        </svg>
      </div>
      {message.message !== '' && (
        <Alert
          style={{
            position: 'absolute',
            top: '7vh',
            left: '50%',
            transform: 'translate(-50%, 0)',
            zIndex: '9999',
          }}
          severity={message.type}
        >
          {message.message}
        </Alert>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
          zIndex: '999',
        }}
      >
        {modalOpen.open && (
          <IndexModal
            handleMessage={handleMessage}
            modalOpen={modalOpen}
            closeModal={closeModal}
            setUser={setUser}
            allUsers={allUsers}
            setAllUsers={setAllUsers}
          />
        )}
        {!modalOpen.open && (
        <Button
          id="indexpage-signup-button"
          onClick={openSignUpModal}
          onMouseOver={() => setMouseOnImage(true)}
          size="large"
          variant="contained"
          color="secondary"
        >
          Sign Up
        </Button>
        )}
      </div>

    </div>
  );
};

IndexPage.propTypes = {
  setUser: PropTypes.func.isRequired,
  message: PropTypes.instanceOf(Object).isRequired,
  handleMessage: PropTypes.func.isRequired,
  allUsers: PropTypes.instanceOf(Array).isRequired,
  setAllUsers: PropTypes.func.isRequired,
};

export default IndexPage;
