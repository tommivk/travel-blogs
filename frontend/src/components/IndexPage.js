import React, { useState } from 'react'
import IndexModal from './IndexModal'
import { Button } from '@material-ui/core'

const IndexPage = ({ setUser }) => {
  const [modalOpen, setModalOpen] = useState({ open: false, modal: '' })

  const openSignUpModal = () => {
    setModalOpen({ open: true, modal: 'signup' })
  }
  const openLoginModal = () => {
    setModalOpen({ open: true, modal: 'login' })
  }
  const closeModal = () => {
    setModalOpen({ open: false, modal: '' })
  }

  return (
    <div style={{ height: '100vh', backgroundColor: 'rgb(60,60,60)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        {modalOpen && (
          <IndexModal
            modalOpen={modalOpen}
            closeModal={closeModal}
            setUser={setUser}
          ></IndexModal>
        )}
        <Button
          style={{ margin: '20px' }}
          onClick={openSignUpModal}
          size='large'
          variant='outlined'
          color='secondary'
        >
          Sign Up
        </Button>
        <div style={{ cursor: 'pointer' }}>
          Already a member? <span onClick={openLoginModal}>Login</span>
        </div>
      </div>
    </div>
  )
}
export default IndexPage
