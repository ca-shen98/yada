import './Editor.css';
import {defer} from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import store from '../store';
import {
  getFileIdKeyStr,
  doSaveSourceContent,
  doGetSourceContent,
  calculateNextNewIdKey,
  persistNewFilterViewAction,
  modifyFilterViewAction,
  FILE_TYPES,
} from '../reducers/FileStorageSystem';
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE,
  CLEAR_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE,
  NO_OPEN_FILE_ID_KEY,
} from '../reducers/CurrentOpenFileState';
import {RENAME_INPUT_TYPES, setRenamingInputStateAction} from '../reducers/RenamingInputState';
import {TagFilteringPluginKey} from '../editor_extension/plugins/TagFiltering';
import {parse as parseTagFilters} from '../lib/TagFilteringExpressionGrammar';
import {TextSelection} from 'prosemirror-state';
import {
  calculateFileIdKeyDerivedParameters,
  getRenameInputIdFunctions,
  handleSetCurrentOpenFileIdKey,
} from './Navigator';
import TagMenu from './TagMenu';
import RichMarkdownEditor from 'rich-markdown-editor';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

export const TAG_FILTERING_INPUT_ID = 'tag_filtering_input';

export const handleSaveCurrentFileEditorContent = () => {
  const currentOpenFileIdKey = store.getState().currentOpenFileIdKey;
  const { fileType } = calculateFileIdKeyDerivedParameters(currentOpenFileIdKey);
  if ((fileType === FILE_TYPES.SOURCE || fileType === FILE_TYPES.FILTER_VIEW) && store.getState().saveDirtyFlag) {
    doSaveSourceContent(currentOpenFileIdKey.sourceIdKey, BlockTaggingEditorExtension.editor.value(true));
    store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
  }
};

class Editor extends React.Component {

  state = { currentTagFiltersStr: '' };

  handleResetTagFilteringInput = () => {
    const input = document.getElementById(TAG_FILTERING_INPUT_ID);
    if (input.value !== this.state.currentTagFiltersStr) { input.value = this.state.currentTagFiltersStr; }
    this.props.dispatchClearModifyingTagFiltersFlagAction();
  };

  handleApplyTagFilters = () => {
    let tagFilters = null;
    const tagFiltersStr = document.getElementById(TAG_FILTERING_INPUT_ID).value.trim();
    if (tagFiltersStr === this.state.currentTagFiltersStr) { return true; }
    if (tagFiltersStr) {
      tagFilters = parseTagFilters(tagFiltersStr);
      if (!tagFilters) {
        alert('invalid tag filtering expression');
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
    this.setState({ currentTagFiltersStr: tagFiltersStr });
    defer(() => {
      if (tagFiltersStr) { BlockTaggingEditorExtension.editor.view.dom.blur(); } 
      else { BlockTaggingEditorExtension.editor.focusAtStart(); }
    });
    return true;
  };

  handleModifyFilterView = () => {
    const tagFiltersStr = document.getElementById(TAG_FILTERING_INPUT_ID).value.trim();
    if (!tagFiltersStr) {
      alert('empty tag filtering expression');
      return false;
    }
    if (this.handleApplyTagFilters()) {
      this.props.dispatchModifyFilterViewAction(
        this.props.currentOpenFileIdKey.sourceIdKey,
        this.props.currentOpenFileIdKey.viewIdKey,
        tagFiltersStr,
      );
      return true;
    }
    return false;
  };

  handlePersistNewFilterView = () => {
    if (!this.state.currentTagFiltersStr) { return false; }
    this.props.dispatchPersistNewFilterViewAction(
      this.props.currentOpenFileIdKey.sourceIdKey,
      this.state.currentTagFiltersStr,
    );
    const fileIdKey = {
      sourceIdKey: this.props.currentOpenFileIdKey.sourceIdKey,
      viewIdKey: this.props.viewsState.hasOwnProperty(this.props.currentOpenFileIdKey.sourceIdKey)
        ? this.props.viewsState[this.props.currentOpenFileIdKey.sourceIdKey].nextNewViewIdKey
        : calculateNextNewIdKey({}, 0),
    };
    defer(() => {
      this.props.dispatchSetRenamingInputStateAction({
        inputType: RENAME_INPUT_TYPES.VIEW_LIST_ITEM,
        fileIdKey: fileIdKey,
      });
      defer(() => {
        const input = document.getElementById(getRenameInputIdFunctions[RENAME_INPUT_TYPES.VIEW_LIST_ITEM](fileIdKey));
        input.focus();
        input.setSelectionRange(0, input.value.length);
      });
    });
    return true;
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.currentTagFiltersStr !== this.state.currentTagFiltersStr) {
      document.getElementById(TAG_FILTERING_INPUT_ID).value = this.state.currentTagFiltersStr;
    }
    if (
      prevProps.currentOpenFileIdKey.sourceIdKey !== this.props.currentOpenFileIdKey.sourceIdKey ||
      prevProps.currentOpenFileIdKey.viewIdKey !== this.props.currentOpenFileIdKey.viewIdKey
    ) {
      const { fileType, tagFilters } = calculateFileIdKeyDerivedParameters(this.props.currentOpenFileIdKey);
      if (fileType === FILE_TYPES.FILTER_VIEW) { document.getElementById(TAG_FILTERING_INPUT_ID).value = tagFilters; }
      else { document.getElementById(TAG_FILTERING_INPUT_ID).value = ''; }
      if (fileType !== FILE_TYPES.INVALID) { this.handleApplyTagFilters(); }
      if (fileType === FILE_TYPES.SOURCE) { BlockTaggingEditorExtension.editor.focusAtStart(); }
    }
  };

  render = () => {
    const fileIdKeyStr = getFileIdKeyStr(this.props.currentOpenFileIdKey);
    const { fileType } = calculateFileIdKeyDerivedParameters(this.props.currentOpenFileIdKey);
    const value = fileType === FILE_TYPES.SOURCE || fileType === FILE_TYPES.FILTER_VIEW
      ? doGetSourceContent(this.props.currentOpenFileIdKey.sourceIdKey) : '';
    return (
      <div className="MainPane">
        <div id="editor_container">
          <div className="InputRow" id="current_open_file_controls">
            <button
              className="MonospaceCharButton"
              title="close"
              disabled={fileType === FILE_TYPES.INVALID}
              onClick={() => { handleSetCurrentOpenFileIdKey(NO_OPEN_FILE_ID_KEY); }}>
              {'✕'}
            </button>
            <button
              className="MonospaceCharButton"
              title="save"
              disabled={fileType === FILE_TYPES.INVALID || !this.props.saveDirtyFlag}
              onClick={handleSaveCurrentFileEditorContent}>
              {'^'}
            </button>
            <div style={{ flex: 'auto', minWidth: '5px' }} />
            <div className="InputRow" id="tag_filtering_input_row">
              <button
                className="MonospaceCharButton"
                title="persist"
                hidden={fileType !== FILE_TYPES.SOURCE || this.props.modifyingTagFiltersFlag}
                disabled={!this.state.currentTagFiltersStr}
                onClick={this.handlePersistNewFilterView}>
                {'+'}
              </button>
              <button
                className="MonospaceCharButton"
                title="modify"
                hidden={this.props.modifyingTagFiltersFlag}
                disabled={fileType !== FILE_TYPES.SOURCE && fileType !== FILE_TYPES.FILTER_VIEW}
                onClick={() =>{
                  this.props.dispatchSetModifyingTagFiltersFlagAction();
                  defer(() => {
                    const input = document.getElementById(TAG_FILTERING_INPUT_ID);
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                  });
                }}>
                {'#'}
              </button>
              <input
                id={TAG_FILTERING_INPUT_ID}
                defaultValue={this.state.currentTagFiltersStr}
                placeholder="tag filtering expression"
                title="tag filtering expression - example syntax: ( #{tag1} | !( #{tag2} ) ) & #{tag3}"
                disabled={
                  (fileType !== FILE_TYPES.SOURCE && fileType !== FILE_TYPES.FILTER_VIEW) ||
                  !this.props.modifyingTagFiltersFlag
                }
                onBlur={event => {
                  if (
                    (fileType === FILE_TYPES.FILTER_VIEW && this.handleModifyFilterView()) ||
                    (fileType === FILE_TYPES.SOURCE && this.handleApplyTagFilters())
                  ) { this.handleResetTagFilteringInput(); }
                  else {
                    const input = event.target;
                    defer(() => { input.focus(); });
                  }
                }}
                onKeyDown={event => { if (event.key === 'Escape') { this.handleResetTagFilteringInput(); } }}
                onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
              />
              <button
                className="MonospaceCharButton"
                title="clear"
                hidden={
                  fileType !== FILE_TYPES.SOURCE || !this.state.currentTagFiltersStr ||
                  this.props.modifyingTagFiltersFlag
                }
                onClick={() => {
                  document.getElementById(TAG_FILTERING_INPUT_ID).value = '';
                  this.handleApplyTagFilters();
                }}>
                {'✕'}
              </button>
            </div>
          </div>
          <div id="editor" hidden={fileType === FILE_TYPES.INVALID}>
            <RichMarkdownEditor
              extensions={[BlockTaggingEditorExtension]}
              key={fileIdKeyStr}
              defaultValue={value}
              jsonStrValue={!(!value)}
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
            hidden={fileType !== FILE_TYPES.INVALID}>
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
  state => ({
    viewsState: state.fileStorageSystem.viewsState,
    currentOpenFileIdKey: state.currentOpenFileIdKey,
    saveDirtyFlag: state.saveDirtyFlag,
    modifyingTagFiltersFlag: state.modifyingTagFiltersFlag,
  }),
  dispatch => ({
    dispatchPersistNewFilterViewAction:
      (sourceIdKey, tagFilters) => dispatch(persistNewFilterViewAction(sourceIdKey, tagFilters)),
    dispatchModifyFilterViewAction:
      (sourceIdKey, viewIdKey, tagFilters) => dispatch(modifyFilterViewAction(sourceIdKey, viewIdKey, tagFilters)),
    dispatchSetSaveDirtyFlagAction: () => dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
    dispatchSetModifyingTagFiltersFlagAction: () => dispatch({ type: SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE }),
    dispatchClearModifyingTagFiltersFlagAction: () => dispatch({ type: CLEAR_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE }),
    dispatchSetRenamingInputStateAction:
      renamingInputState => dispatch(setRenamingInputStateAction(renamingInputState)),
  }),
)(Editor);
