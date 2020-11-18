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
    <div>
      <form onSubmit={handleCommentSubmit}>
        <input
          type='text'
          value={comment}
          onChange={({ target }) => setComment(target.value)}
        ></input>
        <button type='submit'>submit</button>
      </form>
    </div>
  )
}

const SingleBlogPage = ({ blogMatch, user, setAllBlogs, allBlogs }) => {
  const [blog, setBlog] = useState(blogMatch)

  if (!blog) return null
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
        <CommentForm user={user} blog={blog} setBlog={setBlog}></CommentForm>
        comments: {blog.comments.length}
        <ul>
          {blog.comments.map((comment) => (
            <li>
              {comment.user.username} {comment.content}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  )
}

export default SingleBlogPage
