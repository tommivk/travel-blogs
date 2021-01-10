/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import queryString from 'query-string';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import Fullscreen from '@material-ui/icons/Fullscreen';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Settings from '@material-ui/icons/Settings';
import Switch from '@material-ui/core/Switch';
import pictureIcon from '../images/photo_camera.svg';
import blogIcon from '../images/message.svg';
import '../styles/worldMap.css';

const PopUp = ({
  selected, handle, type, setActivePopUp,
}) => {
  if (type !== 'blog' && type !== 'image') return null;

  const card = {
    width: '205px',
    height: '300px',
    border: '2px solid black',
    backgroundColor: type === 'image' ? '#191e36' : 'rgb(29, 26, 26)',
    transform: 'translate(5%, -110%)',
    color: 'white',
    textAlign: 'center',
    borderRadius: '5px',
    zIndex: '99999',
  };

  if (type === 'blog') {
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
          type="button"
          className="map-popup-close-button"
          onClick={() => setActivePopUp(null)}
        >
          X
        </button>
      </div>
    );
  }
  return (
    <div>
      <div style={card}>
        <h2>{selected.title}</h2>
        <div style={{ position: 'relative' }}>
          <img src={selected.imgURL} width="200" height="200" alt="" />
          <div
            style={{
              position: 'absolute',
              cursor: 'pointer',
              bottom: '1%',
              right: '2%',
            }}
            onClick={handle.enter}
          >
            <Fullscreen fontSize="large" color="secondary" />
          </div>
        </div>

        <Link to={`/gallery/${selected.id}`}>
          <Button style={{ color: 'white' }}>Open In Gallery</Button>
        </Link>
        <button
          type="button"
          className="map-popup-close-button"
          onClick={() => setActivePopUp(null)}
        >
          X
        </button>
      </div>
    </div>
  );
};

PopUp.propTypes = {
  selected: PropTypes.instanceOf(Object).isRequired,
  handle: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  setActivePopUp: PropTypes.func.isRequired,
};

const ClusterPopUp = ({ content, setClusterContent, handle }) => {
  const blogs = content.filter((c) => c.type === 'blog');
  const pictures = content.filter((c) => c.type === 'picture');

  const card = {
    width: '11vw',
    height: '16vw',
    border: '2px solid black',
    backgroundColor: '#191e36',
    color: 'white',
    textAlign: 'center',
    borderRadius: '5px',
    zIndex: '99999',
    margin: '5px',
  };

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
      <div style={{ position: 'relative', padding: '6px', boxSizing: 'border-box' }}>
        <button id="cluster-close-button" type="button" onClick={() => setClusterContent(null)}>X</button>
        {pictures.length > 0
        && (
        <div>
          <h2 style={{ textAlign: 'center' }}>Pictures</h2>

          <div style={{
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
                  <img src={pic.data.imgURL} width="100%" alt="" />
                  <div
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      bottom: '1%',
                      right: '2%',
                    }}
                    onClick={handle.enter}
                  >
                    <Fullscreen fontSize="large" color="secondary" />
                  </div>
                </div>

                <Link target="_blank" to={`/gallery/${pic.data.id}`}>
                  <Button style={{ color: 'white' }}>Open In Gallery</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
      {blogs.length > 0
      && (
      <div>
        <h2 style={{ textAlign: 'center' }}>Blogs</h2>
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
      )}
    </div>
  );
};

ClusterPopUp.propTypes = {
  content: PropTypes.instanceOf(Array).isRequired,
  setClusterContent: PropTypes.func.isRequired,
  handle: PropTypes.instanceOf(Object).isRequired,
};

const WorldMap = ({
  allBlogs, allPictures, user, setFilteredPictures,
}) => {
  const [blogs, setBlogs] = useState(null);
  const [pictures, setPictures] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserContentOnly, setShowUserContentOnly] = useState(false);
  const [showPictures, setShowPictures] = useState(true);
  const [showBlogs, setShowBlogs] = useState(true);
  const [markerClusterer, setMarkerClusterer] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 59, lng: 30 });
  const [markerData, setMarkerData] = useState(new Map());
  const [mapZoom, setMapZoom] = useState(2);
  const [clusterContent, setClusterContent] = useState(null);
  const [activePopUp, setActivePopUp] = useState({
    data: null,
    type: null,
    blogLocation: null,
  });

  const param = queryString.parse(useLocation().search);
  const handle = useFullScreenHandle();
  const mapRef = useRef(null);

  let picturesWithLocation = pictures
    ? pictures.filter(
      (pic) => pic.location.lat !== null && pic.location.lng !== null,
    )
    : [];

  useEffect(() => {
    setFilteredPictures({ pictures: null, filter: null });
  }, []);

  useEffect(() => {
    setBlogs(allBlogs);
    setPictures(allPictures);
  }, [allBlogs, allPictures]);

  useEffect(() => {
    if (param.lat && param.lng) {
      setMapCenter({ lat: Number(param.lat), lng: Number(param.lng) });
      setMapZoom(10);
    }
  }, [param.lat, param.lng]);

  // eslint-disable-next-line consistent-return
  const getMarkers = () => {
    if (!mapRef.current || !user) return null;

    const markers = [];
    const maps = mapRef.current.maps_;

    if (markerClusterer) {
      const mcCopy = markerClusterer;

      mcCopy.clearMarkers();

      if (maps && picturesWithLocation && showPictures) {
        if (showUserContentOnly) {
          picturesWithLocation = user.pictures
            ? user.pictures.filter(
              (pic) => pic.location.lat !== null && pic.location.lng !== null,
            )
            : [];
        }

        for (let [key, value] of markerData) {
          if (value.type === 'picture') {
            markerData.delete(key);
          }
        }

        picturesWithLocation.map((pic) => {
          const marker = new maps.Marker({
            position: { lat: pic.location.lat, lng: pic.location.lng },
            icon: pictureIcon,
            title: 'Picture',
          });
          maps.event.addListener(marker, 'click', () => setActivePopUp({ data: pic, type: 'image' }));

          setMarkerData(
            new Map(markerData.set(marker, { type: 'picture', data: pic })),
          );
          markers.push(marker);
        });
      }

      if (blogs && showBlogs && maps && markerClusterer) {
        let blogArray = [];
        if (showUserContentOnly) {
          blogArray = user.blogs;
        } else {
          blogArray = blogs;
        }

        for (let [key, value] of markerData) {
          if (value.type === 'blog') {
            markerData.delete(key);
          }
        }

        console.log(blogArray);
        blogArray.map((blog) => blog.locations.map((loc) => {
          const marker = new maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            icon: blogIcon,
            title: 'Blog',
          });

          maps.event.addListener(marker, 'click', () => setActivePopUp({ data: blog, type: 'blog', blogLocation: loc }));
          setMarkerData(
            new Map(markerData.set(marker, { type: 'blog', data: blog })),
          );
          markers.push(marker);
        }));
      }
      mcCopy.addMarkers(markers);
      console.log(markerData.size);

      mapRef.current.maps_.event.clearInstanceListeners(mcCopy);

      mcCopy.addListener('click', (c) => {
        const clusterMarkers = c.getMarkers();
        const content = clusterMarkers.map((m) => markerData.get(m));
        setClusterContent(content);
      });
      setMarkerClusterer(mcCopy);
    }
  };

  useEffect(() => {
    setActivePopUp(null);
    if (mapRef.current) {
      getMarkers();
    }
  }, [showUserContentOnly, showBlogs, showPictures, blogs, pictures]);

  if (!allBlogs || !allPictures || !user || !blogs || !pictures) return null;

  const mapsApiLoaded = (map, maps) => {
    const markers = [];

    picturesWithLocation.map((pic) => {
      const marker = new maps.Marker({
        position: { lat: pic.location.lat, lng: pic.location.lng },
        icon: pictureIcon,
        title: 'Picture',
      });
      maps.event.addListener(marker, 'click', () => setActivePopUp({ data: pic, type: 'image' }));
      markers.push(marker);
      setMarkerData(
        new Map(markerData.set(marker, { type: 'picture', data: pic })),
      );
    });

    blogs.map((blog) => blog.locations.map((loc) => {
      const marker = new maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        icon: blogIcon,
        title: 'Blog',
      });
      maps.event.addListener(marker, 'click', () => setActivePopUp({ data: blog, type: 'blog', blogLocation: loc }));
      setMarkerData(
        new Map(markerData.set(marker, { type: 'blog', data: blog })),
      );
      markers.push(marker);
    }));
    const clusterer = new MarkerClusterer(map, markers, {
      imagePath:
        'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      gridSize: 10,
      minimumClusterSize: 2,
      zoomOnClick: false,
      maxZoom: 15,
    });

    clusterer.addListener('click', (c) => {
      const clusterMarkers = c.getMarkers();
      const content = clusterMarkers.map((m) => markerData.get(m));
      setClusterContent(content);
    });

    setMarkerClusterer(clusterer);
  };

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
          <Settings onClick={() => setShowSettings(!showSettings)} />
        </div>
      </div>

      {showSettings && (
        <div className="map-filter-box">
          <h1>Show</h1>
          <table>
            <tbody>
              <tr>
                <td>
                  My Content Only
                </td>
                <td>
                  <Switch
                    checked={showUserContentOnly}
                    onChange={() => setShowUserContentOnly(!showUserContentOnly)}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Blogs
                </td>
                <td>
                  <Switch
                    checked={showBlogs}
                    onChange={() => setShowBlogs(!showBlogs)}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Pictures
                </td>
                <td>
                  <Switch
                    checked={showPictures}
                    onChange={() => setShowPictures(!showPictures)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {clusterContent && (
        <ClusterPopUp
          content={clusterContent}
          setClusterContent={setClusterContent}
          handle={handle}
        />
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
          />
        )}

        {activePopUp && activePopUp.data && activePopUp.type === 'blog' && (
          <PopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.blogLocation.lat}
            lng={activePopUp.blogLocation.lng}
            type={activePopUp.type}
            setActivePopUp={setActivePopUp}
          />
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
            <img src={activePopUp.data.imgURL} alt="" />
          </div>
        )}
      </FullScreen>
    </div>
  );
};

WorldMap.propTypes = {
  allBlogs: PropTypes.instanceOf(Array).isRequired,
  allPictures: PropTypes.instanceOf(Array).isRequired,
  user: PropTypes.instanceOf(Object).isRequired,
  setFilteredPictures: PropTypes.func.isRequired,
};

export default WorldMap;
