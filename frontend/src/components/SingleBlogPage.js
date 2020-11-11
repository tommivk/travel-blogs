import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import Avatar from '@material-ui/core/Avatar'
import ReactHtmlParser from 'react-html-parser'

const SingleBlogPage = ({ blog }) => {
  if (!blog) return null
  return (
    <div>
      <Container maxWidth='md'>
        <div>
          <h1 style={{ textAlign: 'center' }}>{blog.title}</h1>
          <div style={{ display: 'flex' }}>
            <Avatar alt='author profile' src={blog.author.avatar} />
            {blog.author.username} {blog.date}
          </div>
          {ReactHtmlParser(blog.content)}
        </div>
        <Link to='/'>
          <Button>Go back</Button>
        </Link>
      </Container>
    </div>
  )
}

export default SingleBlogPage
