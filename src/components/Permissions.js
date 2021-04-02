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
import { setFilePermissionsAction } from "../reducers/CurrentOpenFileState";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";

class PermissionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPermissions: [],
      newUserPermissions: [],
    };
  }

  updateFilePermissions = (filePermissions) => {
    var owners = [];
    var readers = [];
    var writers = [];
    for (var email in filePermissions) {
      var permission = filePermissions[email]["permission"];
      var name = filePermissions[email]["name"];
      if (permission === PERMISSION_TYPE.OWN) {
        owners.push({ email: email, name: name, permission: permission });
      } else if (permission === PERMISSION_TYPE.WRITE) {
        writers.push({ email: email, name: name, permission: permission });
      } else {
        readers.push({ email: email, name: name, permission: permission });
      }
    }
    this.setState({
      currentPermissions: owners.concat(writers).concat(readers),
      newUserPermissions: [],
    });
  };

  componentDidMount = () => {
    this.updateFilePermissions(this.props.filePermissions);
  };
  componentDidUpdate = (prevProps) => {
    if (prevProps.filePermissions !== this.props.filePermissions) {
      this.updateFilePermissions(this.props.filePermissions);
    }
  };
  handlePermissionChange = (index, event) => {
    var currentPermissions = this.state.currentPermissions;
    currentPermissions[index]["permission"] = event.target.value;
    this.setState({ currentPermissions: currentPermissions });
  };

  handleNewUserPermissionChange = (index, event) => {
    var currentNewUsers = this.state.newUserPermissions;
    currentNewUsers[index]["permission"] = event.target.value;
    this.setState({ newUserPermissions: currentNewUsers });
  };

  addNewUser = () => {
    var currentNewUsers = this.state.newUserPermissions;
    currentNewUsers.push({ email: "", permission: "" });
    this.setState({ newUserPermissions: currentNewUsers });
  };

  handleEmailChange = (index, event) => {
    var currentNewUsers = this.state.newUserPermissions;
    currentNewUsers[index]["email"] = event.target.value;
    this.setState({ newUserPermissions: currentNewUsers });
  };

  removeExistingUser = (index) => {
    var currentPermissions = this.state.currentPermissions;
    currentPermissions.splice(index, 1);
    this.setState({
      currentPermissions: currentPermissions,
    });
  };

  removeNewUser = (index) => {
    var currentNewUserPermissions = this.state.newUserPermissions;
    currentNewUserPermissions.splice(index, 1);
    this.setState({
      newUserPermissions: currentNewUserPermissions,
    });
  };
  savePermissions = () => {
    var ownerPresent = 0;
    for (let i = 0; i < this.state.currentPermissions.length; i++) {
      if (
        this.state.currentPermissions[i]["permission"] === PERMISSION_TYPE.OWN
      ) {
        ownerPresent += 1;
        if (ownerPresent > 1) break;
      }
    }
    if (ownerPresent !== 1) {
      for (let i = 0; i < this.state.newUserPermissions.length; i++) {
        if (
          this.state.newUserPermissions[i]["permission"] === PERMISSION_TYPE.OWN
        ) {
          ownerPresent += 1;
          if (ownerPresent > 1) break;
        }
      }
    }
    if (ownerPresent !== 1) {
      this.props.dispatchSetToastAction({
        message: "Please ensure there is only one owner for the file",
        severity: TOAST_SEVERITY.ERROR,
        open: true,
      });
      return;
    }
    var currentPermissionLevels = {};
    for (let i = 0; i < this.state.currentPermissions.length; i++) {
      currentPermissionLevels[
        this.state.currentPermissions[i]["email"]
      ] = this.state.currentPermissions[i]["permission"];
    }
    for (let i = 0; i < this.state.newUserPermissions.length; i++) {
      if (this.state.newUserPermissions[i]["email"] === "") {
        this.props.dispatchSetToastAction({
          message: "Please enter a valid email",
          severity: TOAST_SEVERITY.ERROR,
          open: true,
        });
        return;
      }
      if (this.state.newUserPermissions[i]["permission"] === "") {
        this.props.dispatchSetToastAction({
          message: "Please select a valid access role",
          severity: TOAST_SEVERITY.ERROR,
          open: true,
        });
        return;
      }
      currentPermissionLevels[
        this.state.newUserPermissions[i]["email"]
      ] = this.state.newUserPermissions[i]["permission"];
    }
    FileStorageSystemClient.doSavePermissions(
      this.props.currentOpenFileId.sourceId,
      currentPermissionLevels
    ).then(
      (value) => {
        this.props.setFilePermissions(value["permissions"]);
        this.props.dispatchSetToastAction({
          message: "Updated Permissions",
          severity: TOAST_SEVERITY.SUCCESS,
          open: true,
        });
      },
      (failure) => {
        var errorMessage = "";
        if (failure.message === 404) {
          errorMessage =
            "Email Not Found. Please ensure the user has an account with Yada";
        } else {
          errorMessage = "Unable to Update Permissions";
        }
        this.props.dispatchSetToastAction({
          message: errorMessage,
          severity: TOAST_SEVERITY.ERROR,
          open: true,
        });
      }
    );
  };

  render = () => {
    return (
      <div className="permissions_popover">
        <List>
          {this.state.currentPermissions != null &&
          this.state.currentPermissions.length > 0
            ? this.state.currentPermissions.map((permission, index) => (
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
                      <Grid container>
                        <Grid item xs={9}>
                          <FormControl className="custom_form_control">
                            <InputLabel>Role</InputLabel>
                            <Select
                              value={
                                this.state.currentPermissions[index][
                                  "permission"
                                ]
                              }
                              onChange={(event) =>
                                this.handlePermissionChange(index, event)
                              }
                              label="Permission"
                            >
                              <MenuItem value={PERMISSION_TYPE.OWN}>
                                Owner
                              </MenuItem>
                              <MenuItem value={PERMISSION_TYPE.READ}>
                                Reader
                              </MenuItem>
                              <MenuItem value={PERMISSION_TYPE.WRITE} disabled>
                                Editor - Coming Soon
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={1} />
                        <Grid item xs={2}>
                          <IconButton
                            color="default"
                            className="close_button"
                            onClick={() => this.removeExistingUser(index)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))
            : null}
        </List>
        <List>
          {this.state.newUserPermissions != null &&
          this.state.newUserPermissions.length > 0
            ? this.state.newUserPermissions.map((newUserPermission, index) => (
                <div>
                  <ListItem alignItem="flex-start">
                    <ListItemAvatar />
                    <TextField
                      required
                      label="User Email"
                      value={newUserPermission["email"]}
                      onChange={(event) => this.handleEmailChange(index, event)}
                    />
                    <ListItemSecondaryAction className="secondary_action">
                      <Grid container>
                        <Grid item xs={9}>
                          <FormControl className="custom_form_control">
                            <InputLabel>Role</InputLabel>
                            <Select
                              value={newUserPermission["permission"]}
                              onChange={(event) =>
                                this.handleNewUserPermissionChange(index, event)
                              }
                              label="Permission"
                            >
                              <MenuItem value={PERMISSION_TYPE.OWN}>
                                Owner
                              </MenuItem>
                              <MenuItem value={PERMISSION_TYPE.READ}>
                                Reader
                              </MenuItem>
                              <MenuItem value={PERMISSION_TYPE.WRITE} disabled>
                                Editor - Coming Soon
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={1} />
                        <Grid item xs={2}>
                          <IconButton
                            color="default"
                            className="close_button"
                            onClick={() => this.removeNewUser(index)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))
            : null}
        </List>
        <Grid container className="button_group">
          <Grid item xs={1} />
          <Grid item xs={3} style={{ textAlign: "center" }}>
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
          <Grid item xs={3} style={{ textAlign: "center" }}>
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

  render = () => {
    return (
      <div>
        <Grid container spacing={0}>
          <Grid item xs={7}>
            <AvatarGroup max={3}>
              {(this.props.filePermissions != null &&
                Object.keys(this.props.filePermissions).length) > 0
                ? Object.keys(this.props.filePermissions).map(
                    (email, index) => (
                      <Tooltip
                        title={this.props.filePermissions[email]["name"]}
                      >
                        <Avatar
                          style={
                            index % 3 === 0
                              ? { backgroundColor: "#FF6E40" }
                              : index % 3 === 1
                              ? { backgroundColor: "#FF9A8D" }
                              : { backgroundColor: "#FFC13B" }
                          }
                        >
                          {this.props.filePermissions[email]["name"]
                            .substring(0, 1)
                            .toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    )
                  )
                : null}
            </AvatarGroup>
          </Grid>
          <Grid item xs={5}>
            {this.props.userPermission === PERMISSION_TYPE.OWN ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={(event) => this.openPermissionsPopover(event)}
              >
                Share
              </Button>
            ) : null}
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
            setFilePermissions={this.props.setFilePermissions}
          />
        </Popover>
      </div>
    );
  };
}

export default connect(
  (state) => ({
    currentOpenFileId: state.currentOpenFileId,
    filePermissions: state.filePermissions,
    userPermission: state.userPermission,
  }),
  (dispatch) => ({
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
    setFilePermissions: (filePermissions) =>
      dispatch(setFilePermissionsAction(filePermissions)),
  })
)(Permissions);
