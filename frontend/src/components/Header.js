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

const Header = ({ user, setUser }) => {
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid black',
        marginBottom: '10px',
      }}
    >
      <div>
        <Link to='/' style={{ textDecoration: 'none', color: 'black' }}>
          <h2 style={{ marginLeft: '10px' }}>TITLE</h2>
        </Link>
      </div>
      <div style={{ margin: 'auto', display: 'flex' }}>
        <Paper component='form' style={{ paddingLeft: '10px' }}>
          <InputBase
            variant='outlined'
            size='small'
            placeholder='Search...'
          ></InputBase>
          <IconButton>
            <Search />
          </IconButton>
        </Paper>
        <div style={{ margin: 'auto', paddingLeft: '20px', cursor: 'pointer' }}>
          <Link to='/gallery'>
            <Photo fontSize='large' style={{ color: 'black' }}></Photo>
          </Link>
          <Link to='/explore' style={{ color: 'black' }}>
            <Language fontSize='large' />
          </Link>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <Notifications fontSize='large' style={{ margin: 'auto' }} />
        <div
          style={{ margin: '10px', cursor: 'pointer' }}
          onClick={handleMenuOpen}
        >
          <img src={user.avatar} height='50' width='50' alt='avatar'></img>
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
