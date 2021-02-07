import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Sms from '@material-ui/icons/Sms';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { Link, useLocation } from 'react-router-dom';
import { Button, Select, MenuItem } from '@material-ui/core';
import ImageUploadModal from './ImageUploadModal';
import '../styles/gallery.css';

const Gallery = ({
  allPictures,
  setAllPictures,
  setFilteredPictures,
  user,
  setUser,
  handleMessage,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pictures, setPictures] = useState(allPictures);
  const [sortBy, setSortBy] = useState('Newest');

  const param = queryString.parse(useLocation().search);
  useEffect(() => {
    document.title = 'Gallery | TravelBlogs';
  }, []);

  useEffect(() => {
    if (allPictures) {
      const sortedPictures = allPictures.slice();
      setFilteredPictures({ pictures: null, filter: null });
      switch (sortBy) {
        case 'Newest':
          sortedPictures.sort((a, b) => {
            if (a.date < b.date) {
              return 1;
            }
            if (a.date > b.date) {
              return -1;
            }
            return 0;
          });
          setPictures(sortedPictures);
          break;
        case 'Best':
          sortedPictures.sort((a, b) => {
            if (a.voteResult < b.voteResult) {
              return 1;
            }
            if (a.voteResult > b.voteResult) {
              return -1;
            }
            return 0;
          });
          setPictures(sortedPictures);
          break;
        case 'Oldest':
          sortedPictures.sort((a, b) => {
            if (a.date > b.date) {
              return 1;
            }
            if (a.date < b.date) {
              return -1;
            }
            return 0;
          });
          setPictures(sortedPictures);
          break;
        default:
          break;
      }

      if (param.city) {
        const picturesWithCity = sortedPictures.filter(
          (p) => p.location && p.location.city && p.location.city !== null,
        );
        const filteredPics = picturesWithCity.filter(
          (p) => p.location.city.toLowerCase() === param.city.toLowerCase(),
        );
        setPictures(filteredPics);
        setFilteredPictures({ pictures: filteredPics, filter: param.city });
      }

      if (param.country) {
        const picturesWithCountry = sortedPictures.filter(
          (p) => p.location.country !== null,
        );

        const filteredPics = picturesWithCountry.filter(
          (p) => p.location.country.toLowerCase() === param.country.toLowerCase(),
        );

        setPictures(filteredPics);
        setFilteredPictures({ pictures: filteredPics, filter: param.country });
      }
    }
  }, [param.country, param.city, allPictures, sortBy]);

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  if (!pictures) return null;

  return (
    <div className="gallery-main-container">
      <div className="blog-top-right-container">
        <div className="blog-top-right-wrapper">
          <div className="gallery-filter-selection">
            <span className="gallery-select-title">Sort By</span>
            <Select
              style={{ color: 'white' }}
              onChange={({ target }) => setSortBy(target.value)}
              value={sortBy}
              MenuProps={{
                getContentAnchorEl: null,
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
              }}
            >
              <MenuItem value="Best">Best</MenuItem>
              <MenuItem value="Newest">Newest</MenuItem>
              <MenuItem value="Oldest">Oldest</MenuItem>
            </Select>
          </div>
          <div className="gallery-upload-images-button">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setUploadModalOpen(true)}
            >
              upload images
            </Button>
          </div>
        </div>
      </div>
      <div className="gallery-main-content">
        <ImageUploadModal
          uploadModalOpen={uploadModalOpen}
          closeModal={closeUploadModal}
          user={user}
          setUser={setUser}
          allPictures={allPictures}
          setAllPictures={setAllPictures}
          handleMessage={handleMessage}
        />
        <div className="gallery-top-content">
          {param.country && (
            <div style={{ display: 'flex' }}>
              <h1 style={{ color: 'white', marginTop: '0px' }}>
                Pictures from
                {' '}
                <span style={{ color: 'rgb(180, 155, 9)' }}>
                  {param.country}
                </span>
              </h1>
              <Link to="/gallery">
                <Button style={{ color: 'white' }}>(X)</Button>
              </Link>
            </div>
          )}
          {param.city && (
            <div style={{ display: 'flex' }}>
              <h1 style={{ color: 'white', marginTop: '0px' }}>
                Pictures from
                {' '}
                <span style={{ color: 'rgb(180, 155, 9)' }}>{param.city}</span>
              </h1>
              <Link to="/gallery">
                <Button style={{ color: 'white' }}>(X)</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="gallery-cards-wrapper">
          <div className="gallery-cards">
            {pictures.map((pic) => (
              <div key={pic.id}>
                <Link
                  to={`/gallery/${pic.id}`}
                  key={pic.id}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="gallery-card">
                    <img src={pic.imgURL} alt="" />
                    <h4
                      className="gallery-card-title"

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
                            <Sms id="gallery-card-comment-icon" />
                            {pic.comments.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
            <div className="pic-pseudo-element" />
          </div>
        </div>
      </div>
    </div>
  );
};

Gallery.propTypes = {
  allPictures: PropTypes.instanceOf(Array).isRequired,
  setAllPictures: PropTypes.func.isRequired,
  setFilteredPictures: PropTypes.func.isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  setUser: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default Gallery;
