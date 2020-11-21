import React, { useState } from 'react'
import firebase from 'firebase/app'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import { Search, Language, Notifications, Photo } from '@material-ui/icons'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import InputBase from '@material-ui/core/InputBase'
import Settings from '@material-ui/icons/Settings'
import '../styles/header.css'
const Header = ({ user, setUser }) => {
  console.log(user)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  const handleMenuOpen = (e) => {
    setMenuAnchorEl(e.currentTarget)
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedTravelBlogUser')
    setUser(null)

    firebase
      .auth()
      .signOut()
      .then(() => console.log('signout successful'))
      .catch((error) => console.log('error happened'))

    setMenuAnchorEl(null)
  }

  return (
    <div className='main-header-container'>
      <div className='header-title'>
        <Link to='/' style={{ textDecoration: 'none', color: 'black' }}>
          <h1>TravelBlogs</h1>
        </Link>
      </div>
      <div className='header-link-container'>
        <Link to='/blogs'>
          <div className='header-link'>
            <h1>Blogs</h1>
          </div>
        </Link>
        <Link to='/gallery'>
          <div className='header-link'>
            {/* <Photo fontSize='large' style={{ color: 'black' }}></Photo> */}
            <h1>Gallery</h1>
          </div>
        </Link>
        <Link to='/explore' style={{ color: 'black' }}>
          <div className='header-link'>
            <Language fontSize='large' />
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex' }}>
        <Notifications id='notifications-bell' />
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img
            src={user.avatar}
            height='40'
            width='40'
            alt='avatar'
            style={{ borderRadius: '50%' }}
          ></img>
        </div>
      </div>
      <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Link
          to='/createblog'
          style={{
            textDecoration: 'none',
            color: 'black',
          }}
        >
          <MenuItem onClick={handleMenuClose}>Add new blog</MenuItem>
        </Link>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>{' '}
        <MenuItem onClick={handleMenuClose}>
          <Link to='/settings'>
            <Settings></Settings>
          </Link>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Header
