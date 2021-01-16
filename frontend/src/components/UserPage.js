/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import Modal from '@material-ui/core/Modal';
import Checkbox from '@material-ui/core/Checkbox';
import Edit from '@material-ui/icons/Edit';
import '../styles/userPage.css';

const UserPage = ({
  userMatch,
  user,
  allUsers,
  setAllUsers,
  allBlogs,
  setAllBlogs,
  setUser,
  storage,
}) => {
  const [userData, setUserData] = useState(userMatch);
  const [content, setContent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [subscribeBlogs, setsubscribeBlogs] = useState(false);
  const [subscribePictures, setSubscribePictures] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);

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
  };

  const handleBlogDelete = async (blog) => {
    try {
      const storageRef = storage.ref();
      const fbuser = firebase.auth().currentUser;
      const userID = fbuser.uid;

      if (blog.headerImageURL) {
        await storageRef.child(`/blogcovers/${userID}/${blog.headerImageID}`).delete();
      }

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
    } catch (error) {
      console.log(error);
    }
  };

  const updateUser = async (uploadedPictureURL) => {
    const newUserData = {};

    if (!uploadedPictureURL && newUsername === user.username) {
      handleCancelUpdate();
      return;
    }
    if (uploadedPictureURL) {
      newUserData.avatar = uploadedPictureURL;
    }
    if (newUsername !== user.username) {
      newUserData.username = newUsername;
    }

    try {
      const response = await axios.put(
        'http://localhost:8008/api/users',
        newUserData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const updatedUser = response.data;
      updatedUser.fbtoken = user.fbtoken;
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!image) {
      updateUser();
      return;
    }
    const fbuser = firebase.auth().currentUser;
    const userID = fbuser.uid;
    const uploadTask = storage
      .ref()
      .child(`/avatars/${userID}/${image.name}`)
      .put(image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is  ${progress} % done`);

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
          .then((downloadURL) => updateUser(downloadURL));
      },
    );
  };

  useEffect(() => {
    if (userMatch) {
      setUserData(userMatch);
      if (userMatch.id === user.id) {
        setIsUser(true);
      } else {
        setIsUser(false);
      }
    }
  }, [userMatch]);

  useEffect(() => {
    if (userData && user && userData.id !== user.id) {
      console.log(userData, user);
      setsubscribeBlogs(userData.blogSubscribers.includes(user.id));
      setSubscribePictures(userData.pictureSubscribers.includes(user.id));
    }
  }, [userData, modalOpen]);

  if (!userData) return null;

  const joinDate = DateTime.fromISO(userData.joinDate);

  const handleModalClose = () => {
    setModalOpen(false);
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="user-page-main-container">
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div className="subscribe-modal">
          <h2>
            Subscribe to
            {userData.username}
          </h2>
          <div>
            Blogs
            <Checkbox
              checked={subscribeBlogs}
              onChange={() => setsubscribeBlogs(!subscribeBlogs)}
            />
          </div>
          <div>
            Pictures
            <Checkbox
              checked={subscribePictures}
              onChange={() => setSubscribePictures(!subscribePictures)}
            />
          </div>
          <button type="button" onClick={handleSubscription}>OK</button>
        </div>
      </Modal>
      <div className="user-page-user-info">
        {isUser && (
          <div>
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
              {imagePreview || editUsername ? (
                <div className="userpage-update-buttons">
                  <button type="button" onClick={() => handleCancelUpdate()}>Cancel</button>
                  <button type="submit">Update</button>
                </div>
              ) : null}
            </form>
          </div>
        )}
        {!isUser && (
          <img src={userData.avatar} className="userpage-avatar-image" alt="" />
        )}
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

        {isUser && !editUsername && (
          <div
            onClick={() => setEditUsername(true)}
            className="username-edit-container"
          >
            <h1>{userData.username}</h1>
            <Edit id="username-edit-icon" />
          </div>
        )}
        {!isUser && <h1>{userData.username}</h1>}
        {!editUsername && !imagePreview && (
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
            <button
              type="button"
              id="userpage-subscribe-button"
              onClick={() => setModalOpen(true)}
            >
              {isSubscribed() === true
                ? 'Modify Your Subscription'
                : 'Subscribe'}
            </button>
          </div>
        )}
      </div>
      <button type="button" onClick={() => setContent(0)}>Pictures</button>
      <button type="button" onClick={() => setContent(1)}>Blogs</button>
      {content === 0 && (
        <div>
          {isUser
            ? 'My' : `${userData.username}'s` }
            {' '}
          Uploaded Pictures
          <div>
            {userData.pictures.map((p) => (
              <Link to={`/gallery/${p.id}`}>
                <img src={p.imgURL} alt="" />
              </Link>
            ))}
          </div>
        </div>
      )}
      {content === 1 && (
        <div>
          {isUser ? 'My' : `${userData.username}'s`}
          {' '}
          Blogs
          <div>
            {userData.blogs.length === 0 ? (
              <div>No blogs created yet</div>
            ) : (
              userData.blogs.map((b) => (
                <div>
                  <Link to={`/blogs/${b.id}`}>{b.title}</Link>
                  <button type="button" onClick={() => handleBlogDelete(b)}>Delete</button>
                </div>
              ))
            )}
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
  storage: PropTypes.instanceOf(Object).isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  setAllBlogs: PropTypes.func.isRequired,
};

export default UserPage;
