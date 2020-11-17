import { Button, Container } from '@material-ui/core'
import '../styles/blogs.css'
const Blogs = ({ allBlogs }) => {
  if (!allBlogs) return null
  const blog = allBlogs[0]
  console.log(blog)

  return (
    <div className='main-container'>
      <Container>
        <div className='blog-info'>
          <h1>{blog.title}</h1>
          <h3>By: {blog.author.username}</h3> {blog.date}{' '}
          <p> {blog.content.substring(0, 200)} ...</p>
          <button>Read</button>
        </div>

        <div className='image-container'>
          <img src={blog.headerImageURL}></img>
        </div>
      </Container>
    </div>
  )
}

export default Blogs
