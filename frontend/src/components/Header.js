import React, { useState } from 'react'
import firebase from 'firebase/app'
import { Link } from 'react-router-dom'
import { Search, Language, Notifications } from '@material-ui/icons'
import SearchModal from './SearchModal'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Settings from '@material-ui/icons/Settings'
import '../styles/header.css'
const Header = ({
  user,
  setUser,
  allPictures,
  allUsers,
  userNotifications,
}) => {
  console.log(user)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  console.log(userNotifications)

  if (!userNotifications) return null
  const unreadNotifications = userNotifications.filter(
    (n) => !n.readBy.includes(user.id)
  )
  const readNotifications = userNotifications.filter((n) =>
    n.readBy.includes(user.id)
  )
  console.log(unreadNotifications)
  console.log(readNotifications)
  const closeSearchModal = () => {
    setSearchModalOpen(false)
    setSearchFilter('')
  }

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
      <div>
        <SearchModal
          open={searchModalOpen}
          closeSearchModal={closeSearchModal}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          allPictures={allPictures}
          allUsers={allUsers}
        ></SearchModal>
      </div>

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
        <Search
          id='header-search-icon'
          onClick={() => setSearchModalOpen(true)}
        ></Search>
        <div className='notification-container'>
          <Notifications id='notifications-bell' />

          {unreadNotifications.length > 0 && (
            <div className='notification-count'>
              <div className='notification-number'>
                {unreadNotifications.length}
              </div>
            </div>
          )}
        </div>
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
