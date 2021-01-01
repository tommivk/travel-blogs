import React from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { Button } from '@material-ui/core'
import '../styles/homePage.css'

const HomePage = ({ allBlogs, allPictures }) => {
  if (allBlogs.length === 0 || allPictures.length === 0) return null

  const newestBlogs = allBlogs
    .sort((a, b) => {
      if (DateTime.fromISO(a.date) < DateTime.fromISO(b.date)) {
        return 1
      }
      if (DateTime.fromISO(a.date) > DateTime.fromISO(b.date)) {
        return -1
      }
      return 0
    })
    .slice(0, 5)

  console.log(newestBlogs)
 
  return (
    <div className="homepage-main-container">
      <div className="homepage-main-content">
        <div className="featured-picture-container">
          <h1>Featured Picture</h1>
          <div className="featured-picture">
            <Link to={`/gallery/${allPictures[0].id}`}>
              <img src={allPictures[0].imgURL}></img>
            </Link>
          </div>
          <Link
            style={{ textDecoration: 'none', color: 'white' }}
            to={`/gallery/${allPictures[0].id}`}
          >
            <h3>{allPictures[0].title}</h3>
          </Link>
        </div>
        <div className="newest-blogs">
          <h1 id="newest-blogs-header">Newest Blogs</h1>
          <div className="homepage-blogs">
            <div className="homepage-blog-wrapper">
              {newestBlogs.map((blog) => (
                <Link
                  style={{ textDecoration: 'none', color: 'white' }}
                  to={`/blogs/${blog.id}`}
                >
                  <div className="homepage-blog">
                    <div className="homepage-blog-info">
                      <div>
                        <h2>{blog.title}</h2>
                      </div>
                      <div>
                        <p>{blog.description}</p>
                      </div>
                    </div>
                    <div className="homepage-blog-image">
                      {blog.headerImageURL && (
                        <img src={blog.headerImageURL}></img>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
