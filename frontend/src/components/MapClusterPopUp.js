import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import { Link } from 'react-router-dom';
import Fullscreen from '@material-ui/icons/Fullscreen';
import Button from '@material-ui/core/Button';

const MapClusterPopUp = ({
  content, setClusterContent, handle, setActivePopUp, setFullScreenImage,
}) => {
  const [viewBlogs, setViewBlogs] = useState(true);
  const [viewPictures, setViewPictures] = useState(true);
  const blogs = content.filter((c) => c.type === 'blog');
  const pictures = content.filter((c) => c.type === 'picture');

  useEffect(() => {
    setActivePopUp(false);
  }, []);

  const handleFullScreen = (img) => {
    setFullScreenImage(img);
    handle.enter();
  };

  return (
    <div
      className="cluster-popup-main-container"
    >
      <div className="cluster-popup-wrapper">
        {blogs.length > 0 && pictures.length > 0
          && (
          <div className="cluster-popup-filters">
            {blogs.length > 0
            && (
            <div>
              <Checkbox checked={viewBlogs} onChange={() => setViewBlogs(!viewBlogs)} />
              Blogs
            </div>
            )}
            {pictures.length > 0
            && (
            <div>
              <Checkbox checked={viewPictures} onChange={() => setViewPictures(!viewPictures)} />
              Pictures
            </div>
            )}
          </div>
          )}
        <button id="cluster-close-button" type="button" onClick={() => setClusterContent(null)}>X</button>
        <div className="cluster-content-container">
          {pictures.length > 0 && viewPictures
            && (
            <div>
              <h2 style={{ textAlign: 'center' }}>Pictures</h2>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-start',
              }}
              >

                {pictures.map((pic) => (
                  <div className="map-picture-card" key={pic.data.id}>
                    <div className="map-picture-card-title">
                      <h2>{pic.data.title}</h2>
                    </div>
                    <img src={pic.data.imgURL} alt="" />
                    <div className="map-picture-card-bottom">
                      <Link to={`/gallery/${pic.data.id}`}>
                        <Button id="map-picture-card-gallery-button">Open In Gallery</Button>
                      </Link>
                      <div
                        id="map-fullscreen-button"
                      >
                        <Fullscreen onClick={() => handleFullScreen(pic.data.imgURL)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

          {blogs.length > 0 && viewBlogs
            && (
            <div>
              <h2 style={{ textAlign: 'center' }}>Blogs</h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}
              >
                {blogs.map((blog) => (
                  <Link to={`/blogs/${blog.data.id}`} key={blog.data.id}>
                    <div className="blog-card map-cluster-blog-card">
                      <div className="blog-image">
                        {blog.data.headerImageURL && (
                          <img src={blog.data.headerImageURL} alt="blog-header" width="300px" />
                        )}
                      </div>
                      <div className="blog-card-right">
                        <div className="blog-header">
                          <div className="blog-author-info">
                            <div>
                              <img src={blog.data.author.avatar} alt="avatar" />
                            </div>
                            <div>
                              By
                              {' '}
                              {blog.data.author.username}
                            </div>
                          </div>
                          <div
                            className={`blog-title ${
                              blog.data.title.length > 22 && 'long-blog-title'
                            }`}
                          >
                            <h1>{blog.data.title.toUpperCase()}</h1>
                          </div>
                          <div className="blog-description">
                            <p>{blog.data.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

MapClusterPopUp.propTypes = {
  content: PropTypes.instanceOf(Array).isRequired,
  setClusterContent: PropTypes.func.isRequired,
  handle: PropTypes.instanceOf(Object).isRequired,
  setActivePopUp: PropTypes.func.isRequired,
  setFullScreenImage: PropTypes.func.isRequired,
};

export default MapClusterPopUp;
