import React, { useEffect, useState, useRef } from 'react'
import queryString from 'query-string'
import ImageUploadModal from './ImageUploadModal'
import { Link, useLocation } from 'react-router-dom'
import { Button, Container, Select, MenuItem } from '@material-ui/core'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import Sms from '@material-ui/icons/Sms'
import '../styles/gallery.css'

const Gallery = ({
  allPictures,
  setAllPictures,
  user,
  setUser,
  storage,
  handleMessage,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [pictures, setPictures] = useState(null)
  const param = queryString.parse(useLocation().search)
  const [sortBy, setSortBy] = useState('Newest')

  useEffect(() => {
    setPictures(allPictures)

    if (allPictures) {
      let sortedPictures = allPictures.slice()
      switch (sortBy) {
        case 'Newest':
          sortedPictures.sort((a, b) => {
            if (a.date < b.date) {
              return 1
            }
            if (a.date > b.date) {
              return -1
            }
            return 0
          })
          setPictures(sortedPictures)
          break
        case 'Best':
          sortedPictures.sort((a, b) => {
            if (a.voteResult < b.voteResult) {
              return 1
            }
            if (a.voteResult > b.voteResult) {
              return -1
            }
            return 0
          })
          setPictures(sortedPictures)
          break
        case 'Oldest':
          sortedPictures.sort((a, b) => {
            if (a.date > b.date) {
              return 1
            }
            if (a.date < b.date) {
              return -1
            }
            return 0
          })
          setPictures(sortedPictures)
          break
        default:
          break
      }
    }

    if (param.city && allPictures) {
      console.log(param)
      const picturesWithCity = allPictures.filter(
        (p) => p.location.city !== null
      )
      const filteredPics = picturesWithCity.filter(
        (p) => p.location.city.toLowerCase() === param.city.toLowerCase()
      )

      setPictures(filteredPics)
    }

    if (param.country && allPictures) {
      console.log(param)
      const picturesWithCountry = allPictures.filter(
        (p) => p.location.country !== null
      )
      const filteredPics = picturesWithCountry.filter(
        (p) => p.location.country.toLowerCase() === param.country.toLowerCase()
      )

      setPictures(filteredPics)
    }
  }, [param.country, param.city, allPictures, sortBy])

  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }

  if (!pictures) return null
  console.log(pictures)
  return (
    <div style={{ backgroundColor: '#14182b', height: '94vh' }}>
      <ImageUploadModal
        uploadModalOpen={uploadModalOpen}
        closeModal={closeUploadModal}
        user={user}
        setUser={setUser}
        storage={storage}
        allPictures={allPictures}
        setAllPictures={setAllPictures}
        handleMessage={handleMessage}
      ></ImageUploadModal>
      <div>
        <Button
          style={{ float: 'right' }}
          variant='contained'
          color='primary'
          onClick={() => setUploadModalOpen(true)}
        >
          upload images
        </Button>
      </div>
      <Container maxWidth='lg'>
        <div style={{ textAlign: 'center' }}></div>
        {param.country && (
          <h1 style={{ color: 'white', marginTop: '0px' }}>
            Images from {param.country}
          </h1>
        )}
        {param.city && (
          <h1 style={{ color: 'white', marginTop: '0px' }}>
            Images from {param.city}
          </h1>
        )}
        <div className='gallery-filter-selection'>
          <Select
            style={{ color: 'white' }}
            onChange={({ target }) => setSortBy(target.value)}
            value={sortBy}
          >
            <MenuItem value={'Best'}>Best</MenuItem>
            <MenuItem value={'Newest'}>Newest</MenuItem>
            <MenuItem value={'Oldest'}>Oldest</MenuItem>
          </Select>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {pictures.map((pic) => (
            <div
              style={{
                width: '200px',
                height: '280px',
                backgroundColor: '#231A03',
                margin: '10px',
                position: 'relative',
                borderRadius: '4px',
              }}
              key={pic.id}
            >
              <Link to={`/gallery/${pic.id}`}>
                <img
                  src={pic.imgURL}
                  height='200'
                  width='200'
                  style={{ borderRadius: '4px' }}
                ></img>
              </Link>
              <h4
                style={{
                  marginTop: '2px',
                  marginBottom: '5px',
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
              >
                {pic.title}
              </h4>
              <div
                style={{ position: 'absolute', bottom: '0px', width: '100%' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '3px',
                  }}
                >
                  <div style={{ color: '#6c717a', marginLeft: '4px' }}>
                    <ArrowUpward></ArrowUpward> {pic.voteResult}
                  </div>
                  <div style={{ color: '#6c717a', marginRight: '4px' }}>
                    <Sms></Sms> 55
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Gallery
