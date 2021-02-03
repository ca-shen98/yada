import './Editor.css';
import {defer} from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {NO_OPEN_FILE_ID, checkNoOpenFileId, checkSourceFileId, getFileIdKeyStr} from '../util/FileIdAndTypeUtils';
import Editor from './Editor';
import {handleSetCurrentOpenFileId} from './Navigator';

import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';

const DEFAULT_STATE = {
  fileIdKeyStr: getFileIdKeyStr(NO_OPEN_FILE_ID),
  fileContent: '',
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
          alert('failed to retrieve source content');
          handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
        } else {
          this.setState({fileIdKeyStr, fileContent: value ?? ''});
        }
      });
    } else {
      this.setState({fileIdKeyStr, fileContent: ''});
    }
  };

  componentDidMount = () => {
    this.changeFile();
  };

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

export default connect(state => ({ currentOpenFileId: state.currentOpenFileId , 
                                  currentOpenFileName: state.currentOpenFileName}))(SourceEditorWithTagFiltersInput);
