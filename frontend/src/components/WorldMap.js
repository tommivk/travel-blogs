import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Fullscreen from '@material-ui/icons/Fullscreen'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import '../index.css'

const PopUp = ({ selected, handle }) => {
  console.log(selected)

  return (
    <div>
      <div
        style={{
          width: '205px',
          height: '300px',
          border: '2px solid black',
          backgroundColor: 'grey',
          transform: 'translate(5%, -110%)',
        }}
      >
        <h2>{selected.title}</h2>
        <div style={{ position: 'relative' }}>
          <img src={selected.imgURL} width='200' height='200'></img>
          <div
            style={{ position: 'absolute', top: '1%', right: '2%' }}
            onClick={handle.enter}
          >
            <Fullscreen fontSize='large' color='secondary'></Fullscreen>
          </div>
        </div>

        <Link to={`/gallery/${selected.id}`}>
          {' '}
          <Button>Show Image In Gallery</Button>
        </Link>
      </div>
    </div>
  )
}

const WorldMap = ({ allBlogs, allPictures }) => {
  const [activePicture, setActivePicture] = useState(null)
  const handle = useFullScreenHandle()

  console.log(activePicture)

  return (
    <div
      style={{
        height: '90%',
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
      }}
    >
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        }}
        defaultCenter={{ lat: 59, lng: 30 }}
        defaultZoom={2}
      >
        {allBlogs &&
          allBlogs.map((blog) =>
            blog.locations.map((location) => (
              <ChatOutlined
                onClick={() => console.log(blog)}
                lat={location.lat}
                lng={location.lng}
                text='Blog'
                style={{ transform: `translate(0%, -100%)` }}
              ></ChatOutlined>
            ))
          )}

        {allPictures &&
          allPictures.map(
            (image) =>
              image.location && (
                <PhotoCamera
                  onClick={() => setActivePicture(image)}
                  lat={image.location.lat}
                  lng={image.location.lng}
                  text='Photo'
                  key={image.id}
                  style={{ transform: `translate(0%, -100%)` }}
                ></PhotoCamera>
              )
          )}
        {activePicture && (
          <PopUp
            handle={handle}
            selected={activePicture}
            lat={activePicture.location.lat}
            lng={activePicture.location.lng}
          ></PopUp>
        )}
      </GoogleMapReact>

      <FullScreen handle={handle}>
        {activePicture && (
          <img
            src={activePicture.imgURL}
            style={{
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          ></img>
        )}
      </FullScreen>
    </div>
  )
}

export default WorldMap
