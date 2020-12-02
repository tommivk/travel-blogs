import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Fullscreen from '@material-ui/icons/Fullscreen'
import Explore from '@material-ui/icons/Explore'
import Image from '@material-ui/icons/Image'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import '../styles/singlePicturePage.css'

const API_KEY = process.env.REACT_APP_GOOGLE_MAP_API_KEY
const GEO_API_KEY = process.env.REACT_APP_GEOCODE_API_KEY

const CommentForm = ({
  picture,
  user,
  setPicture,
  allPictures,
  setAllPictures,
}) => {
  const [comment, setComment] = useState('')

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    const newComment = {
      content: comment,
    }
    try {
      const response = await axios.post(
        `http://localhost:8008/api/pictures/${picture.id}/comment`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      setPicture(response.data)
      setComment('')
      const filteredPictures = allPictures.map((pic) =>
        pic.id === picture.id ? response.data : pic
      )
      setAllPictures(filteredPictures)
      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <form onSubmit={handleCommentSubmit}>
        <input
          type='text'
          value={comment}
          onChange={({ target }) => setComment(target.value)}
        ></input>
        <button>Send</button>
      </form>
    </div>
  )
}

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
    if (picture && picture.location.lat && picture.location.lng) {
      const lat = picture.location.lat.toFixed(6)
      const lng = picture.location.lng.toFixed(6)
      setMapImage(
        `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=11&size=700x400&markers=color:red|${lat},${lng}&key=${API_KEY}`
      )

      try {
        const result = await axios.get(
          `https://eu1.locationiq.com/v1/reverse.php?key=${GEO_API_KEY}&lat=${lat}&lon=${lng}&format=json`
        )
        console.log(result.data)
        setLocationData(result.data)
      } catch (error) {
        console.log(error)
      }
    } else {
      setMapImage(null)
      setLocationData(null)
    }
  }, [picture])

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
      setPicture(response.data)

      const filteredPictures = await allPictures.map((pic) =>
        pic.id === picture.id ? response.data : pic
      )
      setAllPictures(filteredPictures)
    } catch (error) {
      console.log(error.message)
    }
  }

  const handleVoteDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8008/api/pictures/${picture.id}/vote`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

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

  const userVote = picture.votes.find(
    (vote) => vote.user.username === user.username
  )

  let pictureIndex = allPictures.findIndex((pic) => pic.id === picture.id)

  return (
    <div
      style={{
        minHeight: '94vh',
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
          <div>
            <img src={mapImage} width='700px' height='400px'></img>
            {locationData && (
              <p>
                {locationData.address.city} {locationData.address.country}{' '}
                {locationData.address.postcode}
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={picture.imgURL} width='700px'></img>
            <div style={{ alignSelf: 'flex-end' }}>
              <Fullscreen
                id='picture-fullscreen-button'
                onClick={pictureHandle.enter}
              ></Fullscreen>
            </div>
          </div>
        )}
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
            <ArrowUpward onClick={() => handleVoteDelete()}></ArrowUpward>
          ) : null}
          {!userVote && (
            <ArrowUpward onClick={() => handleVote(1)}></ArrowUpward>
          )}
        </div>{' '}
        <div>{picture.voteResult}</div>
        <div>
          {userVote && userVote.dir === -1 ? (
            <ArrowDownward onClick={() => handleVoteDelete()}></ArrowDownward>
          ) : null}
          {!userVote && (
            <ArrowDownward onClick={() => handleVote(-1)}></ArrowDownward>
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
          {/* <h4>Uploaded:</h4> {monthNames[date.getMonth()]} {date.getDate()} */}
        </div>
        <div>votes: {picture.votes.length}</div>
      </div>

      <FullScreen handle={pictureHandle}>
        <div className='fullscreen-image'>
          <img src={picture.imgURL}></img>
        </div>
      </FullScreen>
      <div>
        <CommentForm
          user={user}
          picture={picture}
          setPicture={setPicture}
          allPictures={allPictures}
          setAllPictures={setAllPictures}
        ></CommentForm>
        <ul>
          {picture.comments.map((comment) => (
            <li>
              {comment.user.username}: {comment.content}
            </li>
          ))}
        </ul>
      </div>
      <div className='picture-list-container'>
        {allPictures.map((pic) => (
          <div className='picture-list-picture-box'>
            {pic.id === picture.id ? (
              <div className='picture-list-active-image'>
                <img src={pic.imgURL}></img>
              </div>
            ) : (
              <Link to={`/gallery/${pic.id}`}>
                <div>
                  <img src={pic.imgURL}></img>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SinglePicturePage
