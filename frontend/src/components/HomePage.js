import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import SwiperCore, { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import '../styles/homePage.css';

SwiperCore.use([Autoplay]);

const HomePage = ({ allBlogs, allPictures }) => {
  if (allBlogs.length === 0) return null;

  useEffect(() => {
    document.title = 'TravelBlogs';
  }, []);

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
        <Swiper
          slidesPerView={1}
          id="homepage-swiper"
          autoplay={{ delay: 4000 }}
          allowTouchMove={false}
          speed={3000}
        >
          {allPictures.map((pic) => (
            <SwiperSlide key={pic.id}>
              <Link id="homepage-picture-link" to={`/gallery/${pic.id}`}>
                <img src={pic.imgURL} alt="" />
                <div className="homepage-swiper-title">
                  <h3>{pic.title}</h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

HomePage.propTypes = {
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
};

export default HomePage;
