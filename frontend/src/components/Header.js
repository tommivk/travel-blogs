/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import { Link, useHistory } from 'react-router-dom';
import { Search, Language, Notifications } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { DateTime } from 'luxon';
import SearchModal from './SearchModal';
import '../styles/header.css';

const Header = ({
  user,
  setUser,
  allPictures,
  allBlogs,
  allUsers,
  userNotifications,
  activePage,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [notificationMenuEl, setNotificationMenuEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [titleActive, setTitleActive] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (userNotifications) {
      const unread = userNotifications.filter((n) => !n.readBy.includes(user.id));
      setUnreadNotifications(unread);
    }
  }, [userNotifications]);

  const closeSearchModal = () => {
    setSearchModalOpen(false);
    setSearchFilter('');
  };

  const handleMenuOpen = (e) => {
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleNotificationMenuOpen = (e) => {
    setNotificationMenuEl(e.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuEl(null);
  };

  const handleNotificationMessageClick = async (n) => {
    try {
      const res = await axios.put(
        `http://localhost:8008/api/notifications/${n.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      console.log(res.data);
      const unreadnotifications = unreadNotifications.filter(
        (x) => x.id !== n.id,
      );

      setUnreadNotifications([...unreadnotifications]);

      setNotificationMenuEl(null);

      if (n.content.contentType === 'blog') {
        history.push(`/blogs/${n.content.contentID}`);
      }
      if (n.content.contentType === 'picture') {
        history.push(`/gallery/${n.content.contentID}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedTravelBlogUser');
    setUser(null);

    firebase
      .auth()
      .signOut()
      .then(() => console.log('signout successful'))
      .catch((error) => console.log('error happened', error));

    setMenuAnchorEl(null);
  };

  const formatDate = (date) => {
    const d = DateTime.fromISO(date);
    return `${d.monthShort} ${d.day} ${d.weekYear} ${d.hour}:${d.minute}`;
  };

  return (
    <div className="main-header-container">
      <div>
        <SearchModal
          open={searchModalOpen}
          closeSearchModal={closeSearchModal}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          allPictures={allPictures}
          allBlogs={allBlogs}
          allUsers={allUsers}
        />
      </div>

      <div className="header-title">
        <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
          <h1>TravelBlogs</h1>
        </Link>
      </div>
      <div className="header-link-container">
        <Link id="header-blogs-link" to="/blogs">
          <div
            className={`header-link ${
              !titleActive && activePage === 'blogs' && 'blogs-page'
            }`}
            onMouseEnter={() => setTitleActive(true)}
            onMouseLeave={() => setTitleActive(false)}
          >
            <h1>BLOGS</h1>
          </div>
        </Link>
        <Link to="/gallery">
          <div
            className={`header-link ${
              !titleActive && activePage === 'gallery' && 'gallery-page'
            }`}
            onMouseEnter={() => setTitleActive(true)}
            onMouseLeave={() => setTitleActive(false)}
          >
            <h1>GALLERY</h1>
          </div>
        </Link>
        <Link to="/explore" style={{ color: 'black' }}>
          <div
            className={`header-link ${
              !titleActive && activePage === 'map' && 'map-page'
            }`}
            onMouseEnter={() => setTitleActive(true)}
            onMouseLeave={() => setTitleActive(false)}
          >
            <Language fontSize="large" />
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex' }}>
        <Search
          id="header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
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
            {unreadNotifications.length === 0 && (
              <div className="no-notifications-message">You don't have any new notifications</div>
            )}
            {unreadNotifications.map((n) => (
              <div
                className="unread-notification notification-message"
                onClick={() => handleNotificationMessageClick(n)}
              >
                {n.content.message}
                {n.createdAt && <div>{formatDate(n.createdAt)}</div>}
              </div>
            ))}
          </div>
        </Menu>
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img
            id="header-user-avatar"
            src={user.avatar}
            height="40"
            width="40"
            alt="avatar"
            style={{ borderRadius: '50%' }}
          />
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
          <MenuItem id="create-new-blog" onClick={handleMenuClose}>Create New Blog</MenuItem>
        </Link>
        <Link
          to={`/users/${user.id}`}
          style={{ textDecoration: 'none', color: 'black' }}
        >
          <MenuItem id="my-page-menulink" onClick={handleMenuClose}>My Page</MenuItem>
        </Link>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

Header.defaultProps = {
  activePage: '',
};

Header.propTypes = {
  user: PropTypes.instanceOf(Object).isRequired,
  setUser: PropTypes.func.isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  allUsers: PropTypes.instanceOf(Array).isRequired,
  userNotifications: PropTypes.instanceOf(Array).isRequired,
  activePage: PropTypes.string,
};

export default Header;
