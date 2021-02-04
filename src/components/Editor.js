import './Editor.css';
import React from 'react';
import {connect} from 'react-redux';
import {checkNoOpenFileId} from '../util/FileIdAndTypeUtils';
import {
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
} from '../reducers/CurrentOpenFileState';
import {TextSelection} from 'prosemirror-state';
import TagMenu from './TagMenu';
import RichMarkdownEditor from 'rich-markdown-editor';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

class Editor extends React.Component {
  render = () => {
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    return (
      <div className="MainPane">
        <div className="editor_container">
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
              onChange={() => { if (!this.props.saveDirtyFlag) { this.props.dispatchSetSaveDirtyFlagAction(); } }}
            />
          </div>
          <div
            className="placeholder_editor"
            hidden={!noOpenFileIdCheck}>
            <h5>Click or create a new document from the left pane</h5>
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
