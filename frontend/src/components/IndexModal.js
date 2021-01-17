import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@material-ui/core';
import Login from './Login';
import SignUp from './SignUp';

const IndexModal = ({
  modalOpen, closeModal, setUser, handleMessage,
}) => {
  if (!modalOpen.open) return null;
  if (modalOpen.modal !== 'login' && modalOpen.modal !== 'signup') return null;
  return (
    <div>
      <Modal
        open={modalOpen.open}
        onClose={closeModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -44%)',
            outline: 'none',
            color: 'white',
          }}
        >
          {modalOpen.modal === 'login' ? (
            <Login setUser={setUser} handleMessage={handleMessage} />
          ) : (
            <SignUp handleMessage={handleMessage} closeModal={closeModal} />
          )}
        </div>
      </Modal>
    </div>
  );
};

IndexModal.propTypes = {
  modalOpen: PropTypes.instanceOf(Object).isRequired,
  closeModal: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  handleMessage: PropTypes.func.isRequired,
};

export default IndexModal;
