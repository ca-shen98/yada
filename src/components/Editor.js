import './Editor.css';
import React from 'react';
import {connect} from 'react-redux';
import {checkNoOpenFileId} from '../util/FileIdAndTypeUtils';
import {SAVE_DIRTY_STATUS, setSaveDirtyStatusAction} from '../reducers/CurrentOpenFileState';
import {TextSelection} from 'prosemirror-state';
import TagMenu from './TagMenu';
import RichMarkdownEditor from 'rich-markdown-editor';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

class Editor extends React.Component {
  render = () => {
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    return (
      <div className="MainPane">
          <div className="editor" hidden={noOpenFileIdCheck}>
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
              onChange={() => {
                if (this.props.saveDirtyStatus === SAVE_DIRTY_STATUS.NONE) {
                  this.props.dispatchSetSaveDirtyStatusAction(SAVE_DIRTY_STATUS.DIRTY);
                }
              }}
            />
          </div>
          <div
            className="placeholder_editor"
            hidden={!noOpenFileIdCheck}>
            <h5>Click or create a new document from the left pane</h5>
          </div>
        <TagMenu />
      </div>
    );
  };
};

export default connect(
  state => ({ currentOpenFileId: state.currentOpenFileId, currentOpenFileName: state.currentOpenFileName, saveDirtyStatus: state.saveDirtyStatus }),
  dispatch => ({ dispatchSetSaveDirtyStatusAction: status => dispatch(setSaveDirtyStatusAction(status)) }),
)(Editor);
