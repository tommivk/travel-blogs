import React from 'react'
import GoogleMapReact from 'google-map-react'
import ChatOutlined from '@material-ui/icons/ChatOutlined'

const WorldMap = ({ allBlogs }) => {
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
        defaultZoom={0}
      >
        {allBlogs &&
          allBlogs.map((blog) =>
            blog.locations.map((location) => (
              <ChatOutlined
                lat={location.lat}
                lng={location.lng}
                text='Blog'
              ></ChatOutlined>
            ))
          )}
      </GoogleMapReact>
    </div>
  )
}

export default WorldMap
