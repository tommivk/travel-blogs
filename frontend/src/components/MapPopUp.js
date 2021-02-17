import React from 'react';
import PropTypes from 'prop-types';
import Fullscreen from '@material-ui/icons/Fullscreen';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';

const MapPopUp = ({
  selected, handle, type, setActivePopUp, setFullScreenImage,
}) => {
  const handleFullScreen = (img) => {
    setFullScreenImage(img);
    handle.enter();
  };

  if (type !== 'blog' && type !== 'image') return null;

  if (type === 'blog') {
    return (
      <div className="map-blog-card-wrapper">
        <Link to={`/blogs/${selected.id}`} style={{ textDecoration: 'none' }}>
          <div className="blog-card map-blog-card">
            <div className="blog-image">
              {selected.headerImageURL && (
              <img src={selected.headerImageURL} alt="blog-header" width="300px" />
              )}
            </div>
            <div className="blog-card-right">
              <div className="blog-header">
                <div className="blog-author-info">
                  <div>
                    <img src={selected.author.avatar} alt="avatar" />
                  </div>
                  <div>
                    By
                    {' '}
                    {selected.author.username}
                  </div>
                </div>
                <div
                  className={`blog-title ${
                    selected.title.length > 22 && 'long-blog-title'
                  }`}
                >
                  <h1>{selected.title.toUpperCase()}</h1>
                </div>
                <div className="blog-description">
                  <p>{selected.description}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
        <button
          type="button"
          className="map-popup-close-button"
          onClick={() => setActivePopUp(null)}
        >
          X
        </button>
      </div>
    );
  }
  return (
    <div className="map-picture-card map-picture">
      <div className="map-picture-card-title">
        <h2>{selected.title}</h2>
      </div>
      <img src={selected.imgURL} alt="" />
      <div className="map-picture-card-bottom">
        <Link to={`/gallery/${selected.id}`}>
          <Button id="map-picture-card-gallery-button">Open In Gallery</Button>
        </Link>
        <div
          id="map-fullscreen-button"
        >
          <Fullscreen onClick={() => handleFullScreen(selected.imgURL)} />
        </div>
      </div>
      <button
        type="button"
        className="map-popup-close-button"
        onClick={() => setActivePopUp(null)}
      >
        X
      </button>
    </div>
  );
};

MapPopUp.propTypes = {
  selected: PropTypes.instanceOf(Object).isRequired,
  handle: PropTypes.instanceOf(Object).isRequired,
  type: PropTypes.string.isRequired,
  setActivePopUp: PropTypes.func.isRequired,
  setFullScreenImage: PropTypes.func.isRequired,
};

export default MapPopUp;
