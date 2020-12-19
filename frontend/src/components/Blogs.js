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
  const [blogs, setBlogs] = useState(allBlogs)
  const [displayMode, setDisplayMode] = useState(0)
  const [sortBy, setSortBy] = useState('Newest')

  const param = queryString.parse(useLocation().search)
  console.log(param)

  useEffect(() => {
    if (blogs && allBlogs) {
      let sortedBlogs = allBlogs.slice()
      console.log(blogs)
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
        console.log(blogMatches)
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
        console.log(blogMatches)
      }
    }
  }, [sortBy, param.country, param.city])

  if (!blogs) return null

  if (displayMode === 1) {
    return (
      <div className="blogs-main-container swiper-wrapper">
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
        <Swiper
          slidesPerView={1}
          navigation
          onSlideChange={() => console.log('slide change')}
          onSwiper={(swiper) => console.log(swiper)}
          style={{ textAlign: 'center' }}
        >
          {blogs.map(
            (blog) =>
              blog.headerImageURL && (
                <SwiperSlide>
                  <Link to={`/blogs/${blog.id}`}>
                    <img
                      src={blog.headerImageURL}
                      width="80%"
                      onLoad={() => console.log('img loading')}
                    ></img>
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
    )
  }
  console.log(blogs)

  return (
    <div className="blogs-main-container">
      <div className="blogs-main-content">
      <div className="blogs-navigation">
        <div>
          <Select
            style={{ color: 'white' }}
            onChange={({ target }) => setSortBy(target.value)}
            value={sortBy}
          >
            <MenuItem value={'Best'}>Best</MenuItem>
            <MenuItem value={'Newest'}>Newest</MenuItem>
          </Select>
        </div>
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
      {param.city && <div>Blogs about {param.city}</div>}
      {param.country && <div>Blogs about {param.country}</div>}
      <div className="blogs-container">
        <div className="cards-container">
          {blogs.map((blog) => (
            <Link id="main-blog-link" to={`/blogs/${blog.id}`}>
              <div className="blog-card">
                <div className="blog-header">
                  <div className="blog-title">
                    <h1>{blog.title}</h1>
                  </div>
                  <div className="blog-author-username">
                    Written by {blog.author.username}
                  </div>
                </div>
                <div className="blog-image">
                  <img src={blog.headerImageURL} width="300px"></img>
                </div>

                <div className="blog-description">
                  <h4>{blog.description}</h4>
                </div>
                <div className="blog-star">
                  <Star id="star" fontSize="medium"></Star>
                  <div id="blog-stars-count">{blog.stars.length}</div>
                </div>

                {/* <div className='blog-button'>
                <Link to={`/blogs/${blog.id}`} id='blog-link'>
                  <Button variant='outlined' color='primary'>
                    Read
                  </Button>
                </Link>
              </div> */}
              </div>
            </Link>
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
