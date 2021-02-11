import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Button, TextField } from '@material-ui/core';
import '../styles/signup.css';

const SignUp = ({
  handleMessage, closeModal, allUsers, setAllUsers,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8008/api/users', {
        username,
        password,
      });
      console.log(response);
      setAllUsers(allUsers.concat(response.data));
      setUsername('');
      setPassword('');
      handleMessage('success', 'Signed Up Successfully');
      closeModal();
    } catch (error) {
      handleMessage('error', error.response.data.message);
      console.log(error.response.data);
    }
  };

  return (
    <div className="signup-form">
      <h2>Sign up</h2>
      <form onSubmit={handleSignup}>
        <div className="signup-input-container">
          <div className="signup-username-wrapper">
            <TextField
              autoFocus
              id="signup-username-textfield"
              variant="outlined"
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div className="signup-password-wrapper">
            <TextField
              id="signup-password-textfield"
              placeholder="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
        </div>
        <Button id="signup-form-button" type="submit" color="primary" variant="contained">
          Sign up
        </Button>
      </form>
    </div>
  );
};

SignUp.propTypes = {
  handleMessage: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setAllUsers: PropTypes.func.isRequired,
  allUsers: PropTypes.instanceOf(Array).isRequired,
};

export default SignUp;
