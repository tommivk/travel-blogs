/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Link, useHistory } from 'react-router-dom';
import { DateTime } from 'luxon';
import Modal from '@material-ui/core/Modal';
import Checkbox from '@material-ui/core/Checkbox';
import Edit from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';
import Star from '@material-ui/icons/Star';
import Sms from '@material-ui/icons/Sms';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { CircularProgress } from '@material-ui/core';
import ConfirmDialog from './ConfirmDialog';
import '../styles/userPage.css';

const UserPage = ({
  userMatch,
  user,
  allUsers,
  setAllUsers,
  allBlogs,
  setAllBlogs,
  allPictures,
  setAllPictures,
  setUser,
  handleMessage,
}) => {
  const [userData, setUserData] = useState(userMatch);
  const [content, setContent] = useState('blogs');
  const [modalOpen, setModalOpen] = useState(false);
  const [subscribeBlogs, setsubscribeBlogs] = useState(true);
  const [subscribePictures, setSubscribePictures] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogText, setDialogText] = useState('');
  const [dialogFunction, setDialogFunction] = useState(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const history = useHistory();
  useEffect(() => {
    if (userMatch) {
      if (userMatch.id === user.id) {
        setIsUser(true);
        setUserData(user);
        document.title = 'My Page | Travelblogs';
      } else {
        setIsUser(false);
        setUserData(userMatch);
        document.title = `${userMatch.username} | Travelblogs`;
      }
    }
  }, [userMatch]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      URL.revokeObjectURL(e.target.files[0]);
    }
  };

  const handleCancelUpdate = () => {
    setImagePreview(null);
    setImage(null);
    setEditUsername(false);
    setNewUsername(user.username);
    setEditProfile(false);
  };

  const handlePictureDelete = async (picture) => {
    try {
      await axios.delete(`http://localhost:8008/api/pictures/${picture.id}`, { headers: { Authorization: `Bearer ${user.token}` } });

      const newUser = { ...user, pictures: user.pictures.filter((pic) => pic.id !== picture.id) };
      setUser(newUser);
      setUserData(newUser);
      const newUsers = allUsers.map((u) => (u.id === user.id ? newUser : u));
      setAllUsers(newUsers);
      const newPictures = allPictures.filter((p) => p.id !== picture.id);
      setAllPictures(newPictures);
      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(newUser),
      );
      handleMessage('success', 'Picture deleted');
    } catch (error) {
      handleMessage('error', error.message);
    }
  };

  const handleBlogDelete = async (blog) => {
    try {
      await axios.delete(`http://localhost:8008/api/blogs/${blog.id}`, { headers: { Authorization: `Bearer ${user.token}` } });

      const newUser = { ...user, blogs: user.blogs.filter((b) => b.id !== blog.id) };
      setUser(newUser);
      setUserData(newUser);
      const newUsers = allUsers.map((u) => (u.id === user.id ? newUser : u));
      setAllUsers(newUsers);

      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(newUser),
      );

      const newBlogs = allBlogs.filter((b) => b.id !== blog.id);
      setAllBlogs(newBlogs);
      handleMessage('success', 'Blog deleted');
    } catch (error) {
      handleMessage('error', error.message);
    }
  };

  const handleUserDelete = async () => {
    try {
      axios.delete(`http://localhost:8008/api/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      handleMessage('success', 'User deleted');
      setUser(null);
      history.push('/');
      localStorage.removeItem('loggedTravelBlogUser');
    } catch (error) {
      handleMessage('error', error.message);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();

    if (!image && newUsername === user.username) {
      handleCancelUpdate();
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    if (newUsername !== user.username) {
      formData.append('username', newUsername);
    }

    try {
      const response = await axios.put(
        `http://localhost:8008/api/users/${user.id}`,
        formData,
        {
          onUploadProgress: () => setUploadInProgress(true),
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      setUploadInProgress(false);
      const updatedUser = response.data;
      setUser(updatedUser);
      setUserData(response.data);
      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(response.data),
      );
      handleCancelUpdate();
      setNewUsername(response.data.username);

      const newUsers = allUsers.map((u) => (u.id === user.id ? response.data : u));
      setAllUsers(newUsers);
      handleMessage('success', 'Profile updated');
    } catch (error) {
      handleMessage('error', error.message);
      console.log(error);
    }
  };

  const isSubscribed = () => {
    if (
      userData.id !== user.id
      && (userData.blogSubscribers.includes(user.id)
      || userData.pictureSubscribers.includes(user.id))
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (userData && user && userData.id !== user.id) {
      if (isSubscribed() === true) {
        setsubscribeBlogs(userData.blogSubscribers.includes(user.id));
        setSubscribePictures(userData.pictureSubscribers.includes(user.id));
      }
    }
  }, [userData, modalOpen]);

  if (!userData) return null;

  const joinDate = DateTime.fromISO(userData.joinDate);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSubscription = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8008/api/users/${userData.id}/subscription`,
        {
          blogSubscription: subscribeBlogs,
          pictureSubscription: subscribePictures,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      setUserData(response.data);
      const newUsers = allUsers.map((u) => (u.id === response.data.id ? response.data : u));
      setAllUsers(newUsers);
      setModalOpen(false);
      const subMessage = isSubscribed() ? 'Subsciption modified' : 'Subscription added';
      handleMessage('success', subMessage);
    } catch (error) {
      handleMessage('error', error.response.data.message);
      console.log(error);
    }
  };

  const handleDialogOpen = (title, text, func) => {
    setDialogTitle(title);
    setDialogText(text);
    setDialogFunction(() => func);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogTitle('');
    setDialogText('');
    setDialogFunction(null);
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    try {
      dialogFunction().then(() => {
        setDialogTitle('');
        setDialogText('');
        setDialogFunction(null);
        setDialogOpen(false);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRadioChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <div className="user-page-main-container">
      <ConfirmDialog
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        dialogOpen={dialogOpen}
        handleDialogConfirm={handleDialogConfirm}
        handleDialogClose={handleDialogClose}
      />
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div className="subscribe-modal">
          <div className="subscribe-modal-wrapper">
            <h2>
              {isSubscribed() === true ? 'Modify Your Subscription To' : 'Subscribe To'}
              {' '}
              {userData.username}
            </h2>
            <table>
              <tbody>
                <tr>
                  <td>
                    <Checkbox
                      className="subscribe-modal-checkbox"
                      checked={subscribeBlogs}
                      onChange={() => setsubscribeBlogs(!subscribeBlogs)}
                    />
                  </td>
                  <td>
                    Blogs
                  </td>
                </tr>
                <tr>
                  <td>
                    <Checkbox
                      className="subscribe-modal-checkbox"
                      checked={subscribePictures}
                      onChange={() => setSubscribePictures(!subscribePictures)}
                    />
                  </td>
                  <td>
                    Pictures
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="subscription-modal-buttons">
              <Button variant="contained" id="subscription-submit-button" type="button" onClick={handleSubscription}>OK</Button>
            </div>
            <button type="button" onClick={handleModalClose} id="subscription-cancel-button">X</button>
          </div>
        </div>
      </Modal>
      <div className="user-page-user-info">
        {isUser && editProfile && (
          <div>
            <DeleteForever onClick={() => handleDialogOpen('Delete user?', 'All your posted Blogs, Pictures and Comments will be deleted forever', () => handleUserDelete())} id="user-delete-icon" />
            <form onSubmit={handleUserUpdate}>
              <input
                type="file"
                id="avatar-upload-button"
                hidden
                onChange={handleImageChange}
              />
              <label htmlFor="avatar-upload-button">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="userpage-avatar-image userpage-avatar-preview"
                    alt="preview"
                  />
                ) : (
                  <div className="userpage-avatar-edit-container">
                    <img
                      src={userData.avatar}
                      className="userpage-avatar-image"
                      alt="avatar"
                    />
                    <Edit id="userpage-avatar-edit-icon" />
                  </div>
                )}
              </label>
              { editProfile && (
                <div className="userpage-update-buttons">
                  {!uploadInProgress
                  && <Button id="profile-update-cancel-button" type="button" onClick={() => handleCancelUpdate()}>Cancel</Button>}
                  {(imagePreview || newUsername !== user.username)
                  && uploadInProgress
                    ? <Button id="profile-update-submit-button" variant="contained" type="button"><CircularProgress id="profile-update-progress-circle" /></Button>
                    : <Button id="profile-update-submit-button" variant="contained" type="submit">Update</Button>}
                </div>
              ) }
            </form>
          </div>
        )}

        {isUser && !editProfile && (
          <div>
            <img src={userData.avatar} className="userpage-avatar-image" alt="" />
            <div><Button id="edit-profile-button" variant="contained" onClick={() => setEditProfile(true)}>Edit My Profile</Button></div>
          </div>
        )}

        {!isUser && <img src={userData.avatar} className="userpage-avatar-image" alt="" />}

        <div className="username-change-input">
          {editUsername && isUser ? (
            <input
              type="text"
              autoFocus
              value={newUsername}
              onChange={({ target }) => setNewUsername(target.value)}
            />
          ) : null}
        </div>

        {isUser && editProfile && !editUsername ? (
          <div
            onClick={() => setEditUsername(true)}
            className="username-edit-container"
          >
            <h1>{userData.username}</h1>
            <Edit id="username-edit-icon" />
          </div>
        ) : null}

        {!editProfile && <h1>{userData.username}</h1>}

        {!editProfile && (
          <table className="userpage-user-info-table">
            <tbody>
              <tr>
                <td>Member Since:</td>
                <td>
                  {joinDate.monthLong}
                  {' '}
                  {joinDate.weekYear}
                </td>
              </tr>
              <tr>
                <td>Created Blogs: </td>
                <td>{userData.blogs.length}</td>
              </tr>
              <tr>
                <td>Uploaded Pictures:</td>
                <td>{userData.pictures.length}</td>
              </tr>
            </tbody>
          </table>
        )}
        {!isUser && (
          <div>
            <Button
              variant="contained"
              type="button"
              id="userpage-subscribe-button"
              onClick={() => setModalOpen(true)}
            >
              {isSubscribed() === true
                ? 'Modify Your Subscription'
                : 'Subscribe'}
            </Button>
          </div>
        )}
      </div>
      <FormControl>
        <RadioGroup row aria-label="position" defaultValue={content} onChange={handleRadioChange}>
          <FormControlLabel value="blogs" control={<Radio />} label="Blogs" />
          <FormControlLabel value="pictures" control={<Radio />} label="Pictures" />
        </RadioGroup>
      </FormControl>
      {content === 'pictures' && (
        <div>
          <div className="userpage-content-title">
            <h2>
              {isUser
                ? 'My' : `${userData.username}'s` }
              {' '}
              Uploaded Pictures
            </h2>
          </div>
          <div className="userpage-pictures-container">
            {userData.pictures.length === 0
              ? <p>No pictures uploaded yet</p>
              : (
                userData.pictures.map((pic) => (
                  <div className="userpage-pictures-wrapper">
                    <Link
                      to={`/gallery/${pic.id}`}
                      key={pic.id}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="gallery-card">
                        <img src={pic.imgURL} alt="" />
                        <h4
                          style={{
                            marginTop: '2px',
                            marginBottom: '5px',
                            textAlign: 'center',
                            color: '#FFFFFF',
                          }}
                        >
                          {pic.title}
                        </h4>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            width: '100%',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              marginBottom: '3px',
                            }}
                          >
                            <div
                              className="tooltip"
                              style={{
                                display: 'flex',
                                color: '#6c717a',
                                marginLeft: '4px',
                              }}
                            >
                              <span className="tooltip-message">Points</span>
                              <ArrowUpward />
                              <div
                                style={{ alignSelf: 'center', marginLeft: '3px' }}
                              >
                                {pic.voteResult}
                              </div>
                            </div>
                            <div
                              className="tooltip"
                              style={{ color: '#6c717a', marginRight: '4px' }}
                            >
                              <span className="tooltip-message">Comments</span>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Sms />
                                {pic.comments.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {isUser && <Button variant="contained" id="userpage-picture-delete-button" type="button" onClick={() => handleDialogOpen('Delete picture?', '', () => handlePictureDelete(pic))}>delete</Button>}
                  </div>
                ))
              )}
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
          </div>
        </div>
      )}
      {content === 'blogs' && (
        <div>
          <div className="userpage-content-title">
            <h2>
              {isUser ? 'My' : `${userData.username}'s`}
              {' '}
              Blogs
            </h2>
          </div>
          <div className="userpage-blogs-container">
            {userData.blogs.length === 0 ? (
              <p>No blogs created yet</p>
            ) : (
              userData.blogs.map((blog) => (
                <div className="userpage-blog-card-wrapper">
                  <Link id="main-blog-link" to={`/blogs/${blog.id}`} key={blog.id}>
                    <div className="blog-card">
                      <div className="blog-image">
                        {blog.headerImageURL && (
                          <img src={blog.headerImageURL} alt="blog-header" width="300px" />
                        )}
                      </div>
                      <div className="blog-card-right">
                        <div className="blog-header">
                          <div className="blog-author-info">
                            <div>
                              <img src={blog.author.avatar} alt="avatar" />
                            </div>
                            <div>
                              By
                              {' '}
                              {blog.author.username}
                            </div>
                          </div>
                          <div
                            className={`blog-title ${
                              blog.title.length > 22 && 'long-blog-title'
                            }`}
                          >
                            <h1>{blog.title.toUpperCase()}</h1>
                          </div>
                          <div className="blog-description">
                            <p>{blog.description}</p>
                          </div>
                        </div>
                        <div className="blog-star">
                          <div className="tooltip">
                            <span className="tooltip-message">Stars</span>
                            <Star id="star" fontSize="default" />
                          </div>
                          <div id="blog-stars-count">{blog.stars.length}</div>
                        </div>
                        <div className="blog-date">
                          {DateTime.fromISO(blog.date).monthShort}
                          {' '}
                          {DateTime.fromISO(blog.date).day}
                          {' '}
                          {DateTime.fromISO(blog.date).year}
                        </div>
                      </div>
                    </div>
                  </Link>
                  {isUser
                    && <Button variant="contained" id="userpage-blog-delete-button" type="button" onClick={() => handleDialogOpen('Delete blog?', '', () => handleBlogDelete(blog))}>Delete Blog</Button>}
                </div>
              ))
            )}
            <div className="blog-pseudo-element" />
            <div className="blog-pseudo-element" />
            <div className="blog-pseudo-element" />
          </div>
        </div>
      )}
    </div>
  );
};

UserPage.defaultProps = {
  userMatch: null,
};

UserPage.propTypes = {
  userMatch: PropTypes.instanceOf(Object),
  user: PropTypes.instanceOf(Object).isRequired,
  allUsers: PropTypes.instanceOf(Array).isRequired,
  setAllUsers: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  setAllBlogs: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default UserPage;
