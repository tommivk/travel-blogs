import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'

const PopUp = ({ selected }) => {
  console.log(selected)
  return (
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
      <img src={selected.imgURL} width='200' height='200'></img>
      <Link to={`/gallery/${selected.id}`}>
        {' '}
        <Button>Show Image In Gallery</Button>
      </Link>
    </div>
  )
}

const WorldMap = ({ allBlogs, allPictures }) => {
  const [activePopUp, setActivePopUp] = useState(null)

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
                  onClick={() => setActivePopUp(image)}
                  lat={image.location.lat}
                  lng={image.location.lng}
                  text='Photo'
                  key={image.id}
                  style={{ transform: `translate(0%, -100%)` }}
                ></PhotoCamera>
              )
          )}
        {activePopUp && (
          <PopUp
            selected={activePopUp}
            lat={activePopUp.location.lat}
            lng={activePopUp.location.lng}
          ></PopUp>
        )}
      </GoogleMapReact>
    </div>
  )
}

export default WorldMap
