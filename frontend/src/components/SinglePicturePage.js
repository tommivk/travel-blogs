import React from 'react'
import { Link } from 'react-router-dom'
const SinglePicturePage = ({ picture, allPictures }) => {
  console.log('asdASDa')
  console.log(picture)

  if (!picture || !allPictures) return null
  let x = allPictures.findIndex((pic) => pic.id === picture.id)
  return (
    <div>
      {x - 1 >= 0 && (
        <Link to={`/gallery/${allPictures[x - 1].id}`}>
          {' '}
          <button>Previous</button>
        </Link>
      )}
      <img src={picture.imgURL}></img>

      {allPictures.length > x + 1 && (
        <Link to={`/gallery/${allPictures[x + 1].id}`}>
          {' '}
          <button>Next</button>
        </Link>
      )}
    </div>
  )
}

export default SinglePicturePage
