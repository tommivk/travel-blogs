import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Warning from '@material-ui/icons/Warning';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import '../styles/confirmDialog.css';

const ConfirmDialog = ({
  dialogTitle, dialogText, dialogOpen, handleDialogConfirm, handleDialogClose,
}) => {
  const [showLoadingCircle, setShowLoadingCircle] = useState(false);

  useEffect(() => {
    setShowLoadingCircle(false);
  }, [dialogOpen]);

  const handleConfirm = () => {
    setShowLoadingCircle(true);
    handleDialogConfirm();
  };

  return (
    <Dialog className="confirm-dialog" open={dialogOpen} onClose={handleDialogClose}>
      <div className="confirm-dialog-main-content">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="confirm-dialog-text">
              {dialogText !== ''
            && <Warning id="confirm-dialog-warning-icon" />}
              {dialogText}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className="confirm-dialog-buttons">
            {showLoadingCircle
              ? <CircularProgress id="confirm-dialog-spinner" />
              : (
                <>
                  <Button id="confirm-dialog-ok-button" onClick={handleConfirm}>OK</Button>
                  <Button id="confirm-dialog-cancel-button" onClick={handleDialogClose}>Cancel</Button>
                </>
              )}
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  dialogText: PropTypes.string.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  handleDialogConfirm: PropTypes.func.isRequired,
  handleDialogClose: PropTypes.func.isRequired,
};

export default ConfirmDialog;
