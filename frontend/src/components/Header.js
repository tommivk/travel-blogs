import React, { useEffect, useState } from 'react'
import axios from 'axios'
import firebase from 'firebase/app'
import { Link, useHistory } from 'react-router-dom'
import {
  Search,
  Language,
  Notifications,
  FormatIndentDecreaseTwoTone,
} from '@material-ui/icons'
import SearchModal from './SearchModal'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Settings from '@material-ui/icons/Settings'
import { DateTime } from 'luxon'
import '../styles/header.css'

const Header = ({
  user,
  setUser,
  allPictures,
  allBlogs,
  allUsers,
  userNotifications,
  setUserNotifications,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [notificationMenuEl, setNotificationMenuEl] = useState(null)
  const [unreadNotifications, setUnreadNotifications] = useState([])
  const [readNotifications, setReadNotifications] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const history = useHistory()

  useEffect(() => {
    if (userNotifications) {
      setUnreadNotifications(
        userNotifications.filter((n) => !n.readBy.includes(user.id))
      )

      setReadNotifications(
        userNotifications.filter((n) => n.readBy.includes(user.id))
      )
    }
  }, [userNotifications])

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

  const handleNotificationMenuOpen = (e) => {
    setNotificationMenuEl(e.currentTarget)
  }
  const handleNotificationMenuClose = () => {
    setNotificationMenuEl(null)
  }

  const handleNotificationMessageClick = async (n) => {
    try {
      const res = await axios.put(
        `http://localhost:8008/api/notifications/${n.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      let newNotifications = userNotifications.map((notification) =>
        notification.id === n.id ? res.data : notification
      )
      setUserNotifications(newNotifications)
      const readnotifications = readNotifications.filter((x) => x.id !== n.id)
      setReadNotifications(readnotifications)
      const unreadnotifications = unreadNotifications.filter(
        (x) => x.id !== n.id
      )
      setUnreadNotifications(unreadnotifications)
      setNotificationMenuEl(null)
      if (n.content.contentType === 'blog') {
        history.push(`/blogs/${n.content.contentID}`)
      }
      if (n.content.contentType === 'picture') {
        history.push(`/gallery/${n.content.contentID}`)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleReadNotificationClick = (n) => {
    if (n.content.contentType === 'blog') {
      history.push(`/blogs/${n.content.contentID}`)
    }
    if (n.content.contentType === 'picture') {
      history.push(`/gallery/${n.content.contentID}`)
    }
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

  const formatDate = (date) => {
    const d = DateTime.fromISO(date)
    return `${d.weekYear}-${d.month}-${d.day} ${d.hour}:${d.minute}`
  }

  return (
    <div className="main-header-container">
      <div>
        <SearchModal
          open={searchModalOpen}
          closeSearchModal={closeSearchModal}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          allPictures={allPictures}
          allBlogs = {allBlogs}
          allUsers={allUsers}
        ></SearchModal>
      </div>

      <div className="header-title">
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <h1>TravelBlogs</h1>
        </Link>
      </div>
      <div className="header-link-container">
        <Link to="/blogs">
          <div className="header-link">
            <h1>Blogs</h1>
          </div>
        </Link>
        <Link to="/gallery">
          <div className="header-link">
            <h1>Gallery</h1>
          </div>
        </Link>
        <Link to="/explore" style={{ color: 'black' }}>
          <div className="header-link">
            <Language fontSize="large" />
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex' }}>
        <Search
          id="header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        ></Search>
        <div
          className="notification-container"
          onClick={handleNotificationMenuOpen}
        >
          <Notifications id="notifications-bell" />

          {unreadNotifications.length > 0 && (
            <div className="notification-count">
              <div className="notification-number">
                {unreadNotifications.length}
              </div>
            </div>
          )}
        </div>
        <Menu
          anchorEl={notificationMenuEl}
          keepMounted
          open={Boolean(notificationMenuEl)}
          onClose={handleNotificationMenuClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div className="notification-menu-content">
            {userNotifications && userNotifications.length===0 && <div>You don't have any notifications</div>}
            {unreadNotifications.map((n) => (
              <div
                className="unread-notification notification-message"
                onClick={() => handleNotificationMessageClick(n)}
              >
                {n.content.message}
                <div>{formatDate(n.createdAt)}</div>
              </div>
            ))}
            {readNotifications.map((n) => (
              <div
                className="read-notification notification-message"
                onClick={() => handleReadNotificationClick(n)}
              >
                {n.content.message}
                <div>{formatDate(n.createdAt)}</div>
              </div>
            ))}
          </div>
        </Menu>
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img
            src={user.avatar}
            height="40"
            width="40"
            alt="avatar"
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
          to="/createblog"
          style={{
            textDecoration: 'none',
            color: 'black',
          }}
        >
          <MenuItem onClick={handleMenuClose}>Add new blog</MenuItem>
        </Link>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>{' '}
        <MenuItem onClick={handleMenuClose}>
          <Link to="/settings">
            <Settings></Settings>
          </Link>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Header
