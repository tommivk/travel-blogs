import React, { useState, useEffect, useRef } from 'react'
import GoogleMapReact from 'google-map-react'
import MarkerClusterer from '@googlemaps/markerclustererplus'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import Fullscreen from '@material-ui/icons/Fullscreen'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import pictureIcon from '../images/photo_camera.svg'
import blogIcon from '../images/message.svg'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Settings from '@material-ui/icons/Settings'
import Switch from '@material-ui/core/Switch'
import '../styles/worldMap.css'

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
    zIndex: '99999',
  }

  if (type === 'blog')
    return (
      <div style={card}>
        <h1>{selected.title}</h1>

        <p>
          by:
          {selected.author.username}
        </p>

        {/* <p>{selected.date}</p> */}
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
          <img src={selected.imgURL} width="200" height="200"></img>
          <div
            style={{ position: 'absolute', top: '1%', right: '2%' }}
            onClick={handle.enter}
          >
            <Fullscreen fontSize="large" color="secondary"></Fullscreen>
          </div>
        </div>

        <Link to={`/gallery/${selected.id}`}>
          <Button>Open In Gallery</Button>
        </Link>
      </div>
    </div>
  )
}

const WorldMap = ({ allBlogs, allPictures, user }) => {
  const [blogs, setBlogs] = useState(allBlogs)
  const [pictures, setPictures] = useState(allPictures)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserContentOnly, setShowUserContentOnly] = useState(false)
  const [showPictures, setShowPictures] = useState(true)
  const [showBlogs, setShowBlogs] = useState(true)
  const [activePopUp, setActivePopUp] = useState({
    data: null,
    type: null,
    blogLocation: null,
  })

  const handle = useFullScreenHandle()
  const mapRef = useRef(null)
  useEffect(() => {
    if (user) {
      if (showUserContentOnly) {
        setPictures(user.pictures)
        setBlogs(user.blogs)
      } else {
        setPictures(allPictures)
        setBlogs(allBlogs)
      }
    }
  }, [showUserContentOnly, showBlogs, showPictures])

  console.log(blogs, pictures)
  console.log(showUserContentOnly)
  if (!allBlogs || !allPictures || !user) return null
  console.log(user)

  console.log(pictures)

  const picturesWithLocation = pictures
    ? pictures.filter(
        (pic) => pic.location.lat !== null && pic.location.lng !== null
      )
    : []

  const mapsApiLoaded = (map, maps) => {}

  const getMarkers = () => {
    console.log(picturesWithLocation)
    console.log(blogs)
    let markers = []
    if (picturesWithLocation && showPictures) {
      markers = picturesWithLocation.map((pic) => {
        let marker = (
          <PhotoCamera
            lat={pic.location.lat}
            lng={pic.location.lng}
            onClick={() => setActivePopUp({ data: pic, type: 'image' })}
          ></PhotoCamera>
        )
        return marker
      })
    }
    if (blogs && showBlogs) {
      blogs.map((blog) =>
        blog.locations.map((loc) => {
          let marker = (
            <ChatOutlined
              lat={loc.lat}
              lng={loc.lng}
              onClick={() =>
                setActivePopUp({ data: blog, type: 'blog', blogLocation: loc })
              }
            ></ChatOutlined>
          )
          markers.push(marker)
        })
      )
    }
    return markers
  }

  return (
    <div
      style={{
        height: '94vh',
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
      }}
    >
      <Settings
        id="settings-gear-icon"
        onClick={() => setShowSettings(!showSettings)}
      ></Settings>
      {showSettings && (
        <div className="map-filter-box">
          <div>
            Show My Content Only
            <Switch
              checked={showUserContentOnly}
              onChange={() => setShowUserContentOnly(!showUserContentOnly)}
            ></Switch>
          </div>
          <div>
            Show blogs
            <Switch
              checked={showBlogs}
              onChange={() => setShowBlogs(!showBlogs)}
            ></Switch>
          </div>
          <div>
            Show pictures
            <Switch
              checked={showPictures}
              onChange={() => setShowPictures(!showPictures)}
            ></Switch>
          </div>
        </div>
      )}
      <GoogleMapReact
        options={{ gestureHandling: 'greedy' }}
        bootstrapURLKeys={{
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        }}
        defaultCenter={{ lat: 59, lng: 30 }}
        defaultZoom={2}
        ref={mapRef}
        onGoogleApiLoaded={({ map, maps }) => mapsApiLoaded(map, maps)}
        yesIWantToUseGoogleMapApiInternals
      >
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

        {getMarkers()}
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
