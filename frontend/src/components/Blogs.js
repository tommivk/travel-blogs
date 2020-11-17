import { Button, Container } from '@material-ui/core'
import { Link } from 'react-router-dom'
import Star from '@material-ui/icons/Star'
import Avatar from '@material-ui/core/Avatar'
import '../styles/blogs.css'

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

const Blogs = ({ allBlogs }) => {
  if (!allBlogs) return null

  console.log(allBlogs)

  return (
    <div className='main-container'>
      <Container>
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
                <div className='blog-date'>
                  {monthNames[blog.date.getMonth()].substring(0, 3)}{' '}
                  {blog.date.getDate()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Blogs
