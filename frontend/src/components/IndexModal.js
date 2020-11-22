import React, { useState } from 'react'
import Login from './Login'
import SignUp from './SignUp'
import { Modal } from '@material-ui/core'

const IndexModal = ({ modalOpen, closeModal, setUser, handleMessage }) => {
  if (!modalOpen.open) return null
  if (modalOpen.modal !== 'login' && modalOpen.modal !== 'signup') return null
  return (
    <div>
      <Modal
        open={modalOpen.open}
        onClose={closeModal}
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            backgroundColor: 'white',
          }}
        >
          {modalOpen.modal === 'login' ? (
            <Login setUser={setUser} handleMessage={handleMessage}></Login>
          ) : (
            <SignUp handleMessage={handleMessage}></SignUp>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default IndexModal
