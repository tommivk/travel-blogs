import React, { useState } from 'react'
import ImageUploadModal from './ImageUploadModal'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'

const Gallery = ({ allPictures, setAllPictures, user, setUser, storage }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const closeUploadModal = () => {
    setUploadModalOpen(false)
  }

  if (!allPictures) return null
  return (
    <div>
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
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {allPictures.map((pic, i) => (
          <div>
            <h4>{pic.title}</h4>
            <Link to={`/gallery/${pic.id}`}>
              <img src={pic.imgURL} height='200' width='200'></img>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Gallery
