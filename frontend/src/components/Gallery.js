import React, { useEffect, useState, useRef } from 'react'
import ImageUploadModal from './ImageUploadModal'
import SearchModal from './SearchModal'
import { Link } from 'react-router-dom'
import { Button, Container } from '@material-ui/core'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import Sms from '@material-ui/icons/Sms'

const Gallery = ({
  allPictures,
  setAllPictures,
  user,
  setUser,
  storage,
  handleMessage,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  useEffect(() => {
    if (searchFilter !== '') {
      setSearchModalOpen(true)
    }
  }, [searchFilter])
  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }
  const closeSearchModal = () => {
    setSearchModalOpen(false)
    setSearchFilter('')
  }

  if (!allPictures) return null
  console.log(searchFilter)

  return (
    <div style={{ backgroundColor: '#14182b', height: '94vh' }}>
      <div>
        <SearchModal
          open={searchModalOpen}
          closeSearchModal={closeSearchModal}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          allPictures={allPictures}
        ></SearchModal>
      </div>

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
        <div style={{ textAlign: 'center' }}>
          <input
            type='text'
            value={searchFilter}
            onChange={({ target }) => setSearchFilter(target.value)}
          ></input>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {allPictures.map((pic, i) => (
            <div
              style={{
                width: '200px',
                height: '280px',
                backgroundColor: '#231A03',
                margin: '10px',
                position: 'relative',
                borderRadius: '4px',
              }}
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
