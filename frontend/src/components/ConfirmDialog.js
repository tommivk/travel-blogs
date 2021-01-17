import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

const ConfirmDialog = ({
  dialogTitle, dialogText, dialogOpen, handleDialogConfirm, handleDialogClose,
}) => (
  <div>
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {dialogText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={handleDialogConfirm}>OK</Button>
      </DialogActions>
    </Dialog>
  </div>
);

ConfirmDialog.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  dialogText: PropTypes.string.isRequired,
  dialogOpen: PropTypes.bool.isRequired,
  handleDialogConfirm: PropTypes.func.isRequired,
  handleDialogClose: PropTypes.func.isRequired,
};

export default ConfirmDialog;
