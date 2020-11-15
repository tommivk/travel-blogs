import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Fullscreen from '@material-ui/icons/Fullscreen'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import '../index.css'

const PopUp = ({ selected, handle, type }) => {
  console.log(selected)
  console.log(type)
  if (type !== 'blog' && type !== 'image') return null

  const card = {
    width: '205px',
    height: '300px',
    border: '2px solid black',
    backgroundColor: type === 'image' ? '#191e36' : 'darkred',
    transform: 'translate(5%, -110%)',
    color: 'white',
    textAlign: 'center',
    borderRadius: '5px',
  }

  if (type === 'blog')
    return (
      <div style={card}>
        <h1>{selected.title}</h1>

        <p>
          by:
          {selected.author.username}
        </p>

        <p>{selected.date}</p>
        <Link to={`/blogs/${selected.id}`}>
          <h3>Read</h3>
        </Link>
      </div>
    )
  return (
    <div>
      <div style={card}>
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
          <Button>Open In Gallery</Button>
        </Link>
      </div>
    </div>
  )
}

const WorldMap = ({ allBlogs, allPictures }) => {
  const [activePopUp, setActivePopUp] = useState({
    data: null,
    type: null,
    blogLocation: null,
  })
  const handle = useFullScreenHandle()

  console.log(activePopUp)

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
                onClick={() =>
                  setActivePopUp({
                    data: blog,
                    type: 'blog',
                    blogLocation: location,
                  })
                }
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
                  onClick={() => setActivePopUp({ data: image, type: 'image' })}
                  lat={image.location.lat}
                  lng={image.location.lng}
                  text='Photo'
                  key={image.id}
                  style={{ transform: `translate(0%, -100%)` }}
                ></PhotoCamera>
              )
          )}

        {activePopUp && activePopUp.data && activePopUp.type === 'image' && (
          <PopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.data.location.lat}
            lng={activePopUp.data.location.lng}
            type={activePopUp.type}
          ></PopUp>
        )}

        {activePopUp && activePopUp.data && activePopUp.type === 'blog' && (
          <PopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.blogLocation.lat}
            lng={activePopUp.blogLocation.lng}
            type={activePopUp.type}
          ></PopUp>
        )}
      </GoogleMapReact>

      <FullScreen handle={handle}>
        {activePopUp && activePopUp.type === 'image' && (
          <img
            src={activePopUp.data.imgURL}
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
