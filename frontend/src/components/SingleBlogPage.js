import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import Star from '@material-ui/icons/Star'
import StarBorder from '@material-ui/icons/StarBorder'
import Avatar from '@material-ui/core/Avatar'
import ReactHtmlParser from 'react-html-parser'
import '../styles/singleBlogPage.css'
import { DateTime } from 'luxon'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const CommentForm = ({ user, blog, setBlog }) => {
  const [comment, setComment] = useState('')

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    const newComment = {
      content: comment,
    }
    try {
      const response = await axios.post(
        `http://localhost:8008/api/blogs/${blog.id}/comments`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      setBlog(response.data)
      console.log(response.data)
      setComment('')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='comment-form-main-container'>
      <form onSubmit={handleCommentSubmit}>
        <div className='comment-form-wrapper'>
          <input
            id='comment-form-input'
            type='text'
            value={comment}
            autoComplete='off'
            onChange={({ target }) => setComment(target.value)}
          ></input>
          <Button
            id='comment-form-button'
            variant='contained'
            size='small'
            type='submit'
          >
            send
          </Button>
        </div>
      </form>
    </div>
  )
}

const SingleBlogPage = ({ blogMatch, user, setAllBlogs, allBlogs }) => {
  const [blog, setBlog] = useState(blogMatch)

  if (!blog) return null
  const dateNow = DateTime.local()

  // console.log(blogDate)

  console.log(blog)
  console.log(user, blog)
  const handleStarChange = async (action) => {
    console.log(user, blog)
    const response = await axios.put(
      `http://localhost:8008/api/blogs/${blog.id}/star`,
      { action: action },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    )
    const newBlog = response.data
    newBlog.date = new Date(response.data.date)
    setBlog(newBlog)
    console.log(newBlog, allBlogs)
    const filteredBlogs = allBlogs.map((b) =>
      b.id === newBlog.id ? newBlog : b
    )

    setAllBlogs(filteredBlogs)
    console.log(response)
  }

  const calculateDateDiff = (date) => {
    const daysAgo = Math.floor(dateNow.diff(DateTime.fromISO(date)).as('days'))
    if (daysAgo >= 1) {
      if (daysAgo === 1) {
        return '1 day ago'
      }
      return `${daysAgo} days ago`
    }
    const hoursAgo = Math.floor(
      dateNow.diff(DateTime.fromISO(date)).as('hours')
    )
    if (hoursAgo >= 1) {
      if (hoursAgo === 1) {
        return '1 hour ago'
      }
      return `${hoursAgo} hours ago`
    }
    const minutesAgo = Math.floor(
      dateNow.diff(DateTime.fromISO(date)).as('minutes')
    )
    if (minutesAgo >= 1) {
      if (minutesAgo === 1) {
        return '1 minute ago'
      }
      return `${minutesAgo} minutes ago`
    }
    return `less than a minute ago`
  }

  return (
    <div>
      <Container maxWidth='md'>
        <div>
          <h1 id='blog-title'>{blog.title}</h1>
          <div className='author-container'>
            <div className='author-picture'>
              <Avatar alt='author profile' src={blog.author.avatar} />
            </div>
            <div className='blog-info-container'>
              <div className='author-username'>
                <Link id='blog-author-link' to={`/users/${blog.author.id}`}>
                  <h3>{blog.author.username}</h3>
                </Link>
              </div>
              <div className='blog-info-date'>
                {/* {monthNames[blog.date.getMonth()]} {blog.date.getDate()} */}
              </div>
            </div>
          </div>
          {ReactHtmlParser(blog.content)}
        </div>
        <div className='vote-container'>
          <div>
            {blog.stars.includes(user.id) ? (
              <div>
                <Star
                  id='voted-star'
                  fontSize='large'
                  onClick={() => handleStarChange('remove')}
                ></Star>
              </div>
            ) : (
              <div>
                <StarBorder
                  id='unvoted-star'
                  fontSize='large'
                  onClick={() => handleStarChange('add')}
                ></StarBorder>
              </div>
            )}
          </div>
          <div id='vote-count'> {blog.stars.length} stars</div>
        </div>
        <div className='blog-comment-section-container'>
          <div className='blog-comment-form'>
            <CommentForm
              user={user}
              blog={blog}
              setBlog={setBlog}
            ></CommentForm>
          </div>

          <ul>
            {blog.comments.map((comment) => (
              <div className='blog-comment'>
                <li>
                  <div className='blog-comment-top-section'>
                    <img src={comment.user.avatar}></img>
                    <div className='blog-comment-username'>
                      <Link to={`/users/${comment.user.id}`}>
                        {comment.user.username}
                      </Link>
                    </div>
                    <div className='blog-comment-date'>
                      {calculateDateDiff(comment.date)}
                    </div>
                  </div>
                  <div className='blog-comment-content'>{comment.content}</div>
                </li>
              </div>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  )
}

export default SingleBlogPage
