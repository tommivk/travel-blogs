import React, { useState } from 'react'
import ImageUploadModal from './ImageUploadModal'
import { Link } from 'react-router-dom'
import { Button, Container } from '@material-ui/core'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import Sms from '@material-ui/icons/Sms'

const Gallery = ({ allPictures, setAllPictures, user, setUser, storage }) => {
  console.log(allPictures)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }

  if (!allPictures) return null
  return (
    <div style={{ backgroundColor: '#191e36', height: '100%' }}>
      <ImageUploadModal
        uploadModalOpen={uploadModalOpen}
        closeModal={closeUploadModal}
        user={user}
        setUser={setUser}
        storage={storage}
        allPictures={allPictures}
        setAllPictures={setAllPictures}
      ></ImageUploadModal>
      <div>
        <Button onClick={() => setUploadModalOpen(true)}>upload images</Button>
      </div>
      <Container maxWidth='lg'>
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
                    <ArrowUpward></ArrowUpward> 4
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
