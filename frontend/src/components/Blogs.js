import React, { useEffect, useState } from 'react'
import queryString from 'query-string'
import { Button } from '@material-ui/core'
import { Link, useLocation } from 'react-router-dom'
import Star from '@material-ui/icons/Star'
import '../styles/blogs.css'
import BorderAll from '@material-ui/icons/BorderAll'
import CropLandscape from '@material-ui/icons/CropLandscape'
import { Select, MenuItem } from '@material-ui/core'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { DateTime } from 'luxon'
import 'swiper/swiper.scss'
import 'swiper/components/navigation/navigation.scss'
SwiperCore.use([Navigation])

const Blogs = ({ allBlogs }) => {
  const [blogs, setBlogs] = useState(null)
  const [displayMode, setDisplayMode] = useState(0)
  const [sortBy, setSortBy] = useState('Newest')

  const param = queryString.parse(useLocation().search)

  useEffect(() => {
    setBlogs(allBlogs)
  }, [allBlogs])

  useEffect(() => {
    if (allBlogs) {
      let sortedBlogs = allBlogs.slice()
      if (sortBy === 'Newest') {
        sortedBlogs.sort((a, b) => {
          if (DateTime.fromISO(a.date) < DateTime.fromISO(b.date)) {
            return 1
          }
          if (DateTime.fromISO(a.date) > DateTime.fromISO(b.date)) {
            return -1
          }
          return 0
        })
        setBlogs(sortedBlogs)
      }
      if (sortBy === 'Best') {
        sortedBlogs.sort((a, b) => {
          if (a.stars.length < b.stars.length) {
            return 1
          }
          if (a.stars.length > b.stars.length) {
            return -1
          }
          return 0
        })
        setBlogs(sortedBlogs)
      }
      if (param.country) {
        let blogMatches = []
        sortedBlogs.map((blog) =>
          blog.locations.map((loc) => {
            if (loc.country.toLowerCase() === param.country.toLowerCase())
              blogMatches.push(blog)
          })
        )
        setBlogs(blogMatches)
      }
      if (param.city) {
        let blogMatches = []
        sortedBlogs.map((blog) =>
          blog.locations.map((loc) => {
            if (loc.city.toLowerCase() === param.city.toLowerCase())
              blogMatches.push(blog)
          })
        )
        setBlogs(blogMatches)
      }
    }
  }, [sortBy, param.country, param.city])

  if (!blogs) return null

  if (displayMode === 1) {
    return (
      <div className="blogs-main-container swiper-wrapper">
        <div className="display-mode-wrapper">
          <div className="display-mode-buttons">
            <CropLandscape
              id="blog-single-display-mode-button"
              onClick={() => setDisplayMode(1)}
            ></CropLandscape>
            <BorderAll
              id="blog-multi-display-mode-button"
              onClick={() => setDisplayMode(0)}
            ></BorderAll>
          </div>
          <div className="blog-swiper">
            <Swiper
              slidesPerView={1}
              navigation
              style={{ textAlign: 'center' }}
            >
              {blogs.map(
                (blog) =>
                  blog.headerImageURL && (
                    <SwiperSlide>
                      <Link to={`/blogs/${blog.id}`}>
                        <img src={blog.headerImageURL} width="80%"></img>
                        <div className="swiper-blog-info">
                          <div className="swiper-blog-title">{blog.title}</div>
                          <div className="swiper-blog-description">
                            {blog.description}
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  )
              )}
            </Swiper>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blogs-main-container">
      <div className="display-mode-wrapper">
        <div className="display-mode-buttons">
          <CropLandscape
            id="blog-single-display-mode-button"
            onClick={() => setDisplayMode(1)}
          ></CropLandscape>
          <BorderAll
            id="blog-multi-display-mode-button"
            onClick={() => setDisplayMode(0)}
          ></BorderAll>
        </div>
      </div>
      <div className="blogs-main-content">
        <div className="blogs-navigation">
          <div className="blogs-top-title">
            {param.city && <h1>Blogs about {param.city}</h1>}
            {param.country && <h1>Blogs about {param.country}</h1>}
          </div>
          <div className="blog-filter-selection">
            <div>Sort By</div>
            <Select
              id={'blog-filter-select'}
              style={{ color: 'white' }}
              onChange={({ target }) => setSortBy(target.value)}
              value={sortBy}
            >
              <MenuItem value={'Best'}>Best</MenuItem>
              <MenuItem value={'Newest'}>Newest</MenuItem>
            </Select>
          </div>
        </div>
        <div className="blogs-container">
          <div className="cards-container">
            {blogs.map((blog) => (
              <div key={blog.id}>
                <Link id="main-blog-link" to={`/blogs/${blog.id}`}>
                  <div className="blog-card">
                    <div className="blog-image">
                      {blog.headerImageURL && (
                        <img src={blog.headerImageURL} width="300px"></img>
                      )}
                    </div>
                    <div className="blog-card-right">
                      <div className="blog-header">
                        <div className="blog-author-info">
                          <div>
                            <img src={blog.author.avatar}></img>
                          </div>
                          <div>By {blog.author.username}</div>
                        </div>
                        <div className={`blog-title ${blog.title.length > 22 && "long-blog-title"}`}>
                          <h1>{blog.title.toUpperCase()}</h1>
                        </div>
                        <div className="blog-description">
                          <p>{blog.description}</p>
                        </div>
                      </div>

                      <div className="blog-star">
                        <div className="tooltip">
                          <span className="tooltip-message">Stars</span>
                          <Star id="star" fontSize="default"></Star>
                        </div>
                        <div id="blog-stars-count">{blog.stars.length}</div>
                      </div>
                      <div className="blog-date">
                        {DateTime.fromISO(blog.date).monthShort}{' '}
                        {DateTime.fromISO(blog.date).day}{' '}
                        {DateTime.fromISO(blog.date).year}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="blog-pseudo-element"></div>
            <div className="blog-pseudo-element"></div>
            <div className="blog-pseudo-element"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blogs
