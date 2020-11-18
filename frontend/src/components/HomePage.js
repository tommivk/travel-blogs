import React from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { Button } from '@material-ui/core'
import '../styles/homePage.css'

const TopFiveBlogs = ({ allBlogs }) => {
  console.log(allBlogs)
  const month = new Date().getMonth()
  const thisMonth = allBlogs.map((blog) =>
    new Date(blog.date).getMonth() === month ? blog : null
  )

  const topBlogs = thisMonth
    .sort((a, b) => {
      if (a.stars.length > b.stars.length) return -1
      if (a.stars.length < b.stars.length) return 1
      if (a.stars.length === b.stars.length) return 0
    })
    .slice(0, 5)
  return (
    <div className='top-blogs-container'>
      <div className='top-blogs-cards-container'>
        <h2>Top Blogs of The Month</h2>

        {topBlogs.map((b) => (
          <div className='top-blogs-card'>
            <div className='top-blog-info'>
              <Link id='blog-link' to={`/blogs/${b.id}`}>
                <div className='top-blog-title'>
                  <h3>{b.title}</h3>
                </div>
                <div className='top-blog-description'>{b.description}</div>
              </Link>
            </div>
            <div className='top-blogs-card-image'>
              <img src={b.headerImageURL}></img>
            </div>
          </div>
        ))}
        <Button>Browse blogs</Button>
      </div>
    </div>
  )
}

const PictureOfTheWeek = ({ allPictures }) => {
  if (!allPictures) return null

  const thisweek = DateTime.local().weekNumber

  const filtered = allPictures.map((pic) =>
    DateTime.fromISO(pic.date).weekNumber === thisweek ? pic : null
  )

  const best = filtered.sort((a, b) => b.voteResult - a.voteResult)[0]

  if (!best) return null

  return (
    <div className='homepage-main-picture-container'>
      <h2>Picture Of The Week</h2>
      <div>
        <div>
          {' '}
          <h3>{best.title}</h3>
        </div>
        <img src={best.imgURL} width='700px'></img>
      </div>
      <Button>Open in gallery</Button>
    </div>
  )
}

const HomePage = ({ allBlogs, allPictures }) => {
  if (allBlogs == null) return null
  return (
    <div className='homepage-main-container'>
      <div>
        <PictureOfTheWeek allPictures={allPictures}></PictureOfTheWeek>
      </div>
      <div>
        <TopFiveBlogs allBlogs={allBlogs}></TopFiveBlogs>
      </div>
    </div>
  )
}

export default HomePage
