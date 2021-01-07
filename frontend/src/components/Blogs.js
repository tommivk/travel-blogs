import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Link, useLocation } from 'react-router-dom';
import Star from '@material-ui/icons/Star';
import '../styles/blogs.css';
import BorderAll from '@material-ui/icons/BorderAll';
import CropLandscape from '@material-ui/icons/CropLandscape';
import { Select, MenuItem } from '@material-ui/core';
import SwiperCore, { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { DateTime } from 'luxon';
import 'swiper/swiper.scss';
import 'swiper/components/navigation/navigation.scss';

SwiperCore.use([Navigation]);

const Blogs = ({ allBlogs }) => {
  const [blogs, setBlogs] = useState(null);
  const [displayMode, setDisplayMode] = useState(0);
  const [sortBy, setSortBy] = useState('Newest');

  const param = queryString.parse(useLocation().search);

  useEffect(() => {
    setBlogs(allBlogs);
  }, [allBlogs]);

  useEffect(() => {
    if (allBlogs) {
      const sortedBlogs = allBlogs.slice();
      if (sortBy === 'Newest') {
        sortedBlogs.sort((a, b) => {
          if (DateTime.fromISO(a.date) < DateTime.fromISO(b.date)) {
            return 1;
          }
          if (DateTime.fromISO(a.date) > DateTime.fromISO(b.date)) {
            return -1;
          }
          return 0;
        });
        setBlogs(sortedBlogs);
      }

      if (sortBy === 'Best') {
        sortedBlogs.sort((a, b) => {
          if (a.stars.length < b.stars.length) {
            return 1;
          }
          if (a.stars.length > b.stars.length) {
            return -1;
          }
          return 0;
        });
        setBlogs(sortedBlogs);
      }

      if (param.country) {
        const blogMatches = [];
        sortedBlogs.map((blog) => blog.locations.map((loc) => {
          if (loc.country.toLowerCase() === param.country.toLowerCase()) {
            blogMatches.push(blog);
          }
        }));

        setBlogs(blogMatches);
      }
      if (param.city) {
        const blogMatches = [];
        sortedBlogs.map((blog) => blog.locations.map((loc) => {
          if (loc.city.toLowerCase() === param.city.toLowerCase()) {
            blogMatches.push(blog);
          }
        }));

        setBlogs(blogMatches);
      }
    }
  }, [sortBy, param.country, param.city]);

  if (!blogs) return null;

  if (displayMode === 1) {
    return (
      <div className="blogs-main-container swiper-wrapper">
        <div className="swiper-display-mode-wrapper">
          <div className="swiper-display-mode-buttons">
            <CropLandscape
              id="blog-single-display-mode-button"
              onClick={() => setDisplayMode(1)}
            />
            <BorderAll
              id="blog-multi-display-mode-button"
              onClick={() => setDisplayMode(0)}
            />
          </div>
          <div className="blog-swiper">
            <Swiper
              slidesPerView={1}
              navigation
              style={{ textAlign: 'center' }}
            >
              {blogs.map(
                (blog) => blog.headerImageURL && (
                <SwiperSlide>
                  <Link to={`/blogs/${blog.id}`}>
                    <img src={blog.headerImageURL} width="80%" alt="blog-header" />
                    <div className="swiper-blog-info">
                      <div className="swiper-blog-title">{blog.title}</div>
                      <div className="swiper-blog-description">
                        {blog.description}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
                ),
              )}
            </Swiper>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-main-container">
      <div className="blogs-navigation">
        <div className="blog-filter-selection">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>Sort By</div>
            <Select
              id="blog-filter-select"
              style={{ color: 'white' }}
              onChange={({ target }) => setSortBy(target.value)}
              value={sortBy}
            >
              <MenuItem value="Best">Best</MenuItem>
              <MenuItem value="Newest">Newest</MenuItem>
            </Select>
          </div>
          <div className="display-mode-wrapper">
            <div className="display-mode-buttons">
              <CropLandscape
                id="blog-single-display-mode-button"
                onClick={() => setDisplayMode(1)}
              />
              <BorderAll
                id="blog-multi-display-mode-button"
                onClick={() => setDisplayMode(0)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="blogs-main-content">
        <div className="blogs-top-title">
          {param.city
            && (
            <h1>
              Blogs about
              {' '}
              <span style={{ color: 'rgb(180, 155, 9)' }}>
                {param.city}
              </span>
            </h1>
            )}
          {param.country
            && (
            <h1>
              Blogs about
              {' '}
              <span style={{ color: 'rgb(180, 155, 9)' }}>
                {param.country}
              </span>
            </h1>
            )}
        </div>

        <div className="blogs-container">
          <div className="cards-container">
            {blogs.map((blog) => (
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
            ))}
            <div className="blog-pseudo-element" />
            <div className="blog-pseudo-element" />
            <div className="blog-pseudo-element" />
          </div>
        </div>
      </div>
    </div>
  );
};

Blogs.propTypes = {
  allBlogs: PropTypes.instanceOf(Array).isRequired,
};

export default Blogs;
