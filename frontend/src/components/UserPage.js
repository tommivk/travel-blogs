import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import '../styles/userPage.css'

const UserPage = ({ userData }) => {
  const [content, setContent] = useState(0)
  if (!userData) return null
  console.log(userData)
  const joinDate = DateTime.fromISO(userData.joinDate)
  console.log(joinDate)
  return (
    <div className='user-page-main-container'>
      <div className='user-page-user-info'>
        <img src={userData.avatar}></img>
        <h1>{userData.username}</h1>
        <div>
          Member Since {joinDate.monthLong} {joinDate.weekYear}
        </div>
        <div>Created Blogs: {userData.blogs.length}</div>
        <div>Uploaded Pictures: {userData.pictures.length}</div>
      </div>
      <button onClick={() => setContent(0)}>Pictures</button>
      <button onClick={() => setContent(1)}>Blogs</button>
      {content === 0 && (
        <div>
          {userData.username}'s Uploaded Pictures
          <div>
            {userData.pictures.map((p) => (
              <Link to={`/gallery/${p.id}`}>
                <img src={p.imgURL}></img>
              </Link>
            ))}
          </div>
        </div>
      )}
      {content === 1 && (
        <div>
          {userData.username}'s Blogs
          <div>
            {userData.blogs.length === 0 ? (
              <div>No blogs created yet</div>
            ) : (
              userData.blogs.map((b) => (
                <Link to={`/blogs/${b.id}`}>{b.title}</Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPage
