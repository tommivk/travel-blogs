import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import '../styles/homePage.css';

const HomePage = ({ allBlogs, pictureOfTheWeek }) => {
  useEffect(() => {
    document.title = 'TravelBlogs';
  }, []);

  if (allBlogs.length === 0) return null;

  const newestBlogs = allBlogs
    .sort((a, b) => {
      if (DateTime.fromISO(a.date) < DateTime.fromISO(b.date)) {
        return 1;
      }
      if (DateTime.fromISO(a.date) > DateTime.fromISO(b.date)) {
        return -1;
      }
      return 0;
    });

  const featured = allBlogs[allBlogs.length - 1];

  return (
    <div className="homepage-main-container">
      <div className="home-page-top-section">
        <Link to={`/blogs/${featured.id}`}>
          <img alt="" src={featured.headerImageURL} />
          <div className="home-page-top-section-overlay">
            <div className="home-page-top-blog-info">
              <div id="homepage-featured">Featured</div>
              <h1>{featured.title}</h1>
              <p>{featured.description}</p>
            </div>
          </div>
        </Link>
      </div>
      <div className="homepage-main-content">
        <div className="newest-blogs">
          <div className="homepage-blogs">
            <h2 className="homepage-section-title">Newest Blogs</h2>
            <div className="homepage-blog-wrapper">
              {newestBlogs.map((blog) => (
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/blogs/${blog.id}`}
                  key={blog.id}
                >
                  <div className="homepage-blog">
                    <div className="homepage-blog-info">
                      <div>
                        <h2>{blog.title}</h2>
                      </div>
                      <div>
                        <p>{blog.description}</p>
                      </div>
                      <div>
                        <p id="homepage-blog-date">
                          {DateTime.fromISO(blog.date).monthShort}
                          {' '}
                          {DateTime.fromISO(blog.date).day}
                          {' '}
                          {DateTime.fromISO(blog.date).year}
                        </p>
                      </div>
                    </div>
                    <div className="homepage-blog-image">
                      {blog.headerImageURL && (
                      <img src={blog.headerImageURL} alt="blog" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="homepage-top-picture-container">
          <h2 className="homepage-section-title">Picture Of The Week</h2>
          <div className="homepage-picture">
            {pictureOfTheWeek
            && (
            <Link to={`/gallery/${pictureOfTheWeek.id}`}>
              <img src={pictureOfTheWeek.imgURL} alt="best of the week" />
              <div className="homepage-picture-bottom-section">
                <h3>{pictureOfTheWeek.title.toUpperCase()}</h3>
              </div>
            </Link>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
};

HomePage.propTypes = {
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  pictureOfTheWeek: PropTypes.instanceOf(Object).isRequired,
};

export default HomePage;
