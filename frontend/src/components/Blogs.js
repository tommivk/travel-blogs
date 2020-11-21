import React, { useState } from 'react'
import { Button, Container } from '@material-ui/core'
import { Link } from 'react-router-dom'
import Star from '@material-ui/icons/Star'
import '../styles/blogs.css'
import BorderAll from '@material-ui/icons/BorderAll'
import CropLandscape from '@material-ui/icons/CropLandscape'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.scss'
import 'swiper/components/navigation/navigation.scss'
SwiperCore.use([Navigation])

const Blogs = ({ allBlogs }) => {
  const [displayMode, setDisplayMode] = useState(0)

  if (!allBlogs) return null
  if (displayMode === 1) {
    return (
      <div className='main-container'>
        <div className='display-mode-buttons'>
          <CropLandscape
            id='blog-single-display-mode-button'
            onClick={() => setDisplayMode(1)}
          ></CropLandscape>
          <BorderAll
            id='blog-multi-display-mode-button'
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
          {allBlogs.map(
            (blog) =>
              blog.headerImageURL && (
                <SwiperSlide>
                  <Link to={`/blogs/${blog.id}`}>
                    <img
                      src={blog.headerImageURL}
                      width='80%'
                      onLoad={() => console.log('img loading')}
                    ></img>
                  </Link>
                </SwiperSlide>
              )
          )}
        </Swiper>
      </div>
    )
  }
  console.log(allBlogs)

  return (
    <div className='main-container'>
      <div className='display-mode-buttons'>
        <CropLandscape
          id='blog-single-display-mode-button'
          onClick={() => setDisplayMode(1)}
        ></CropLandscape>
        <BorderAll
          id='blog-multi-display-mode-button'
          onClick={() => setDisplayMode(0)}
        ></BorderAll>
      </div>
      <div className='cards-container'>
        {allBlogs.map((blog) => (
          <Link id='main-blog-link' to={`/blogs/${blog.id}`}>
            <div className='blog-card'>
              <div className='blog-header'>
                {/* <div className='author-avatar'>
                  <Avatar src={blog.author.avatar}></Avatar>
                </div> */}
                <div className='blog-title'>
                  <h1>{blog.title}</h1>
                </div>
                <div className='blog-author-username'>
                  Written by {blog.author.username}
                </div>
              </div>
              <div className='blog-image'>
                <img src={blog.headerImageURL} width='300px'></img>
              </div>

              <div>
                <h4>{blog.description}</h4>
              </div>
              <div className='blog-star'>
                <Star id='star' fontSize='medium'></Star>
                <div id='blog-stars-count'>{blog.stars.length}</div>
              </div>

              <div className='blog-button'>
                <Link to={`/blogs/${blog.id}`} id='blog-link'>
                  <Button variant='outlined' color='primary'>
                    Read
                  </Button>
                </Link>
              </div>
              {/* <div className='blog-date'>
                  {monthNames[blog.date.getMonth()].substring(0, 3)}{' '}
                  {blog.date.getDate()}
                </div> */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Blogs
