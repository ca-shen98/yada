import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { connect } from "react-redux";
import {
  clearAccessToken,
  setBackendModeSignedInStatusAction,
} from "../reducers/BackendModeSignedInStatus";
import DescriptionIcon from "@material-ui/icons/Description";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import ViewDayIcon from "@material-ui/icons/ViewDay";
import AmpStoriesIcon from "@material-ui/icons/AmpStories";
import { BACKEND_MODE_SIGNED_IN_STATUS } from "../reducers/BackendModeSignedInStatus";
import {
  FILE_TYPE,
  checkNoOpenFileId,
  checkSourceFileId,
  checkViewFileId,
  NO_OPEN_FILE_ID,
} from "../util/FileIdAndTypeUtils";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import BugReportIcon from "@material-ui/icons/BugReport";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { parse as parseTagFilters } from "../lib/TagFiltersGrammar";
import BlockTaggingEditorExtension from "../editor_extension/BlockTagging";
import { TagFilteringPluginKey } from "../editor_extension/plugins/TagFiltering";
import { Selection, TextSelection } from "prosemirror-state";
import { defer } from "lodash";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { setToastAction, TOAST_SEVERITY } from "../reducers/Toast";
import store from "../store";
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_SAVE_IN_PROGRESS,
  CLEAR_SAVE_IN_PROGRESS,
  signoutAction,
} from "../reducers/CurrentOpenFileState";
import "./Navbar.css";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CircularProgress from "@material-ui/core/CircularProgress";
import { setNewUserAction } from "../reducers/Steps";
import ConfirmDialog from "./ConfirmDialog";
import Tooltip from "@material-ui/core/Tooltip";

const TAG_FILTERS_INPUT_ID = "tag_filters_input";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modifyingTagFilters: false,
      currentTagFiltersStr: "",
      currentParsedTagFiltersStr: "",
      sourceSavedTagFilters: {},
      windowWidth: window.innerWidth,
      userIconElement: null,
      confirmDialogOpen: false,
      confirmDialogCallback: null,
    };
  }
  handleResize = (e) => {
    this.setState({ windowWidth: window.innerWidth });
  };

  handleBugReport = (event) => {
    const emailTo = "yada.bugs@gmail.com";
    const emailSub = "[BUG]%20User%20Report";

    // Get device info to help with debugging
    const nl = "%0D%0A"; // HTML escaped newline
    const device_info =
      nl +
      nl +
      "Device Info:" +
      nl +
      [window.navigator.userAgent, window.navigator.platform].join(nl);
    const emailBody =
      "Enter information about your bug report here." + device_info;

    window.open(
      "mailto:" + emailTo + "?subject=" + emailSub + "&body=" + emailBody,
      "_blank"
    );
  };

  handleSave = () => {
    store.dispatch({ type: SET_SAVE_IN_PROGRESS });
    store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      FileStorageSystemClient.doSaveSourceContent(
        BlockTaggingEditorExtension.editor.value(true),
        this.props.currentOpenFileId.sourceId
      ).then((success) => {
        store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
        if (success) {
          this.props.dispatchSetToastAction({
            message: "Saved source file",
            severity: TOAST_SEVERITY.SUCCESS,
            open: true,
          });
        } else {
          this.props.dispatchSetToastAction({
            message: "Failed to save source file",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
          store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
        }
      });
    } else if (
      checkViewFileId(this.props.currentOpenFileId) &&
      this.props.currentOpenFileId.viewType !== NO_OPEN_FILE_ID.viewType
    ) {
      FileStorageSystemClient.doSaveViewSpec(
        this.props.tagsInView,
        this.props.currentOpenFileId.sourceId,
        this.props.currentOpenFileId.viewId,
        this.props.currentOpenFileId.viewType,
        false,
        this.props.metadataInView
      )
        .then(() => {
          this.props.dispatchSetToastAction({
            message: "View saved",
            severity: TOAST_SEVERITY.SUCCESS,
            open: true,
          });
          store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
          store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
        })
        .catch(() => {
          this.props.dispatchSetToastAction({
            message: "Failed to save view",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
          store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
          store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
        });
    }
  };

  handleCancelModifyingTagFilters = () => {
    const tag_input = document.getElementById(TAG_FILTERS_INPUT_ID);
    if (tag_input !== null) {
      tag_input.value = this.state.currentTagFiltersStr;
    }
    this.setState({ modifyingTagFilters: false });
  };

  handleStartModifyingTagFilters = () => {
    this.setState({ modifyingTagFilters: true });
    defer(() => {
      const tag_input = document.getElementById(TAG_FILTERS_INPUT_ID);
      if (tag_input !== null) {
        tag_input.focus();
        tag_input.setSelectionRange(
          tag_input.value.length,
          tag_input.value.length
        );
      }
    });
  };

  handleUnpersistCurrentTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      !this.state.sourceSavedTagFilters.hasOwnProperty(
        this.state.currentTagFiltersStr
      )
    ) {
      return false;
    }
    const newSourceSavedTagFilters = { ...this.state.sourceSavedTagFilters };
    delete newSourceSavedTagFilters[this.state.currentTagFiltersStr];
    FileStorageSystemClient.doSetSourceSavedTagFilters(
      this.props.currentOpenFileId.sourceId,
      newSourceSavedTagFilters
    ).then((success) => {
      if (!success) {
        this.props.dispatchSetToastAction({
          message: "Failed to set source saved tag filters",
          severity: TOAST_SEVERITY.ERROR,
          open: true,
        });
      } else {
        this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters });
      }
    });
  };

  handlePersistNewSavedTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      this.state.sourceSavedTagFilters.hasOwnProperty(
        this.state.currentTagFiltersStr
      )
    ) {
      return false;
    }
    const newSourceSavedTagFilters = { ...this.state.sourceSavedTagFilters };
    newSourceSavedTagFilters[
      this.state.currentTagFiltersStr
    ] = this.state.currentParsedTagFiltersStr;
    FileStorageSystemClient.doSetSourceSavedTagFilters(
      this.props.currentOpenFileId.sourceId,
      newSourceSavedTagFilters
    ).then((success) => {
      if (!success) {
        this.props.dispatchSetToastAction({
          message: "Failed to set source saved tag filters",
          severity: TOAST_SEVERITY.ERROR,
          open: true,
        });
      } else {
        this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters });
      }
    });
  };

  handleApplyTagFilters = () => {
    let tagFilters = null;
    let tagFiltersStr = "";
    const tag_input = document.getElementById(TAG_FILTERS_INPUT_ID);
    if (tag_input !== null) {
      tagFiltersStr = tag_input.value.trim();
      if (tagFiltersStr) {
        tagFilters = parseTagFilters(tagFiltersStr);
        if (!tagFilters) {
          this.props.dispatchSetToastAction({
            message: "Invalid tag filters",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
          return false;
        }
      }
      tag_input.value = tagFiltersStr;
    }

    const parsedTagFiltersStr = JSON.stringify(tagFilters);
    const oldParsedTagFiltersStr = this.state.currentParsedTagFiltersStr;
    this.setState({
      currentTagFiltersStr: tagFiltersStr,
      currentParsedTagFiltersStr: parsedTagFiltersStr,
    });
    if (parsedTagFiltersStr === oldParsedTagFiltersStr) {
      return true;
    }
    if (BlockTaggingEditorExtension.editor !== undefined) {
      BlockTaggingEditorExtension.editor.view.dispatch(
        BlockTaggingEditorExtension.editor.view.state.tr
          .setMeta(TagFilteringPluginKey, tagFilters)
          .setSelection(
            tagFilters
              ? TextSelection.create(
                  BlockTaggingEditorExtension.editor.view.state.doc,
                  0,
                  0
                )
              : Selection.atStart(
                  BlockTaggingEditorExtension.editor.view.state.doc
                )
          )
          .scrollIntoView()
      );
      defer(() => {
        if (tagFilters) {
          BlockTaggingEditorExtension.editor.view.dom.blur();
        } else {
          BlockTaggingEditorExtension.editor.view.focus();
        }
      });
    }
    return true;
  };

  changeFile = async () => {
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      FileStorageSystemClient.doGetSourceSavedTagFilters(
        this.props.currentOpenFileId.sourceId
      ).then((sourceSavedTagFilters) => {
        if (!sourceSavedTagFilters) {
          this.props.dispatchSetToastAction({
            message: "Failed to retrieve source saved tag filters",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
        } else {
          let filters = {};
          sourceSavedTagFilters.forEach((element) => {
            filters[element] = element;
          });
          this.setState({ sourceSavedTagFilters: filters });
        }
      });
    }
  };

  componentDidMount = () => {
    this.changeFile();
    window.addEventListener("resize", this.handleResize);
  };

  componentDidUpdate = (prevProps) => {
    if (
      this.props.currentOpenFileName.viewName === "" &&
      prevProps.currentOpenFileId.sourceId !==
        this.props.currentOpenFileId.sourceId
    ) {
      const tag_input = document.getElementById(TAG_FILTERS_INPUT_ID);
      if (tag_input !== null) {
        tag_input.value = "";
      }
      this.handleApplyTagFilters();
      this.setState({ sourceSavedTagFilters: {} });
      this.changeFile();
    }
  };

  componentWillUnmount() {
    window.addEventListener("resize", this.handleResize);
  }

  handleUserMenuOpen = (event) => {
    this.setState({
      userIconElement: event.currentTarget,
    });
  };

  handleUserMenuClose = () => {
    this.setState({
      userIconElement: null,
    });
  };

  handleConfirmDialogClose = () => {
    this.setState({
      confirmDialogOpen: false,
      confirmDialogCallback: null,
    });
  };

  handleSignOut = () => {
    if (
      this.props.dispatchSetBackendModeSignedInStatusAction(
        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
      )
    ) {
      clearAccessToken();
      this.props.dispatchNewUserAction(false);
      localStorage.clear();
      this.props.dispatchSignOutAction();
    }
  };

  render = () => {
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    const currentTagFiltersSaved = this.state.sourceSavedTagFilters.hasOwnProperty(
      this.state.currentTagFiltersStr
    );
    return (
      <div className={"sticky-navbar scrolled"}>
        <AppBar className="custom-navbar">
          <Toolbar>
            <div style={{ width: "275px" }}>
              <Grid container>
                <img
                  className={"menuButton"}
                  src={require("../images/logo.png")}
                  style={{ width: "40px", height: "45px", marginRight: "10px" }}
                  alt={"MENU"}
                />
                <Typography
                  variant="h5"
                  style={{
                    fontFamily: "Bungee",
                    color: "#F5F0E1",
                    marginTop: "5px",
                  }}
                >
                  YADA
                </Typography>
              </Grid>
            </div>
            <Grid container style={{ width: "80vw" }}>
              {this.props.currentOpenFileName.sourceName === "" ? null : (
                <Grid item xs={4}>
                  <Grid container spacing={0}>
                    <Grid item xs={6} sm={6} xl={4}>
                      <div
                        color="secondary"
                        style={{
                          marginRight: "10px",
                          border: "1px solid #F5F0E1",
                          borderRadius: "10px",
                          padding: "8px",
                        }}
                      >
                        {this.props.currentOpenFileName.viewName === "" ? (
                          <div
                            color="inherit"
                            style={{
                              color: "#F5F0E1",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              display: "block",
                              maxWidth: "100%",
                              textAlign: "center",
                            }}
                          >
                            <DescriptionIcon color="secondary" />
                            {this.props.currentOpenFileName.sourceName}
                          </div>
                        ) : (
                          <div
                            color="inherit"
                            style={{
                              color: "#F5F0E1",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              display: "block",
                              maxWidth: "100%",
                              textAlign: "center",
                            }}
                          >
                            {this.props.currentOpenFileId.viewType ===
                            FILE_TYPE.CARD_VIEW ? (
                              <AmpStoriesIcon color="secondary" />
                            ) : this.props.currentOpenFileId.viewType ===
                              FILE_TYPE.TEXT_VIEW ? (
                              <TextFieldsIcon color="secondary" />
                            ) : this.props.currentOpenFileId.viewType ===
                              FILE_TYPE.SLIDE_VIEW ? (
                              <ViewDayIcon color="secondary" />
                            ) : null}
                            {this.props.currentOpenFileName.viewName}
                          </div>
                        )}
                      </div>
                    </Grid>
                    <Grid item xs={5}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        title="save"
                        name="save_btn"
                        disabled={
                          noOpenFileIdCheck || !this.props.saveDirtyFlag
                        }
                        onClick={this.handleSave}
                        startIcon={<SaveIcon />}
                        style={{
                          borderRadius: "10px",
                          paddingTop: "8px",
                          paddingBottom: "8px",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                          maxWidth: "45px",
                          minWidth: "45px",
                          zIndex: 0,
                        }}
                      >
                        <CircularProgress
                          hidden={!this.props.saveInProgress}
                          color="secondary"
                          name="save_progress"
                          style={{
                            position: "absolute",
                            top: "0%",
                            left: "0%",
                            height: "40px",
                            width: "40px",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            paddingLeft: "4px",
                            paddingRight: "4px",
                            zIndex: 1,
                          }}
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {this.props.currentOpenFileName.sourceName !== "" &&
              this.props.currentOpenFileName.viewName === "" ? (
                <Grid item xs={6}>
                  <div
                    id="searchBar"
                    style={{
                      backgroundColor: "rgba(245, 240, 225, 0.8)",
                      width: "100%",
                      borderRadius: "10px",
                      padding: "5px",
                      justifyContent: "spaceBetween",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        marginTop: "3px",
                        width: "20px",
                        marginRight: "5px",
                      }}
                    >
                      <SearchIcon color="primary" />
                    </div>
                    <Autocomplete
                      value={this.state.currentTagFiltersStr}
                      id={TAG_FILTERS_INPUT_ID}
                      freeSolo
                      options={Object.entries(
                        this.state.sourceSavedTagFilters
                      ).map(
                        ([tagFiltersStr, _parsedTagFiltersStr]) => tagFiltersStr
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search with Tags: ( #{tag1} | !( #{tag2} ) ) & #{tag3}"
                          style={{ margin: "0%" }}
                          margin="normal"
                          variant="standard"
                        />
                      )}
                      style={{ width: "90%" }}
                      onChange={(event, value, reason) => {
                        this.setState({ currentTagFiltersStr: value });
                        this.handleStartModifyingTagFilters();
                        if (reason === "clear") {
                          const tag_input = document.getElementById(
                            TAG_FILTERS_INPUT_ID
                          );
                          if (tag_input !== null) {
                            tag_input.value = "";
                          }
                          if (this.handleApplyTagFilters()) {
                            this.setState({ modifyingTagFilters: false });
                          }
                        }
                        if (reason === "select-option") {
                          const tag_input = document.getElementById(
                            TAG_FILTERS_INPUT_ID
                          );
                          if (tag_input !== null) {
                            tag_input.value = value;
                          }
                          if (this.handleApplyTagFilters()) {
                            this.setState({ modifyingTagFilters: false });
                          }
                        }
                      }}
                      onBlur={(event) => {
                        if (this.handleApplyTagFilters()) {
                          this.setState({ modifyingTagFilters: false });
                        } else {
                          const input = event.target;
                          defer(() => {
                            input.focus();
                          });
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          this.handleCancelModifyingTagFilters();
                        }
                      }}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          event.target.blur();
                        }
                      }}
                    />
                    <div style={{ float: "right" }}>
                      {this.state.modifyingTagFilters ? null : this.state
                          .currentTagFiltersStr ===
                        "" ? null : currentTagFiltersSaved ? (
                        <IconButton
                          title="Unpersist Filter"
                          style={{
                            padding: "0px",
                            paddingRight: "10px",
                            paddingTop: "5px",
                          }}
                        >
                          <RemoveCircleIcon
                            color="primary"
                            onClick={() => {
                              document.getElementById(
                                TAG_FILTERS_INPUT_ID
                              ).value = "";
                              this.handleUnpersistCurrentTagFilters();
                              this.handleApplyTagFilters();
                            }}
                          />
                        </IconButton>
                      ) : (
                        <IconButton
                          title="Persist Filter"
                          style={{
                            padding: "0px",
                            paddingRight: "10px",
                            paddingTop: "5px",
                          }}
                        >
                          <SaveIcon
                            color="primary"
                            onClick={() => {
                              this.handlePersistNewSavedTagFilters();
                            }}
                          />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </Grid>
              ) : null}
            </Grid>
            <div style={{ width: "20vw", float: "right" }}>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                color="inherit"
                style={{ float: "right" }}
                onClick={this.handleUserMenuOpen}
              >
                <AccountCircleIcon color="secondary" />
              </IconButton>
              <Tooltip title="Report a Bug">
                <IconButton
                  edge="end"
                  aria-label="bug report"
                  aria-haspopup="true"
                  color="inherit"
                  style={{ float: "right" }}
                  onClick={this.handleBugReport}
                >
                  <BugReportIcon color="secondary" />
                </IconButton>
              </Tooltip>
              {this.props.backendModeSignedInStatus ===
              BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN ? (
                <Menu
                  style={{ marginTop: "40px" }}
                  id="userMenu"
                  anchorEl={this.state.userIconElement}
                  keepMounted
                  open={Boolean(this.state.userIconElement)}
                  onClose={() => this.handleUserMenuClose()}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      if (this.props.saveDirtyFlag) {
                        this.setState({
                          confirmDialogOpen: true,
                          confirmDialogCallback: this.handleSignOut,
                        });
                      } else {
                        this.handleSignOut();
                      }
                    }}
                  >
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" color="primary" />
                  </MenuItem>
                </Menu>
              ) : null}
            </div>
            <ConfirmDialog
              open={this.state.confirmDialogOpen}
              handleClose={() => this.handleConfirmDialogClose()}
              onConfirm={this.state.confirmDialogCallback}
              title="Unsaved Changes"
              content="You have some unsaved changes. Are you sure you want to continue and discard unsaved changes?"
            />
          </Toolbar>
        </AppBar>
      </div>
    );
  };
}

export default connect(
  (state) => ({
    currentOpenFileId: state.currentOpenFileId,
    currentOpenFileName: state.currentOpenFileName,
    backendModeSignedInStatus: state.backendModeSignedInStatus,
    tagsInView: state.tagsInView,
    metadataInView: state.metadataInView,
    saveDirtyFlag: state.saveDirtyFlag,
    saveInProgress: state.saveInProgress,
  }),
  (dispatch) => ({
    dispatchSetBackendModeSignedInStatusAction: (mode) =>
      dispatch(setBackendModeSignedInStatusAction(mode)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
    dispatchNewUserAction: (newUser) => dispatch(setNewUserAction(newUser)),
    dispatchSignOutAction: () => dispatch(signoutAction()),
  })
)(Navbar);
