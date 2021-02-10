import './Editor.css';
import {defer} from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {NO_OPEN_FILE_ID, checkNoOpenFileId, checkSourceFileId, getFileIdKeyStr} from '../util/FileIdAndTypeUtils';
import Editor from './Editor';
import {handleSetCurrentOpenFileId} from './Navigator';

import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";
import {BACKEND_MODE_SIGNED_IN_STATUS} from "../reducers/BackendModeSignedInStatus";
import store from "../store";
import {SAVE_DIRTY_STATUS, setSaveDirtyStatusAction} from "../reducers/CurrentOpenFileState";

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';

const DEFAULT_STATE = {
  fileIdKeyStr: getFileIdKeyStr(NO_OPEN_FILE_ID),
  fileContent: '',
};

export const handleSaveSourceContent = async () => {
  store.dispatch(setSaveDirtyStatusAction(SAVE_DIRTY_STATUS.SAVING));
  FileStorageSystemClient.doSaveSourceContent(
      BlockTaggingEditorExtension.editor.value(true),
      store.getState().currentOpenFileId.sourceId,
  ).then(success => {
    if (success) {
      store.dispatch(setToastAction({
        message: "Saved source file",
        severity: TOAST_SEVERITY.SUCCESS,
        open: true
      }));
      store.dispatch(setSaveDirtyStatusAction(SAVE_DIRTY_STATUS.NONE));
    }
    else {
      store.dispatch(setToastAction({
        message: "Failed to save source file",
        severity: TOAST_SEVERITY.ERROR,
        open: true
      }));
    }
  });
};

class SourceEditorWithTagFiltersInput extends React.Component {

  state = DEFAULT_STATE;
  
  changeFile = async () => {
    if (!checkNoOpenFileId(this.props.currentOpenFileId)) {
      defer(() => {
        BlockTaggingEditorExtension.editor.focusAtStart();
      });
    }
    const fileIdKeyStr = getFileIdKeyStr(this.props.currentOpenFileId);
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      FileStorageSystemClient.doGetSourceContent(this.props.currentOpenFileId.sourceId).then(value => {
        if (value === null) {
          this.props.dispatchSetToastAction({
            message: "Failed to retrieve source content",
            severity: TOAST_SEVERITY.ERROR,
            open: true
          });
          handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
        } else {
          this.setState({fileIdKeyStr, fileContent: value ?? ''});
        }
      });
    } else {
      this.setState({fileIdKeyStr, fileContent: ''});
    }
  };

  componentDidMount = () => { this.changeFile(); };
  
  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      this.changeFile();
    }
  };

  render = () => {
    return (
      <Editor fileIdKeyStr={this.state.fileIdKeyStr} fileContent={this.state.fileContent} />
    );
  };
}

export default connect(
    state => ({
      currentOpenFileId: state.currentOpenFileId,
      currentOpenFileName: state.currentOpenFileName
    }),
    dispatch => ({
      dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
    }),
)(SourceEditorWithTagFiltersInput);
