import React, { useEffect, useState } from 'react'
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
  const [pictures, setPictures] = useState(allPictures)
  const [sortBy, setSortBy] = useState('Newest')

  const param = queryString.parse(useLocation().search)

  useEffect(() => {
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

      if (param.city) {
        const picturesWithCity = sortedPictures.filter(
          (p) => p.location && p.location.city && p.location.city !== null
        )
        console.log(picturesWithCity)
        const filteredPics = picturesWithCity.filter(
          (p) => p.location.city.toLowerCase() === param.city.toLowerCase()
        )
        setPictures(filteredPics)
      }

      if (param.country) {
        const picturesWithCountry = sortedPictures.filter(
          (p) => p.location.country !== null
        )
        const filteredPics = picturesWithCountry.filter(
          (p) =>
            p.location.country.toLowerCase() === param.country.toLowerCase()
        )
        setPictures(filteredPics)
      }
    }
  }, [param.country, param.city, allPictures, sortBy])

  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }

  if (!pictures) return null

  return (
    <div className="gallery-main-container">
      <div className="blog-top-right-container">
      <div className="blog-top-right-wrapper">
        <div className="gallery-filter-selection">
          Sort By{' '}
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
        <div className="gallery-upload-images-button">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setUploadModalOpen(true)}
          >
            upload images
          </Button>
        </div>
      </div>
      </div>
      <div className="gallery-main-content">
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
        <div className="gallery-top-content">
          {param.country && (
            <div style={{ display: 'flex' }}>
              <h1 style={{ color: 'white', marginTop: '0px' }}>
                Pictures from {param.country}
              </h1>
              <Link to={'/gallery'}>
                <Button style={{ color: 'white' }}>(X)</Button>
              </Link>
            </div>
          )}
          {param.city && (
            <div style={{ display: 'flex' }}>
              <h1 style={{ color: 'white', marginTop: '0px' }}>
                Pictures from {param.city}
              </h1>
              <Link to={'/gallery'}>
                <Button style={{ color: 'white' }}>(X)</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="gallery-cards-wrapper">
          <div className="gallery-cards">
            {pictures.map((pic) => (
              <div>
                <Link to={`/gallery/${pic.id}`} key={pic.id}>
                  <div className="gallery-card">
                    <img
                      src={pic.imgURL}
                      height="200"
                      width="200"
                      style={{ borderRadius: '4px' }}
                    ></img>

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
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          marginBottom: '3px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            color: '#6c717a',
                            marginLeft: '4px',
                          }}
                        >
                          <ArrowUpward></ArrowUpward>{' '}
                          <div
                            style={{ alignSelf: 'center', marginLeft: '3px' }}
                          >
                            {pic.voteResult}
                          </div>
                        </div>
                        <div style={{ color: '#6c717a', marginRight: '4px' }}>
                          <Sms></Sms> {pic.comments.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="pic-pseudo-element"></div>
            <div className="pic-pseudo-element"></div>
            <div className="pic-pseudo-element"></div>
            <div className="pic-pseudo-element"></div>
            <div className="pic-pseudo-element"></div>
            <div className="pic-pseudo-element"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gallery
