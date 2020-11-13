import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Container } from '@material-ui/core'

const SinglePicturePage = ({ picture, allPictures }) => {
  console.log('asdASDa')
  console.log(picture)

  if (!picture || !allPictures) return null
  let pictureIndex = allPictures.findIndex((pic) => pic.id === picture.id)
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: '#191e36',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%,0%)',
          backgroundColor: '#231A03',
          paddingBottom: '10px',
          paddingTop: '10px',
          paddingRight: '10px',
          paddingLeft: '10px',
          color: 'white',
          marginTop: '30px',
        }}
      >
        <div
          style={{
            width: '700px',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '15px',
            marginBottom: '5px',
          }}
        >
          <div>
            {pictureIndex - 1 >= 0 && (
              <Link to={`/gallery/${allPictures[pictureIndex - 1].id}`}>
                {' '}
                <button>Previous</button>
              </Link>
            )}
          </div>

          <div>
            <h2 style={{ margin: '0' }}>{picture.title}</h2>
          </div>

          <div>
            {allPictures.length > pictureIndex + 1 && (
              <Link to={`/gallery/${allPictures[pictureIndex + 1].id}`}>
                {' '}
                <button>Next</button>
              </Link>
            )}
          </div>
        </div>
        <div>
          <img src={picture.imgURL} width='700px'></img>
        </div>
      </div>

      <div
        style={{
          height: '40%',
          width: '15%',
          backgroundColor: '#231A03',
          position: 'absolute',
          right: '8%',
          top: '10%',
          color: 'white',
        }}
      >
        uploaded by
      </div>
    </div>
  )
}

export default SinglePicturePage
