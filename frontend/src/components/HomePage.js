import React from 'react'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import CardHeader from '@material-ui/core/CardHeader'
import Avatar from '@material-ui/core/Avatar'
import ReactHtmlParser from 'react-html-parser'

const HomePage = ({ allBlogs }) => {
  if (allBlogs == null) return null
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {allBlogs.map((blog) => (
          <div style={{ margin: '5px' }}>
            <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
              <div>
                <Card style={{ width: '250px', height: '400px' }}>
                  <CardHeader
                    avatar={
                      <Avatar alt='author profile' src={blog.author.avatar} />
                    }
                    title={blog.title}
                    subheader={`written by: ${blog.author.username}`}
                    // subheader={blog.date}
                  />
                  <CardMedia>
                    <img
                      src={blog.headerImageURL}
                      height='200px'
                      width='200px'
                    />
                  </CardMedia>
                  <CardContent>
                    {ReactHtmlParser(blog.content, {
                      transform: (node) => {
                        if (node.type === 'tag' && node.name === 'img') {
                          return null
                        }
                      },
                    })}
                  </CardContent>
                </Card>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
