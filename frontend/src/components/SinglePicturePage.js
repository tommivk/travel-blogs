import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Fullscreen from '@material-ui/icons/Fullscreen';
import { DateTime } from 'luxon';
import Explore from '@material-ui/icons/Explore';
import ExploreOff from '@material-ui/icons/ExploreOff';
import Image from '@material-ui/icons/Image';
import { Language } from '@material-ui/icons';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import calculateDateDiff from '../utils/calculateDateDiff';
import ConfirmDialog from './ConfirmDialog';
import '../styles/singlePicturePage.css';

const API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;

const CommentForm = ({
  picture,
  user,
  setPicture,
  allPictures,
  setAllPictures,
  handleMessage,
}) => {
  const [comment, setComment] = useState('');

  const inputRef = useRef(null);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const newComment = {
      content: comment,
    };
    try {
      const response = await axios.post(
        `/api/pictures/${picture.id}/comment`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      setPicture(response.data);
      setComment('');

      const filteredPictures = allPictures
        .map((pic) => (pic.id === picture.id ? response.data : pic));

      setAllPictures(filteredPictures);

      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
  };
  return (
    <div>
      <form onSubmit={handleCommentSubmit}>
        <div className="comment-input-container">
          <input
            className="comment-input-field"
            type="text"
            ref={inputRef}
            value={comment}
            placeholder="Add new comment..."
            onChange={({ target }) => setComment(target.value)}
          />
          <button className="comment-submit-button" type="submit">Send</button>
        </div>
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  picture: PropTypes.instanceOf(Object).isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  setPicture: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

const SinglePicturePage = ({
  user,
  picture,
  allPictures,
  setPicture,
  filteredPictures,
  setFilteredPictures,
  setAllPictures,
  handleMessage,
}) => {
  const [pictures, setPictures] = useState(null);
  const [mapImage, setMapImage] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogText, setDialogText] = useState('');
  const [dialogFunction, setDialogFunction] = useState(null);
  const pictureHandle = useFullScreenHandle();

  useEffect(() => {
    if (filteredPictures.pictures) {
      setPictures(filteredPictures.pictures);
    } else {
      setPictures(allPictures);
    }
  }, [allPictures]);

  useEffect(async () => {
    if (picture && picture.title) {
      document.title = `${picture.title} | TravelBlogs`;
    }

    setShowMap(false);

    if (picture && picture.location.lat && picture.location.lng) {
      const lat = picture.location.lat.toFixed(6);
      const lng = picture.location.lng.toFixed(6);
      setMapImage(
        `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=11&size=700x400&markers=color:red|${lat},${lng}&key=${API_KEY}`,
      );
    } else {
      setMapImage(null);
    }
  }, [picture]);

  if (!picture || !pictures) return null;

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
      handleMessage('error', 'Something went wrong');
    }
  };

  const handleFilterRemove = () => {
    setPictures(allPictures);
    setFilteredPictures({ pictures: null, filter: null });
  };

  const handleVote = async (direction) => {
    try {
      const response = await axios.post(
        `/api/pictures/${picture.id}/vote`,
        { dir: direction },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      setPicture(response.data);

      const filteredPics = await allPictures
        .map((pic) => (pic.id === picture.id ? response.data : pic));

      setAllPictures(filteredPics);
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
  };

  const handleVoteDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/pictures/${picture.id}/vote`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      setPicture(response.data);
      const filteredPics = await allPictures
        .map((pic) => (pic.id === picture.id ? response.data : pic));

      setAllPictures(filteredPics);
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
  };

  const handleCommentDelete = async (pictureId, commentId) => {
    try {
      const response = await axios.delete(`/api/pictures/${pictureId}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setPicture(response.data);
      setAllPictures(allPictures.map((p) => (p.id === pictureId ? response.data : p)));
      handleMessage('success', 'Comment Deleted');
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
  };

  const userVote = picture.votes.find(
    (vote) => vote.user.username === user.username,
  );

  const pictureIndex = pictures.findIndex((pic) => pic.id === picture.id);

  return (
    <div
      style={{
        minHeight: '94vh',
        maxHeight: '94vh',
        width: '100%',
        backgroundColor: '#191e36',
        position: 'relative',
        overflowY: 'scroll',
        overflowX: 'hidden',
        display: 'flex',
        justifyContent: 'space-evenly',
      }}
    >
      <ConfirmDialog
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        dialogOpen={dialogOpen}
        handleDialogConfirm={handleDialogConfirm}
        handleDialogClose={handleDialogClose}
      />
      <div className="picture-info-container">
        <h2>Uploaded by</h2>
        <img src={picture.user.avatar} alt="avatar" />
        <div className="picture-info-username">
          <Link to={`/users/${picture.user.id}`}>
            <div className="tooltip">
              <span className="tooltip-message">View Profile</span>
              <h2>{picture.user.username}</h2>
            </div>
          </Link>
        </div>
        <div>
          {DateTime.fromISO(picture.date).monthShort}
          {' '}
          {DateTime.fromISO(picture.date).day}
          {' '}
          {DateTime.fromISO(picture.date).year}
        </div>
      </div>
      <div className="picture-comment-container">
        <div className="picture-container-wrapper">

          <div className="picture-vote-container">
            <div className="vote-container-element">
              {userVote && userVote.dir === 1 ? (
                <ArrowUpward
                  className="picture-vote-arrow"
                  onClick={() => handleVoteDelete()}
                />
              ) : null}

              {(userVote && userVote.dir === -1)
               && <div className="vote-arrow-placeholder" />}

              {!userVote && (
              <ArrowUpward
                className="picture-vote-arrow"
                onClick={() => handleVote(1)}
              />
              )}
            </div>
            <div className="vote-container-element">{picture.voteResult}</div>
            <div className="vote-container-element">
              {userVote && userVote.dir === -1 ? (
                <ArrowDownward
                  className="picture-vote-arrow"
                  onClick={() => handleVoteDelete()}
                />
              ) : null}

              {(userVote && userVote.dir === 1)
               && <div className="vote-arrow-placeholder" />}

              {!userVote && (
              <ArrowDownward
                className="picture-vote-arrow"
                onClick={() => handleVote(-1)}
              />
              )}
            </div>
          </div>

          <div className="picture-container">
            <div className="picture-top-section">
              <div className="pictures-nav-button prev-button">
                {pictureIndex - 1 >= 0 && (
                <Link to={`/gallery/${pictures[pictureIndex - 1].id}`}>
                  <Button color="primary" variant="contained">
                    Previous
                  </Button>
                </Link>
                )}
              </div>

              <div className="picture-title">
                <h2>
                  {picture.title}
                </h2>
              </div>

              <div className="pictures-nav-button next-button">
                {pictures.length > pictureIndex + 1 && (
                <Link to={`/gallery/${pictures[pictureIndex + 1].id}`}>
                  <Button color="primary" variant="contained">
                    Next
                  </Button>
                </Link>
                )}
              </div>
            </div>

            {showMap ? (
              <div>
                <img src={mapImage} width="100%" height="auto" alt="map" />
                <div className="picture-location-info">
                  {picture.location.city && picture.location.city }
                  {' '}
                  {picture.location.country && picture.location.country}
                  <Link
                    to={`/explore/?lat=${picture.location.lat}&lng=${picture.location.lng}`}
                  >
                    <div style={{ width: 'fit-content' }}>
                      <div className="tooltip">
                        <span className="tooltip-message">Show On Map</span>
                        <Language id="picture-location-info-map-icon" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img src={picture.imgURL} width="100%" alt="" />
                <div className="tooltip" style={{ alignSelf: 'flex-end' }}>
                  <span className="tooltip-message">View In Fullscreen</span>
                  <Fullscreen
                    id="picture-fullscreen-button"
                    onClick={pictureHandle.enter}
                  />
                </div>
              </div>
            )}
          </div>

          {mapImage && !showMap && (
          <div className="image-toggle-button">
            <div className="tooltip">
              <span className="tooltip-message">Show Location</span>
              <Explore
                fontSize="large"
                onClick={() => setShowMap(true)}
              />
            </div>
          </div>
          )}
          {showMap && (
          <div className="image-toggle-button">
            <div className="tooltip">
              <span className="tooltip-message">Show Picture</span>

              <Image fontSize="large" onClick={() => setShowMap(false)} />
            </div>
          </div>
          )}

          {!mapImage && (
          <div className="image-toggle-button" style={{ cursor: 'default' }}>
            <div className="tooltip">
              <span className="tooltip-message">No Location Specified</span>
              <ExploreOff fontSize="large" />
            </div>
          </div>
          )}
        </div>

        <div className="comment-container">
          <CommentForm
            user={user}
            picture={picture}
            setPicture={setPicture}
            allPictures={allPictures}
            setAllPictures={setAllPictures}
            handleMessage={handleMessage}
          />
          <ul>
            {picture.comments.map((comment) => (
              <li key={comment.id}>
                <div className="comment">
                  <div className="comment-author">
                    <img src={comment.user.avatar} alt="avatar" />
                    <Link to={`/users/${comment.user.id}`}>
                      {comment.user.username}
                    </Link>
                    <div className="comment-date">
                      {calculateDateDiff(comment.date)}
                    </div>
                  </div>
                  <div className="comment-content">
                    <p>{comment.content}</p>
                    {comment.user.id === user.id && <button type="button" className="comment-delete-button" onClick={() => handleDialogOpen('Delete Comment?', '', () => handleCommentDelete(picture.id, comment.id))}>Delete comment</button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <FullScreen handle={pictureHandle} style={{ position: 'absolute' }}>
          <div className="fullscreen-image">
            <img src={picture.imgURL} alt="" />
          </div>
        </FullScreen>
      </div>
      <div className="picture-list-container">
        <div className="picture-list-top">
          {filteredPictures.filter ? (
            <div>
              <h4>
                Pictures from
                {' '}
                <div className="golden-text picture-city-filter">
                  {filteredPictures.filter}
                </div>
                {' '}
              </h4>
              <Button type="button" id="picture-list-show-all-button" onClick={handleFilterRemove}>Show All Pictures</Button>
            </div>
          ) : (
            <h4>
              All Pictures
            </h4>
          )}
        </div>
        <div className="picture-list-flex-box">
          {pictures.map((pic) => (
            <div className="picture-list-picture-box" key={pic.id}>
              {pic.id === picture.id ? (
                <div className="picture-list-active-image">
                  <img src={pic.imgURL} alt="" />
                </div>
              ) : (
                <Link to={`/gallery/${pic.id}`}>
                  <div>
                    <img src={pic.imgURL} alt="" />
                  </div>
                </Link>
              )}
            </div>
          ))}
          <div className="picture-list-pseudo-element" />
        </div>
      </div>
    </div>
  );
};

SinglePicturePage.defaultProps = {
  picture: null,
};

SinglePicturePage.propTypes = {
  picture: PropTypes.instanceOf(Object),
  user: PropTypes.instanceOf(Object).isRequired,
  setPicture: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  filteredPictures: PropTypes.instanceOf(Object).isRequired,
  setFilteredPictures: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default SinglePicturePage;
