import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.open,
    };
  }

  render = () => {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          style={{ backgroundColor: "#1E3D59", color: "#F5F0E1" }}
          id="alert-dialog-slide-title"
        >
          <ErrorOutlineIcon style={{ marginRight: "10px" }} />
          {this.props.title}
        </DialogTitle>
        <DialogContent
          style={{ paddingTop: "24px", backgroundColor: "#F5F0E1" }}
        >
          <DialogContentText id="alert-dialog-slide-description">
            <span style={{ color: "#1E3D59" }}>{this.props.content}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#F5F0E1" }}>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.props.handleClose();
              this.props.onConfirm();
            }}
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
}

export default ConfirmDialog;
