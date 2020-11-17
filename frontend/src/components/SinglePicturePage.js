import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Container } from '@material-ui/core'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Fullscreen from '@material-ui/icons/Fullscreen'
import Explore from '@material-ui/icons/Explore'
import Image from '@material-ui/icons/Image'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import '../styles/singlePicturePage.css'

const API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const SinglePicturePage = ({
  user,
  picture,
  allPictures,
  setPicture,
  setAllPictures,
}) => {
  const [mapImage, setMapImage] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [locationData, setLocationData] = useState(null)
  const pictureHandle = useFullScreenHandle()

  useEffect(async () => {
    setShowMap(false)
    setLocationData(null)
    if (picture && picture.location) {
      const lat = picture.location.lat.toFixed(6)
      const lng = picture.location.lng.toFixed(6)
      setMapImage(
        `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=11&size=700x400&markers=color:red|${lat},${lng}&key=${API_KEY}`
      )

      try {
        const result = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        )
        console.log(result)

        setLocationData(result.data)
      } catch (error) {
        console.log(error)
      }
    } else {
      setMapImage(null)
    }
  }, [picture])

  console.log(picture)
  console.log(locationData)
  const handleVote = async (direction) => {
    try {
      const response = await axios.put(
        `http://localhost:8008/api/pictures/${picture.id}/vote`,
        { dir: direction },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      console.log(response.data)
      setPicture(response.data)

      const filteredPictures = await allPictures.map((pic) =>
        pic.id === picture.id ? response.data : pic
      )
      setAllPictures(filteredPictures)
    } catch (error) {
      console.log(error.message)
    }
  }

  if (!picture || !allPictures) return null

  const date = new Date(picture.date)

  const userVote = picture.votes.find(
    (vote) => vote.user.username === user.username
  )

  let pictureIndex = allPictures.findIndex((pic) => pic.id === picture.id)
  return (
    <div
      style={{
        height: 'fit-content',
        minHeight: '100%',
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
          paddingTop: '10px',
          paddingRight: '10px',
          paddingLeft: '10px',
          color: 'white',
          marginTop: '30px',
          height: 'fit-content',
          minHeight: '500px',
          paddingBottom: '5%',
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
                <Button color='primary' variant='contained'>
                  Previous
                </Button>
              </Link>
            )}
          </div>

          <div>
            <h2 style={{ margin: '0', textAlign: 'center' }}>
              {picture.title}
            </h2>
          </div>

          <div>
            {allPictures.length > pictureIndex + 1 && (
              <Link to={`/gallery/${allPictures[pictureIndex + 1].id}`}>
                {' '}
                <Button color='primary' variant='contained'>
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>

        {showMap ? (
          <div style={{ maxHeight: '400px' }}>
            <img src={mapImage} width='700px'></img>
            {locationData && (
              <p>
                {locationData.city} {locationData.countryName}{' '}
                {locationData.postcode}
              </p>
            )}
          </div>
        ) : (
          <img src={picture.imgURL} width='700px'></img>
        )}

        <div style={{ position: 'absolute', bottom: '0px', right: '0px' }}>
          <Fullscreen
            fontSize='small'
            onClick={pictureHandle.enter}
          ></Fullscreen>
        </div>
      </div>

      {mapImage && !showMap && (
        <div className='image-toggle-button'>
          <Explore fontSize='large' onClick={() => setShowMap(true)}></Explore>
        </div>
      )}
      {showMap && (
        <div className='image-toggle-button'>
          <Image fontSize='large' onClick={() => setShowMap(false)}></Image>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '25%',
          color: 'white',
          left: '26%',
          width: '3%',
          height: '12%',
          backgroundColor: '#231A03',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <div>
          {userVote && userVote.dir === 1 ? (
            <ArrowUpward onClick={() => handleVote(1)}></ArrowUpward>
          ) : (
            <ArrowUpward
              onClick={() => handleVote(1)}
              style={{ fill: 'black' }}
            ></ArrowUpward>
          )}
        </div>{' '}
        <div>{picture.voteResult}</div>
        <div>
          {userVote && userVote.dir === -1 ? (
            <ArrowDownward onClick={() => handleVote(-1)}></ArrowDownward>
          ) : (
            <ArrowDownward
              onClick={() => handleVote(-1)}
              style={{ fill: 'black' }}
            ></ArrowDownward>
          )}
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
          textAlign: 'center',
          borderRadius: '4%',
        }}
      >
        <div style={{ margin: '4%' }}>
          <img src={picture.user.avatar} width='70%'></img> 
        </div>
        <div>
          <Link to={`/users/${picture.user.id}`}>
            <h2>{picture.user.username}</h2>
          </Link>
        </div>
        <div>
          <h4>Uploaded:</h4> {monthNames[date.getMonth()]} {date.getDate()}
        </div>
        <div>votes: {picture.votes.length}</div>
      </div>

      <FullScreen handle={pictureHandle}>
        <div className='fullscreen-image'>
          <img src={picture.imgURL}></img>
        </div>
      </FullScreen>
    </div>
  )
}

export default SinglePicturePage
