import React, { useState } from 'react'
import axios from 'axios'
import { Button, TextField } from '@material-ui/core'

const SignUp = ({ handleMessage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8008/api/users', {
        username,
        password,
      })
      setUsername('')
      setPassword('')
      handleMessage('success', 'Signed Up Successfully')
    } catch (error) {
      handleMessage('error', error.response.data.message)
      console.log(error.response.data)
    }
  }

  return (
    <div>
      <form onSubmit={handleSignup}>
        <TextField
          id='outlined-textarea'
          variant='outlined'
          type='text'
          label='Username'
          autoComplete='off'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        ></TextField>
        <br></br>
        <TextField
          id='outlined-textarea'
          label='Password'
          variant='outlined'
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        ></TextField>
        <br></br>
        <Button type='submit' color='primary' variant='contained'>
          Sign up
        </Button>
      </form>
    </div>
  )
}

export default SignUp
