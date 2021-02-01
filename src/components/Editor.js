import './Editor.css';
import React from 'react';
import {connect} from 'react-redux';
import {NO_OPEN_FILE_ID, checkNoOpenFileId, checkSourceFileId} from '../util/FileIdAndTypeUtils';
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
} from '../reducers/CurrentOpenFileState';
import {TextSelection} from 'prosemirror-state';
import {handleSetCurrentOpenFileId} from './Navigator';
import TagMenu from './TagMenu';
import RichMarkdownEditor from 'rich-markdown-editor';

import store from '../store';
import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import DescriptionIcon from '@material-ui/icons/Description';
import Link from '@material-ui/core/Link';

export const handleSaveCurrentFileEditorContent = () => {
  const currentOpenFileId = store.getState().currentOpenFileId;
  if (checkSourceFileId(store.getState().currentOpenFileId) && store.getState().saveDirtyFlag) {
    FileStorageSystemClient.doSaveSourceContent(
      BlockTaggingEditorExtension.editor.value(true),
      currentOpenFileId.sourceId,
    ).then(success => {
      if (success) { store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE }); }
      else { alert('failed to save source content'); }
    });
  }
};

class Editor extends React.Component {
  render = () => {
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    return (
      <div className="MainPane">
        <div id="editor_container">
          <div className="InputRow" id="current_open_file_controls">
            {this.props.currentOpenFileName.sourceName == '' ? null : 
              <Breadcrumbs aria-label="breadcrumb" style={{marginTop: "10px", marginRight: "10px"}}>
                <Link color="inherit" style={{backgroundColor: "#1E3D59", color: "#F5F0E1", borderRadius: "10px", padding: "10px"}}> 
                  <DescriptionIcon />
                  {this.props.currentOpenFileName.sourceName}
                </Link>
              </Breadcrumbs>
            }
            <Button
              variant="contained"
              color="primary"
              title="save"
              disabled={noOpenFileIdCheck || !this.props.saveDirtyFlag}
              onClick={handleSaveCurrentFileEditorContent}
              startIcon={<SaveIcon />}
              style= {{ borderRadius: "10px", marginTop: "3px", color: "#F5F0E1", paddingTop: "7px", paddingBottom: "7px" }}
              >
             Save
            </Button>
            <div style={{ minWidth: '5px' }} />
            {this.props.children}
          </div>
          <div id="editor" hidden={noOpenFileIdCheck}>
            <RichMarkdownEditor
              extensions={[BlockTaggingEditorExtension]}
              key={this.props.fileIdKeyStr}
              defaultValue={this.props.fileContent}
              jsonStrValue={!(!this.props.fileContent)}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  BlockTaggingEditorExtension.editor.view.dispatch(
                    BlockTaggingEditorExtension.editor.view.state.tr
                      .setSelection(TextSelection.create(BlockTaggingEditorExtension.editor.view.state.doc, 0, 0))
                  );
                  event.target.blur();
                }
              }}
              onChange={() => { if (!this.props.saveDirtyFlag) { this.props.dispatchSetSaveDirtyFlagAction(); } }}
            />
          </div>
          <div
            className="PlaceholderDivWithText"
            id="no_file_editor_placeholder"
            hidden={!noOpenFileIdCheck}>
            <div style={{ flexGrow: 1 }} />
            <div style={{ display: 'flex' }}>
              <div style={{ flexGrow: 2 }} />
              open a doc using the navigator side pane on the left
              <div style={{ flexGrow: 3 }} />
            </div>
            <div style={{ flexGrow: 8 }} />
          </div>
        </div>
        <TagMenu />
      </div>
    );
  };
};

export default connect(
  state => ({ currentOpenFileId: state.currentOpenFileId, currentOpenFileName: state.currentOpenFileName, saveDirtyFlag: state.saveDirtyFlag }),
  dispatch => ({ dispatchSetSaveDirtyFlagAction: () => dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }) }),
)(Editor);
