import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Warning from '@material-ui/icons/Warning';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import '../styles/confirmDialog.css';

const ConfirmDialog = ({
  dialogTitle, dialogText, dialogOpen, handleDialogConfirm, handleDialogClose,
}) => (
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
          <Button id="confirm-dialog-ok-button" onClick={handleDialogConfirm}>OK</Button>
          <Button id="confirm-dialog-cancel-button" onClick={handleDialogClose}>Cancel</Button>
        </div>
      </DialogActions>
    </div>
  </Dialog>
);

ConfirmDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  dialogText: PropTypes.string.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  handleDialogConfirm: PropTypes.func.isRequired,
  handleDialogClose: PropTypes.func.isRequired,
};

export default ConfirmDialog;
