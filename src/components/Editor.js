import './Editor.css';
import {defer} from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {FILE_TYPE, getFileType, getFileIdKeyStr} from '../util/FileIdAndTypeUtils';
import store from '../store';
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  NO_OPEN_FILE_ID,
} from '../reducers/CurrentOpenFileState';
import {setRenamingInputStateAction} from '../reducers/RenamingInputState';
import {
  doSaveSourceContent,
  doGetSourceContent,
  doSetSourceSavedTagFilters,
  doGetSourceSavedTagFilters,
} from '../backend/FileStorageSystem';
import {TextSelection} from 'prosemirror-state';
import {parse as parseTagFilters} from '../lib/TagFiltersGrammar';
import {TagFilteringPluginKey} from '../editor_extension/plugins/TagFiltering';
import {handleSetCurrentOpenFileId} from './Navigator';
import TagMenu from './TagMenu';
import RichMarkdownEditor from 'rich-markdown-editor';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

export const handleSaveCurrentFileEditorContent = () => {
  const currentOpenFileId = store.getState().currentOpenFileId;
  if (getFileType(store.getState().currentOpenFileId) === FILE_TYPE.SOURCE && store.getState().saveDirtyFlag) {
    doSaveSourceContent(BlockTaggingEditorExtension.editor.value(true), currentOpenFileId.sourceId).then(success => {
      if (success) { store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE }); }
      else { alert('failed to save source content'); }
    });
  }
};

const TAG_FILTERS_INPUT_ID = 'tag_filters_input';

const SAVED_TAG_FILTERS_DATALIST_ID = 'saved_tag_filters_datalist';

class Editor extends React.Component {

  state = {
    editorKey: '',
    setEditorValue: '',
    modifyingTagFilters: false,
    currentTagFiltersStr: '',
    currentParsedTagFiltersStr: null,
    sourceSavedTagFilters: {},
  };

  handleResetTagFiltersInput = () => {
    const input = document.getElementById(TAG_FILTERS_INPUT_ID);
    input.value = this.state.currentTagFiltersStr;
    this.setState({ modifyingTagFilters: false });
  };

  handleStartModifyingTagFilters = () => {
    this.setState({ modifyingTagFilters: true });
    defer(() => {
      const input = document.getElementById(TAG_FILTERS_INPUT_ID);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  };

  handleApplyTagFilters = () => {
    let tagFilters = null;
    const tagFiltersStr = document.getElementById(TAG_FILTERS_INPUT_ID).value.trim();
    if (tagFiltersStr === this.state.currentTagFiltersStr) { return true; }
    if (tagFiltersStr) {
      tagFilters = parseTagFilters(tagFiltersStr);
      if (!tagFilters) {
        alert('invalid tag filters');
        return false;
      }
    }
    const editorStateTransaction =
      BlockTaggingEditorExtension.editor.view.state.tr.setMeta(TagFilteringPluginKey, tagFilters);
    if (tagFiltersStr) {
      editorStateTransaction.setSelection(
        TextSelection.create(BlockTaggingEditorExtension.editor.view.state.doc, 0, 0)
      );
    }
    BlockTaggingEditorExtension.editor.view.dispatch(editorStateTransaction);
    this.setState({ currentTagFiltersStr: tagFiltersStr, currentParsedTagFiltersStr: JSON.stringify(tagFilters) });
    defer(() => {
      document.getElementById(TAG_FILTERS_INPUT_ID).value = tagFiltersStr;
      if (tagFiltersStr) { BlockTaggingEditorExtension.editor.view.dom.blur(); } 
      else { BlockTaggingEditorExtension.editor.focusAtStart(); }
    });
    return true;
  };

  handleUnpersistCurrentTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      !this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr)
    ) { return false; }
    const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
    delete newSourceSavedTagFilters[this.state.currentParsedTagFiltersStr];
    doSetSourceSavedTagFilters(this.props.currentOpenFileId.sourceId, newSourceSavedTagFilters);
    this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters });
  };

  handlePersistNewSavedTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr)
    ) { return false; }
    const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
    newSourceSavedTagFilters[this.state.currentParsedTagFiltersStr] = this.state.currentTagFiltersStr;
    doSetSourceSavedTagFilters(this.props.currentOpenFileId.sourceId, newSourceSavedTagFilters);
    this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters });
  };

  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      const fileType = getFileType(this.props.currentOpenFileId);
      document.getElementById(TAG_FILTERS_INPUT_ID).value = '';
      if (fileType) { this.handleApplyTagFilters(); }
      const fileIdKeyStr = getFileIdKeyStr(this.props.currentOpenFileId);
      if (fileType === FILE_TYPE.SOURCE) {
        doGetSourceContent(this.props.currentOpenFileId.sourceId).then(value => {
          if (!value) { alert('failed to retrieve source content'); }
          this.setState({ editorKey: fileIdKeyStr, setEditorValue: value ?? '' });
          BlockTaggingEditorExtension.editor.focusAtStart();
        });
      } else { this.setState({ editorKey: fileIdKeyStr, setEditorValue: '' }); }
      this.setState({
        sourceSavedTagFilters: fileType === FILE_TYPE.SOURCE
          ? doGetSourceSavedTagFilters(this.props.currentOpenFileId.sourceId) : {}
      });
    }
  };

  render = () => {
    const fileType = getFileType(this.props.currentOpenFileId);
    const currentTagFiltersSaved =
      this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr);
    return (
      <div className="MainPane">
        <div id="editor_container">
          <div className="InputRow" id="current_open_file_controls">
            <button
              className="MonospaceCharButton"
              title="close"
              disabled={!fileType}
              onClick={() => { handleSetCurrentOpenFileId(NO_OPEN_FILE_ID); }}>
              {'✕'}
            </button>
            <button
              className="MonospaceCharButton"
              title="save"
              disabled={!fileType || !this.props.saveDirtyFlag}
              onClick={handleSaveCurrentFileEditorContent}>
              {'^'}
            </button>
            <div style={{ flex: 'auto', minWidth: '5px' }} />
            <div className="InputRow" id="tag_filters_input_row">
              <button
                className="MonospaceCharButton"
                title={(currentTagFiltersSaved ? 'un-' : '') + 'persist'}
                hidden={fileType !== FILE_TYPE.SOURCE || this.state.modifyingTagFilters}
                disabled={!this.state.currentTagFiltersStr}
                onClick={
                  currentTagFiltersSaved ? this.handleUnpersistCurrentTagFilters : this.handlePersistNewSavedTagFilters
                }>
                {currentTagFiltersSaved ? '-' : '+'}
              </button>
              <button
                className="MonospaceCharButton"
                title="modify"
                hidden={this.state.modifyingTagFilters}
                disabled={fileType !== FILE_TYPE.SOURCE}
                onClick={this.handleStartModifyingTagFilters}>
                {'#'}
              </button>
              <input
                id={TAG_FILTERS_INPUT_ID}
                defaultValue={this.state.currentTagFiltersStr}
                placeholder="tag filters"
                title="tag filters - example syntax: ( #{tag1} | !( #{tag2} ) ) & #{tag3}"
                list={SAVED_TAG_FILTERS_DATALIST_ID}
                disabled={fileType !== FILE_TYPE.SOURCE || !this.state.modifyingTagFilters}
                onBlur={event => {
                  if (this.handleApplyTagFilters()) { this.handleResetTagFiltersInput(); }
                  else {
                    const input = event.target;
                    defer(() => { input.focus(); });
                  }
                }}
                onKeyDown={event => { if (event.key === 'Escape') { this.handleResetTagFiltersInput(); } }}
                onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
              />
              <datalist id={SAVED_TAG_FILTERS_DATALIST_ID}>
                {
                  Object.entries(this.state.sourceSavedTagFilters)
                    .map(([_parsedTagFiltersStr, tagFiltersStr]) => <option value={tagFiltersStr} />)
                }
              </datalist>
              <button
                className="MonospaceCharButton"
                title="clear"
                hidden={
                  fileType !== FILE_TYPE.SOURCE || !this.state.currentTagFiltersStr || this.state.modifyingTagFilters
                }
                onClick={() => {
                  document.getElementById(TAG_FILTERS_INPUT_ID).value = '';
                  this.handleApplyTagFilters();
                }}>
                {'✕'}
              </button>
            </div>
          </div>
          <div id="editor" hidden={!fileType}>
            <RichMarkdownEditor
              extensions={[BlockTaggingEditorExtension]}
              key={this.state.editorKey}
              defaultValue={this.state.setEditorValue}
              jsonStrValue={!(!this.state.setEditorValue)}
              onSave={handleSaveCurrentFileEditorContent}
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
            hidden={fileType}>
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
  state => ({ currentOpenFileId: state.currentOpenFileId, saveDirtyFlag: state.saveDirtyFlag }),
  dispatch => ({
    dispatchSetSaveDirtyFlagAction: () => dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
    dispatchSetRenamingInputStateAction:
      renamingInputState => dispatch(setRenamingInputStateAction(renamingInputState)),
  }),
)(Editor);
