import React from 'react'
import GoogleMapReact from 'google-map-react'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'

const WorldMap = ({ allBlogs, allPictures }) => {
  console.log(allPictures)
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
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
                  onClick={() => console.log(image)}
                  lat={image.location.lat}
                  lng={image.location.lng}
                  text='Photo'
                  key={image.id}
                  style={{ transform: `translate(0%, -100%)` }}
                ></PhotoCamera>
              )
          )}
      </GoogleMapReact>
    </div>
  )
}

export default WorldMap
