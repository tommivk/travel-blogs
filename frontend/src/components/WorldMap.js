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
import { useLocation } from 'react-router-dom';
import Settings from '@material-ui/icons/Settings';
import Switch from '@material-ui/core/Switch';
import pictureIcon from '../images/photo_camera.svg';
import blogIcon from '../images/message.svg';
import MapClusterPopUp from './MapClusterPopUp';
import MapPopUp from './MapPopUp';
import '../styles/worldMap.css';

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
  const [fullScreenImage, setFullScreenImage] = useState(null);
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
    document.title = 'Explore | TravelBlogs';
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

        const pictureMarker = {
          url: pictureIcon,
          size: new maps.Size(24, 24),
          origin: new maps.Point(0, 0),
          anchor: new maps.Point(0, 24),
        };

        picturesWithLocation.map((pic) => {
          const marker = new maps.Marker({
            position: { lat: pic.location.lat, lng: pic.location.lng },
            icon: pictureMarker,
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
        if (showUserContentOnly && user && user.blogs) {
          blogArray = user.blogs;
        } else {
          blogArray = blogs;
        }

        for (let [key, value] of markerData) {
          if (value.type === 'blog') {
            markerData.delete(key);
          }
        }

        const blogMarker = {
          url: blogIcon,
          size: new maps.Size(24, 24),
          origin: new maps.Point(0, 0),
          anchor: new maps.Point(0, 24),
        };

        blogArray.map((blog) => blog.locations.map((loc) => {
          const marker = new maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            icon: blogMarker,
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

    const pictureMarker = {
      url: pictureIcon,
      size: new maps.Size(24, 24),
      origin: new maps.Point(0, 0),
      anchor: new maps.Point(0, 24),
    };

    picturesWithLocation.map((pic) => {
      const marker = new maps.Marker({
        position: { lat: pic.location.lat, lng: pic.location.lng },
        icon: pictureMarker,
        title: 'Picture',
      });
      maps.event.addListener(marker, 'click', () => setActivePopUp({ data: pic, type: 'image' }));
      markers.push(marker);
      setMarkerData(
        new Map(markerData.set(marker, { type: 'picture', data: pic })),
      );
    });

    const blogMarker = {
      url: blogIcon,
      size: new maps.Size(24, 24),
      origin: new maps.Point(0, 0),
      anchor: new maps.Point(0, 24),
    };

    blogs.map((blog) => blog.locations.map((loc) => {
      const marker = new maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        icon: blogMarker,
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
      gridSize: 20,
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
        <MapClusterPopUp
          content={clusterContent}
          setClusterContent={setClusterContent}
          handle={handle}
          setActivePopUp={setActivePopUp}
          setFullScreenImage={setFullScreenImage}
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
        { activePopUp && activePopUp.data && activePopUp.type === 'image' && (
          <MapPopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.data.location.lat}
            lng={activePopUp.data.location.lng}
            type={activePopUp.type}
            setActivePopUp={setActivePopUp}
            setFullScreenImage={setFullScreenImage}
          />
        )}

        { activePopUp && activePopUp.data && activePopUp.type === 'blog' && (
          <MapPopUp
            handle={handle}
            selected={activePopUp.data}
            lat={activePopUp.blogLocation.lat}
            lng={activePopUp.blogLocation.lng}
            type={activePopUp.type}
            setActivePopUp={setActivePopUp}
            setFullScreenImage={setFullScreenImage}
          />
        )}
      </GoogleMapReact>

      <FullScreen handle={handle}>
        {fullScreenImage && (
          <div
            className="fullscreen-container"
          >
            <img src={fullScreenImage} alt="" />
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
