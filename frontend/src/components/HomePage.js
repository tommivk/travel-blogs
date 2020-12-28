import React from 'react'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { Button } from '@material-ui/core'
import '../styles/homePage.css'


const HomePage = ({ allBlogs, allPictures }) => {
  if (allBlogs == null) return null
  return (
    <div className='homepage-main-container'>
    </div>
  )
}

export default HomePage
