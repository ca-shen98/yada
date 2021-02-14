import "./Editor.css";
import { defer } from "lodash";
import React from "react";
import { connect } from "react-redux";
import {
  NO_OPEN_FILE_ID,
  checkNoOpenFileId,
  checkSourceFileId,
  getFileIdKeyStr,
} from "../util/FileIdAndTypeUtils";
import Editor from "./Editor";
import { handleSetCurrentOpenFileId } from "./Navigator";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import BlockTaggingEditorExtension from "../editor_extension/BlockTagging";
import { setToastAction, TOAST_SEVERITY } from "../reducers/Toast";
import { BACKEND_MODE_SIGNED_IN_STATUS } from "../reducers/BackendModeSignedInStatus";
import store from "../store";
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_FILE_LOADING,
  CLEAR_FILE_LOADING,
} from "../reducers/CurrentOpenFileState";

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = "initialTagFilters";

const DEFAULT_STATE = {
  fileIdKeyStr: getFileIdKeyStr(NO_OPEN_FILE_ID),
  fileContent: "",
};

class SourceEditorWithTagFiltersInput extends React.Component {
  state = DEFAULT_STATE;

  keydownHandler = (event) => {
    if (
      (window.navigator.platform.match("Mac")
        ? event.metaKey
        : event.ctrlKey) &&
      event.keyCode === 83
    ) {
      event.preventDefault();
      if (
        this.props.backendModeSignedInStatus !==
        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
      ) {
        if (checkSourceFileId(this.props.currentOpenFileId)) {
          FileStorageSystemClient.doSaveSourceContent(
            BlockTaggingEditorExtension.editor.value(true),
            this.props.currentOpenFileId.sourceId
          ).then((success) => {
            if (success) {
              this.props.dispatchSetToastAction({
                message: "Saved source file",
                severity: TOAST_SEVERITY.SUCCESS,
                open: true,
              });
              store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
            } else {
              this.props.dispatchSetToastAction({
                message: "Failed to save source file",
                severity: TOAST_SEVERITY.ERROR,
                open: true,
              });
            }
          });
        }
      }
    }
  };

  changeFile = async () => {
    if (!checkNoOpenFileId(this.props.currentOpenFileId)) {
      defer(() => {
        BlockTaggingEditorExtension.editor.focusAtStart();
      });
    }
    const fileIdKeyStr = getFileIdKeyStr(this.props.currentOpenFileId);
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      this.props.dispatchSetFileLoading();
      FileStorageSystemClient.doGetSourceContent(
        this.props.currentOpenFileId.sourceId
      ).then((value) => {
        this.props.dispatchClearFileLoading();
        if (value === null) {
          this.props.dispatchSetToastAction({
            message: "Failed to retrieve source content",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
          handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
        } else {
          this.setState({ fileIdKeyStr, fileContent: value ?? "" });
        }
      });
    } else {
      this.setState({ fileIdKeyStr, fileContent: "" });
    }
  };

  componentDidMount = () => {
    document.addEventListener("keydown", this.keydownHandler);
    this.changeFile();
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.keydownHandler);
  };

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.currentOpenFileId.sourceId !==
        this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      this.changeFile();
    }
  };

  render = () => {
    return this.props.fileLoading ? (
      <CircularProgress
        color="primary"
        style={{
          position: "absolute",
          top: "40%",
          left: "45%",
          height: "100px",
          width: "100px",
        }}
      />
    ) : (
      <Editor
        fileIdKeyStr={this.state.fileIdKeyStr}
        fileContent={this.state.fileContent}
      />
    );
  };
}

export default connect(
  (state) => ({
    currentOpenFileId: state.currentOpenFileId,
    currentOpenFileName: state.currentOpenFileName,
    fileLoading: state.fileLoading,
  }),
  (dispatch) => ({
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
    dispatchSetFileLoading: () => dispatch({ type: SET_FILE_LOADING }),
    dispatchClearFileLoading: () => dispatch({ type: CLEAR_FILE_LOADING }),
  })
)(SourceEditorWithTagFiltersInput);
