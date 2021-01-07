import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Fullscreen from '@material-ui/icons/Fullscreen';
import Explore from '@material-ui/icons/Explore';
import ExploreOff from '@material-ui/icons/ExploreOff';
import Image from '@material-ui/icons/Image';
import { Language } from '@material-ui/icons';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import calculateDateDiff from '../utils/calculateDateDiff';
import '../styles/singlePicturePage.css';

const API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
// const GEO_API_KEY = process.env.REACT_APP_GEOCODE_API_KEY;

const CommentForm = ({
  picture,
  user,
  setPicture,
  allPictures,
  setAllPictures,
}) => {
  const [comment, setComment] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const newComment = {
      content: comment,
    };
    try {
      const response = await axios.post(
        `http://localhost:8008/api/pictures/${picture.id}/comment`,
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
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={comment}
          onChange={({ target }) => setComment(target.value)}
        />
        <button type="submit">Send</button>
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
};

const SinglePicturePage = ({
  user,
  picture,
  allPictures,
  setPicture,
  filteredPictures,
  setFilteredPictures,
  setAllPictures,
}) => {
  const [pictures, setPictures] = useState(null);
  const [mapImage, setMapImage] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const pictureHandle = useFullScreenHandle();

  useEffect(() => {
    if (filteredPictures.pictures) {
      setPictures(filteredPictures.pictures);
    } else {
      setPictures(allPictures);
    }
  }, [allPictures]);

  useEffect(async () => {
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

  const handleFilterRemove = () => {
    setPictures(allPictures);
    setFilteredPictures({ pictures: null, filter: null });
  };

  const handleVote = async (direction) => {
    try {
      const response = await axios.put(
        `http://localhost:8008/api/pictures/${picture.id}/vote`,
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
      console.log(error.message);
    }
  };

  const handleVoteDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8008/api/pictures/${picture.id}/vote`,
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
      console.log(error.message);
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
        backgroundColor: '#191e36',
        position: 'relative',
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      <div className="picture-comment-container">
        <div
          style={{
            backgroundColor: '#231A03',
            paddingTop: '10px',
            paddingRight: '10px',
            paddingLeft: '10px',
            color: 'white',
            marginTop: '30px',
            height: 'fit-content',
          }}
        >
          <div
            style={{
              width: '700px',
              display: 'flex',
              height: '40px',
              justifyContent: 'space-between',
              marginBottom: '5px',
            }}
          >
            <div style={{ justifySelf: 'center' }}>
              {pictureIndex - 1 >= 0 && (
                <Link to={`/gallery/${pictures[pictureIndex - 1].id}`}>
                  <Button color="primary" variant="contained">
                    Previous
                  </Button>
                </Link>
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: '0',
                  position: 'absolute',
                  right: '50%',
                  transform: 'translate(50%,0%)',
                }}
              >
                {picture.title}
              </h2>
            </div>

            <div style={{ justifySelf: 'center' }}>
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
              <img src={mapImage} width="700px" height="400px" alt="map" />
              {picture.location.city && <p>{picture.location.city}</p>}
              {picture.location.country && <p>{picture.location.country}</p>}
              <Link
                to={`/explore/?lat=${picture.location.lat}&lng=${picture.location.lng}`}
              >
                <div style={{ width: 'fit-content' }}>
                  <div className="tooltip">
                    <span className="tooltip-message">Show On Map</span>
                    <Language />
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <img src={picture.imgURL} width="700px" alt="" />
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

        <div className="comment-container">
          <CommentForm
            user={user}
            picture={picture}
            setPicture={setPicture}
            allPictures={allPictures}
            setAllPictures={setAllPictures}
          />
          <ul>
            {picture.comments.map((comment) => (
              <li key={comment.id}>
                <div className="picture-comment">
                  <div className="picture-comment-author">
                    <img src={comment.user.avatar} alt="avatar" />
                    {comment.user.username}
                    <div className="picture-comment-date">
                      {calculateDateDiff(comment.date)}
                    </div>
                  </div>
                  <div className="picture-comment-content">
                    {comment.content}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
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

      <div
        style={{
          position: 'absolute',
          top: '25%',
          color: 'white',
          left: '26%',
          width: '3%',
          height: '12%',
          backgroundColor: '#231A03',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <div className="vote-container-element">
          {userVote && userVote.dir === 1 ? (
            <ArrowUpward
              className="picture-vote-arrow"
              onClick={() => handleVoteDelete()}
            />
          ) : null}
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
          {!userVote && (
            <ArrowDownward
              className="picture-vote-arrow"
              onClick={() => handleVote(-1)}
            />
          )}
        </div>
      </div>
      <div className="picture-info-container">
        <img src={picture.user.avatar} alt="avatar" />
        <div>
          <Link to={`/users/${picture.user.id}`}>
            <div className="tooltip">
              <span className="tooltip-message">View Profile</span>
              <h2>{picture.user.username}</h2>
            </div>
          </Link>
        </div>
        <div>
          votes:
          {picture.votes.length}
        </div>
      </div>

      <FullScreen handle={pictureHandle}>
        <div className="fullscreen-image">
          <img src={picture.imgURL} alt="" />
        </div>
      </FullScreen>
      <div className="picture-list-container" style={{ color: 'white' }}>
        {filteredPictures.filter ? (
          <div>
            Pictures from
            {filteredPictures.filter}
            (
            {pictures.length}
            )
            <button type="button" onClick={handleFilterRemove}>Show All Pictures</button>
          </div>
        ) : (
          <div>
            All Pictures
            (
            {pictures.length}
            )
          </div>
        )}

        {pictures.map((pic) => (
          <div className="picture-list-picture-box">
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
};

export default SinglePicturePage;
