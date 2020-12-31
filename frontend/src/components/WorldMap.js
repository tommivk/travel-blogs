import React, { useState, useEffect, useRef } from 'react'
import GoogleMapReact from 'google-map-react'
import queryString from 'query-string'
import MarkerClusterer from '@googlemaps/markerclustererplus'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import Fullscreen from '@material-ui/icons/Fullscreen'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@material-ui/core'
import pictureIcon from '../images/photo_camera.svg'
import blogIcon from '../images/message.svg'
import ChatOutlined from '@material-ui/icons/ChatOutlined'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import Settings from '@material-ui/icons/Settings'
import Switch from '@material-ui/core/Switch'
import '../styles/worldMap.css'

const PopUp = ({ selected, handle, type, setActivePopUp }) => {
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
        <Link to={`/blogs/${selected.id}`}>
          <h3>Read</h3>
        </Link>
        <button
          className="map-popup-close-button"
          onClick={() => setActivePopUp(null)}
        >
          X
        </button>
      </div>
    )
  return (
    <div>
      <div style={card}>
        <h2>{selected.title}</h2>
        <div style={{ position: 'relative' }}>
          <img src={selected.imgURL} width="200" height="200"></img>
          <div
            style={{
              position: 'absolute',
              cursor: 'pointer',
              bottom: '1%',
              right: '2%',
            }}
            onClick={handle.enter}
          >
            <Fullscreen fontSize="large" color="secondary"></Fullscreen>
          </div>
        </div>

        <Link to={`/gallery/${selected.id}`}>
          <Button style={{ color: 'white' }}>Open In Gallery</Button>
        </Link>
        <button
          className="map-popup-close-button"
          onClick={() => setActivePopUp(null)}
        >
          X
        </button>
      </div>
    </div>
  )
}

const ClusterPopUp = ({ content, setClusterContent, handle }) => {
  const blogs = content.filter((c) => c.type === 'blog')
  const pictures = content.filter((c) => c.type === 'picture')

  const card = {
    width: '205px',
    height: '300px',
    border: '2px solid black',
    backgroundColor: '#191e36',
    color: 'white',
    textAlign: 'center',
    borderRadius: '5px',
    zIndex: '99999',
    margin: '5px',
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '50vw',
        height: '60vh',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '10px',
        padding: '10px',
        color: 'white',
        transform: 'translate(-50%, -50%)',
        overflow: 'auto',
        zIndex: 999999,
      }}
    >
      <button onClick={() => setClusterContent(null)}>close</button>
      <h2>Pictures</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
      >
        {pictures.map((pic) => (
          <div style={card} key={pic.data.id}>
            <h3>{pic.data.title}</h3>
            <div style={{ position: 'relative' }}>
              <img src={pic.data.imgURL} width="200" height="200"></img>
              <div
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  bottom: '1%',
                  right: '2%',
                }}
                onClick={handle.enter}
              >
                <Fullscreen fontSize="large" color="secondary"></Fullscreen>
              </div>
            </div>

            <Link to={`/gallery/${pic.data.id}`}>
              <Button style={{ color: 'white' }}>Open In Gallery</Button>
            </Link>
          </div>
        ))}
      </div>
      <h2>Blogs</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-start',
        }}
      >
        {blogs.map((blog) => (
          <div style={card} key={blog.data.id}>
            <h2>{blog.data.title}</h2>
            <p>
              by:
              {blog.data.author.username}
            </p>
            <Link to={`/blogs/${blog.data.id}`}>
              <h3>Read</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

const WorldMap = ({ allBlogs, allPictures, user, setFilteredPictures }) => {
  const [blogs, setBlogs] = useState(allBlogs)
  const [pictures, setPictures] = useState(allPictures)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserContentOnly, setShowUserContentOnly] = useState(false)
  const [showPictures, setShowPictures] = useState(true)
  const [showBlogs, setShowBlogs] = useState(true)
  const [markerClusterer, setMarkerClusterer] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 59, lng: 30 })
  const [markerData, setMarkerData] = useState(new Map())
  const [mapZoom, setMapZoom] = useState(2)
  const [clusterContent, setClusterContent] = useState(null)
  const [activePopUp, setActivePopUp] = useState({
    data: null,
    type: null,
    blogLocation: null,
  })

  const param = queryString.parse(useLocation().search)
  const handle = useFullScreenHandle()
  const mapRef = useRef(null)

  useEffect(() => {
    setFilteredPictures({ pictures: null, filter: null })
  }, [])

  useEffect(() => {
    if (param.lat && param.lng) {
      setMapCenter({ lat: Number(param.lat), lng: Number(param.lng) })
      setMapZoom(10)
    }
  }, [param.lat, param.lng])

  const getMarkers = () => {
    if (!mapRef.current || !user) return null

    let markers = []
    const maps = mapRef.current.maps_

    if (markerClusterer) {
      const mcCopy = markerClusterer

      mcCopy.clearMarkers()

      if (maps && picturesWithLocation && showPictures) {
        if (showUserContentOnly) {
          picturesWithLocation = user.pictures
            ? user.pictures.filter(
                (pic) => pic.location.lat !== null && pic.location.lng !== null
              )
            : []
        }

        for (let [key, value] of markerData) {
          if (value.type === 'picture') {
            markerData.delete(key)
          }
        }

        picturesWithLocation.map((pic) => {
          let marker = new maps.Marker({
            position: { lat: pic.location.lat, lng: pic.location.lng },
            icon: pictureIcon,
            title: 'Picture',
          })
          maps.event.addListener(marker, 'click', () =>
            setActivePopUp({ data: pic, type: 'image' })
          )

          setMarkerData(
            new Map(markerData.set(marker, { type: 'picture', data: pic }))
          )
          markers.push(marker)
        })
      }

      if (blogs && showBlogs && maps && markerClusterer) {
        let blogArray = []

        showUserContentOnly ? (blogArray = user.blogs) : (blogArray = blogs)

        for (let [key, value] of markerData) {
          if (value.type === 'blog') {
            markerData.delete(key)
          }
        }

        console.log(blogArray)
        blogArray.map((blog) =>
          blog.locations.map((loc) => {
            let marker = new maps.Marker({
              position: { lat: loc.lat, lng: loc.lng },
              icon: blogIcon,
              title: 'Blog',
            })

            maps.event.addListener(marker, 'click', () =>
              setActivePopUp({ data: blog, type: 'blog', blogLocation: loc })
            )
            setMarkerData(
              new Map(markerData.set(marker, { type: 'blog', data: blog }))
            )
            markers.push(marker)
          })
        )
      }
      mcCopy.addMarkers(markers)
      console.log(markerData.size)

      mapRef.current.maps_.event.clearInstanceListeners(mcCopy)

      mcCopy.addListener('click', (c) => {
        const markers = c.getMarkers()
        const content = markers.map((m) => markerData.get(m))
        setClusterContent(content)
      })
      setMarkerClusterer(mcCopy)
    }
  }

  useEffect(() => {
    setActivePopUp(null)
    if (mapRef.current) {
      getMarkers()
    }
  }, [showUserContentOnly, showBlogs, showPictures])

  if (!allBlogs || !allPictures || !user || !blogs) return null

  let picturesWithLocation = pictures
    ? pictures.filter(
        (pic) => pic.location.lat !== null && pic.location.lng !== null
      )
    : []

  const mapsApiLoaded = (map, maps) => {
    let markers = []

    picturesWithLocation.map((pic) => {
      let marker = new maps.Marker({
        position: { lat: pic.location.lat, lng: pic.location.lng },
        icon: pictureIcon,
        title: 'Picture',
      })
      maps.event.addListener(marker, 'click', () =>
        setActivePopUp({ data: pic, type: 'image' })
      )
      markers.push(marker)
      setMarkerData(
        new Map(markerData.set(marker, { type: 'picture', data: pic }))
      )
    })

    blogs.map((blog) =>
      blog.locations.map((loc) => {
        let marker = new maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          icon: blogIcon,
          title: 'Blog',
        })
        maps.event.addListener(marker, 'click', () =>
          setActivePopUp({ data: blog, type: 'blog', blogLocation: loc })
        )
        setMarkerData(
          new Map(markerData.set(marker, { type: 'blog', data: blog }))
        )
        markers.push(marker)
      })
    )
    const clusterer = new MarkerClusterer(map, markers, {
      imagePath:
        'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      gridSize: 10,
      minimumClusterSize: 2,
      zoomOnClick: false,
      maxZoom: 15,
    })

    clusterer.addListener('click', (c) => {
      const markers = c.getMarkers()
      const content = markers.map((m) => markerData.get(m))
      setClusterContent(content)
    })

    setMarkerClusterer(clusterer)
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
      <div className="map-settings">
        <div className={`${!showSettings && 'tooltip tooltip-right'}`}>
          <span className="tooltip-message">Settings</span>
          <Settings onClick={() => setShowSettings(!showSettings)}></Settings>
        </div>
      </div>

      {showSettings && (
        <div className="map-filter-box">
          <div>
            Show My Own Content Only
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

      {clusterContent && (
        <ClusterPopUp
          content={clusterContent}
          setClusterContent={setClusterContent}
          handle={handle}
        ></ClusterPopUp>
      )}
      <GoogleMapReact
        options={{ gestureHandling: 'greedy' }}
        bootstrapURLKeys={{
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        }}
        defaultCenter={{ lat: mapCenter.lat, lng: mapCenter.lng }}
        defaultZoom={mapZoom}
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
            setActivePopUp={setActivePopUp}
          ></PopUp>
        )}

        {activePopUp && activePopUp.data && activePopUp.type === 'blog' && (
          <PopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.blogLocation.lat}
            lng={activePopUp.blogLocation.lng}
            type={activePopUp.type}
            setActivePopUp={setActivePopUp}
          ></PopUp>
        )}
      </GoogleMapReact>

      <FullScreen handle={handle}>
        {activePopUp && activePopUp.type === 'image' && (
          <div
            style={{
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={activePopUp.data.imgURL}></img>
          </div>
        )}
      </FullScreen>
    </div>
  )
}

export default WorldMap
