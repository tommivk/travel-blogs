import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import Modal from '@material-ui/core/Modal'
import Checkbox from '@material-ui/core/Checkbox';
import '../styles/userPage.css'

const UserPage = ({ userData, user }) => {
  const [content, setContent] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [subscribeBlogs, setsubscribeBlogs] = useState(false)
  const [subscribePictures, setSubscribePictures] = useState(false)
  if (!userData) return null
  console.log(userData, user)
  const joinDate = DateTime.fromISO(userData.joinDate)
  console.log(joinDate)

  const handleModalClose = () => {
    setModalOpen(false)
  }

  return (
    <div className='user-page-main-container'>
      
      <Modal
    
      open={modalOpen}
      onClose={handleModalClose}
      >
        <div className="subscribe-modal">
  <h2>Subscribe to {userData.username}</h2>
  <div>
        Blogs <Checkbox
        checked={subscribeBlogs}
        onChange={()=> setsubscribeBlogs(!subscribeBlogs)}
        ></Checkbox>
        </div>
        <div>
        Pictures 
        <Checkbox
        checked = {subscribePictures}
        onChange={()=>setSubscribePictures(!subscribePictures)}
        ></Checkbox>
        </div>
        <button>OK</button>
        </div>
      </Modal>
      <div className='user-page-user-info'>
        <img src={userData.avatar}></img>
        <h1>{userData.username}</h1>
        <div>
          Member Since {joinDate.monthLong} {joinDate.weekYear}
        </div>
        <div>Created Blogs: {userData.blogs.length}</div>
        <div>Uploaded Pictures: {userData.pictures.length}</div>
        {userData.id !== user.id && <div><button onClick={()=>setModalOpen(true)}>Subscribe</button></div>}
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
