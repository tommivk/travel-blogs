import React from 'react'
import { Link } from 'react-router-dom'

const Gallery = ({ allPictures }) => {
  if (!allPictures) return null
  return (
    <div>
      {allPictures.map((pic, i) => (
        <Link to={`/gallery/${pic.id}`}>
          <img src={pic.imgURL} height='200' width='200'></img>
        </Link>
      ))}
    </div>
  )
}

export default Gallery
