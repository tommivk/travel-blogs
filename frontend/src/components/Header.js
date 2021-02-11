/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { Search, Language, Notifications } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
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

  const handleNotificationIconClick = async (n) => {
    try {
      await axios.put(
        `http://localhost:8008/api/notifications/${n.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      const unreadnotifications = unreadNotifications.filter(
        (x) => x.id !== n.id,
      );

      setUnreadNotifications([...unreadnotifications]);

      setNotificationMenuEl(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedTravelBlogUser');
    setUser(null);

    setMenuAnchorEl(null);
    history.push('/');
  };

  const formatDate = (date) => {
    const d = DateTime.fromISO(date);
    return `${d.monthShort} ${d.day} ${d.weekYear} ${d.hour}:${d.minute}`;
  };

  const getNotificationContent = (n) => {
    switch (n.content.contentType) {
      case 'welcome':
        return `Welcome to TravelBlogs ${user.username}`;
      case 'picture':
        return (
          <div>
            New
            {' '}
            <Link className="notification-link" to={`/gallery/${n.content.contentID}`}>picture</Link>
            {' '}
            posted by
            {' '}
            <Link className="notification-link" to={`/users/${n.sender.id}`}>{n.sender.username}</Link>
          </div>
        );
      case 'blog':
        return (
          <div>
            New
            {' '}
            <Link className="notification-link" to={`/blogs/${n.content.contentID}`}>blog</Link>
            {' '}
            posted by
            {' '}
            <Link className="notification-link" to={`/users/${n.sender.id}`}>{n.sender.username}</Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main-header-container">
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

      <div className="header-top-right-icons">
        <Search
          id="header-search-icon"
          onClick={() => setSearchModalOpen(true)}
        />
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
            <ul>
              {unreadNotifications.map((n) => (
                <li>
                  <div
                    className="unread-notification notification-message"
                  >
                    <div className="notification-message-content">
                      {getNotificationContent(n)}
                      {n.createdAt && <div>{formatDate(n.createdAt)}</div>}
                    </div>
                    <CheckCircleOutline onClick={() => handleNotificationIconClick(n)} id="notification-check-icon" />
                  </div>
                </li>
              ))}
            </ul>
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
      <MenuIcon id="burger" onClick={handleMenuOpen} />
      <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Link to="/blogs" id="burger-blogs">
          <MenuItem onClick={handleMenuClose}>Blogs</MenuItem>
        </Link>
        <Link to="/gallery" id="burger-gallery">
          <MenuItem onClick={handleMenuClose}>Gallery</MenuItem>
        </Link>
        <Link to="explore" id="burger-explore">
          <MenuItem onClick={handleMenuClose}>Explore</MenuItem>
        </Link>
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
