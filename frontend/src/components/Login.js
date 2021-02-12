import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Button, TextField } from '@material-ui/core';
import '../styles/login.css';

const Login = ({ setUser, handleMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await axios.post('http://localhost:8008/api/login', {
        username,
        password,
      });
      setUsername('');
      setPassword('');
      setUser(user.data);
      window.localStorage.setItem(
        'loggedTravelBlogUser',
        JSON.stringify(user.data),
      );
      handleMessage('success', `Logged in as ${user.data.username}`);
    } catch (error) {
      handleMessage('error', error.response.data.error);
    }
  };
  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="login-input-container">
          <div className="login-username-wrapper">
            <TextField
              autoFocus
              id="login-username-textfield"
              variant="outlined"
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div className="login-password-wrapper">
            <TextField
              id="login-password-textfield"
              placeholder="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
        </div>
        <Button id="login-form-button" type="submit" color="primary" variant="contained">
          Login
        </Button>
      </form>
    </div>
  );
};

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default Login;
