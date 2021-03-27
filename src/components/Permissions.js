import "./Permissions.css";
import React from "react";
import { connect } from "react-redux";
import Avatar from "@material-ui/core/Avatar";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import { PERMISSION_TYPE } from "../util/FileIdAndTypeUtils";
import MenuItem from "@material-ui/core/MenuItem";
import SaveIcon from "@material-ui/icons/Save";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import TextField from "@material-ui/core/TextField";
import { setToastAction, TOAST_SEVERITY } from "../reducers/Toast";

class PermissionEditor extends React.Component {
  constructor(props) {
    super(props);
    var owners = [];
    var readers = [];
    var writers = [];
    var permissionLevels = {};
    for (var email in this.props.filePermissions) {
      var permission = this.props.filePermissions[email]["permission"];
      var name = this.props.filePermissions[email]["name"];
      permissionLevels[email] = permission;
      if (permission === PERMISSION_TYPE.OWN) {
        owners.push({ email: email, name: name, permission: permission });
      } else if (permission === PERMISSION_TYPE.WRITE) {
        writers.push({ email: email, name: name, permission: permission });
      } else {
        readers.push({ email: email, name: name, permission: permission });
      }
    }
    this.state = {
      permissions: owners.concat(writers).concat(readers),
      permissionLevels: permissionLevels,
      newUserEmails: [],
    };
  }
  handlePermissionChange = (email, event) => {
    if (email === "") return;
    var currentPermissionLevels = this.state.permissionLevels;
    currentPermissionLevels[email] = event.target.value;
    this.setState({ permissionLevels: currentPermissionLevels });
  };

  addNewUser = () => {
    var currentNewUsers = this.state.newUserEmails;
    currentNewUsers.push("");
    this.setState({ newUserEmails: currentNewUsers });
  };

  handleEmailChange = (index, event) => {
    var currentNewUsers = this.state.newUserEmails;
    currentNewUsers[index] = event.target.value;
    this.setState({ newUserEmails: currentNewUsers });
  };

  savePermissions = () => {
    var ownerPresent = false;
    for (var email in this.state.permissionLevels) {
      if (this.state.permissionLevels[email] === PERMISSION_TYPE.OWN) {
        ownerPresent = true;
        break;
      }
    }
    if (!ownerPresent) {
      this.props.dispatchSetToastAction({
        message: "Please ensure there is at least one owner for the file",
        severity: TOAST_SEVERITY.ERROR,
        open: true,
      });
    }
    FileStorageSystemClient.doSavePermissions(
      this.props.currentOpenFileId.sourceId,
      this.state.permissionLevels
    ).then(() => {
      console.log("success");
    });
  };

  render = () => {
    return (
      <div className="permissions_popover">
        <List>
          {this.state.permissions != null && this.state.permissions.length > 0
            ? this.state.permissions.map((permission, index) => (
                <div>
                  <ListItem alignItem="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        style={
                          index % 3 === 0
                            ? { backgroundColor: "#FF6E40" }
                            : index % 3 === 1
                            ? { backgroundColor: "#FF9A8D" }
                            : { backgroundColor: "#FFC13B" }
                        }
                      >
                        {permission["name"].substring(0, 1).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={permission["name"]}
                      secondary={permission["email"]}
                    />
                    <ListItemSecondaryAction className="secondary_action">
                      <FormControl className="custom_form_control">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={
                            this.state.permissionLevels[permission["email"]]
                          }
                          onChange={(event) =>
                            this.handlePermissionChange(
                              permission["email"],
                              event
                            )
                          }
                          label="Permission"
                        >
                          <MenuItem value={PERMISSION_TYPE.OWN}>Owner</MenuItem>
                          <MenuItem value={PERMISSION_TYPE.WRITE}>
                            Editor
                          </MenuItem>
                          <MenuItem value={PERMISSION_TYPE.READ}>
                            Reader
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))
            : null}
        </List>
        <List>
          {this.state.newUserEmails != null &&
          this.state.newUserEmails.length > 0
            ? this.state.newUserEmails.map((email, index) => (
                <div>
                  <ListItem alignItem="flex-start">
                    <ListItemAvatar />
                    <TextField
                      required
                      label="User Email"
                      value={email}
                      onChange={(event) => this.handleEmailChange(index, event)}
                    />
                    <ListItemSecondaryAction className="secondary_action">
                      <FormControl className="custom_form_control">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={this.state.permissionLevels[email]}
                          onChange={(event) =>
                            this.handlePermissionChange(email, event)
                          }
                          label="Permission"
                        >
                          <MenuItem value={PERMISSION_TYPE.OWN}>Owner</MenuItem>
                          <MenuItem value={PERMISSION_TYPE.WRITE}>
                            Editor
                          </MenuItem>
                          <MenuItem value={PERMISSION_TYPE.READ}>
                            Reader
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))
            : null}
        </List>
        <Grid container className="button_group">
          <Grid item xs={1} />
          <Grid item xs={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={() => this.addNewUser()}
            >
              Add
            </Button>
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={3}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => this.savePermissions()}
            >
              Save
            </Button>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </div>
    );
  };
}

class Permissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }
  openPermissionsPopover = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  closePermissionsPopover = () => {
    this.setState({ anchorEl: null });
  };

  render = () => (
    <div>
      <Grid container spacing={0}>
        <Grid item xs={7}>
          <AvatarGroup max={3}>
            {(this.props.filePermissions != null &&
              Object.keys(this.props.filePermissions).length) > 0
              ? Object.keys(this.props.filePermissions).map((email, index) => (
                  <Tooltip title={this.props.filePermissions[email]["name"]}>
                    <Avatar
                      style={
                        index % 2 === 0
                          ? { backgroundColor: "#FF6E40" }
                          : { backgroundColor: "#FF9A8D" }
                      }
                    >
                      {this.props.filePermissions[email]["name"]
                        .substring(0, 1)
                        .toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))
              : null}
          </AvatarGroup>
        </Grid>
        <Grid item xs={5}>
          <Button
            variant="outlined"
            color="primary"
            onClick={(event) => this.openPermissionsPopover(event)}
          >
            Share
          </Button>
        </Grid>
      </Grid>
      <Popover
        open={this.state.anchorEl !== null}
        anchorEl={this.state.anchorEl}
        onClose={this.closePermissionsPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <PermissionEditor
          filePermissions={this.props.filePermissions}
          dispatchSetToastAction={this.props.dispatchSetToastAction}
          currentOpenFileId={this.props.currentOpenFileId}
        />
      </Popover>
    </div>
  );
}

export default connect(
  (state) => ({
    currentOpenFileId: state.currentOpenFileId,
    filePermissions: state.filePermissions,
  }),
  (dispatch) => ({
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(Permissions);
