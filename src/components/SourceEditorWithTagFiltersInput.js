import './Editor.css';
import {defer} from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {NO_OPEN_FILE_ID, checkNoOpenFileId, checkSourceFileId, getFileIdKeyStr} from '../util/FileIdAndTypeUtils';
import {Selection, TextSelection} from 'prosemirror-state';
import {parse as parseTagFilters} from '../lib/TagFiltersGrammar';
import {TagFilteringPluginKey} from '../editor_extension/plugins/TagFiltering';
import Editor from './Editor';
import {handleSetCurrentOpenFileId} from './Navigator';

import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';

const TAG_FILTERS_INPUT_ID = 'tag_filters_input';
const SAVED_TAG_FILTERS_DATALIST_ID = 'saved_tag_filters_datalist';

const DEFAULT_STATE = {
  fileIdKeyStr: getFileIdKeyStr(NO_OPEN_FILE_ID),
  fileContent: '',
  modifyingTagFilters: false,
  currentTagFiltersStr: '',
  currentParsedTagFiltersStr: '',
  sourceSavedTagFilters: {},
};

class SourceEditorWithTagFiltersInput extends React.Component {

  state = DEFAULT_STATE;

  handleCancelModifyingTagFilters = () => {
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

  // TODO remove from list directly instead of only unpersist current
  handleUnpersistCurrentTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      !this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr)
    ) { return false; }
    const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
    delete newSourceSavedTagFilters[this.state.currentParsedTagFiltersStr];
    FileStorageSystemClient.doSetSourceSavedTagFilters(
      this.props.currentOpenFileId.sourceId,
      newSourceSavedTagFilters,
    ).then(success => {
      if (!success) { alert('failed to set source saved tag filters'); }
      else { this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters }); }
    });
  };

  handlePersistNewSavedTagFilters = () => {
    if (
      !this.state.currentTagFiltersStr ||
      this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr)
    ) { return false; }
    const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
    newSourceSavedTagFilters[this.state.currentParsedTagFiltersStr] = this.state.currentTagFiltersStr;
    FileStorageSystemClient.doSetSourceSavedTagFilters(
      this.props.currentOpenFileId.sourceId,
      newSourceSavedTagFilters,
    ).then(success => {
      if (!success) { alert('failed to set source saved tag filters'); }
      else { this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters }); }
    });
  };

  handleApplyTagFilters = () => {
    let tagFilters = null;
    const tagFiltersStr = document.getElementById(TAG_FILTERS_INPUT_ID).value.trim();
    if (tagFiltersStr) {
      tagFilters = parseTagFilters(tagFiltersStr);
      if (!tagFilters) {
        alert('invalid tag filters');
        return false;
      }
    }
    document.getElementById(TAG_FILTERS_INPUT_ID).value = tagFiltersStr;
    if (tagFilters) { localStorage.setItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, tagFiltersStr); }
    else { localStorage.removeItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY); }
    const parsedTagFiltersStr = JSON.stringify(tagFilters);
    const oldParsedTagFiltersStr = this.state.currentParsedTagFiltersStr;
    this.setState({ currentTagFiltersStr: tagFiltersStr, currentParsedTagFiltersStr: parsedTagFiltersStr });
    if (parsedTagFiltersStr === oldParsedTagFiltersStr) { return true; }
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setMeta(TagFilteringPluginKey, tagFilters)
        .setSelection(
          tagFilters
            ? TextSelection.create(BlockTaggingEditorExtension.editor.view.state.doc, 0, 0)
            : Selection.atStart(BlockTaggingEditorExtension.editor.view.state.doc)
        ).scrollIntoView()
    );
    defer(() => {
      if (tagFilters) { BlockTaggingEditorExtension.editor.view.dom.blur(); }
      else { BlockTaggingEditorExtension.editor.view.focus(); }
    });
    return true;
  };

  changeFile = async () => {
    if (!checkNoOpenFileId(this.props.currentOpenFileId)) {
      defer(() => { BlockTaggingEditorExtension.editor.focusAtStart(); });
    }
    const fileIdKeyStr = getFileIdKeyStr(this.props.currentOpenFileId);
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      FileStorageSystemClient.doGetSourceContent(this.props.currentOpenFileId.sourceId).then(value => {
        if (value === null) {
          alert('failed to retrieve source content');
          handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
        } else {
          this.setState({ fileIdKeyStr, fileContent: value ?? '' });
          FileStorageSystemClient.doGetSourceSavedTagFilters(this.props.currentOpenFileId.sourceId)
            .then(sourceSavedTagFilters => {
               if (!sourceSavedTagFilters) { }//alert('failed to retrieve source saved tag filters'); }
              else { this.setState({ sourceSavedTagFilters }); }
            });
        }
      });
    } else { this.setState({ fileIdKeyStr, fileContent: '' }); }
  };

  componentDidMount = () => {
    this.changeFile().then(() => {
      if (checkSourceFileId(this.props.currentOpenFileId)) {
        const initialTagFiltersStr = localStorage.getItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY);
        if (initialTagFiltersStr) {
          document.getElementById(TAG_FILTERS_INPUT_ID).value = initialTagFiltersStr;
          this.handleApplyTagFilters();
        }
      }
    });
  };

  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      document.getElementById(TAG_FILTERS_INPUT_ID).value = '';
      this.handleApplyTagFilters();
      this.setState({ sourceSavedTagFilters: {} });
      this.changeFile();
    }
  };

  render = () => {
    const sourceFileIdCheck = checkSourceFileId(this.props.currentOpenFileId);
    const currentTagFiltersSaved =
      this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentParsedTagFiltersStr);
    return (
      <Editor fileIdKeyStr={this.state.fileIdKeyStr} fileContent={this.state.fileContent}>
        <div className="InputRow">
          <button
            className="MonospaceCharButton"
            title={(currentTagFiltersSaved ? 'un-' : '') + 'persist'}
            disabled={!sourceFileIdCheck || !this.state.currentTagFiltersStr || this.state.modifyingTagFilters}
            onClick={
              currentTagFiltersSaved ? this.handleUnpersistCurrentTagFilters : this.handlePersistNewSavedTagFilters
            }>
            {currentTagFiltersSaved ? '-' : '+'}
          </button>
          <button
            className="MonospaceCharButton"
            title="modify"
            disabled={!sourceFileIdCheck || this.state.modifyingTagFilters}
            onClick={this.handleStartModifyingTagFilters}>
            {'#'}
          </button>
          <input
            id={TAG_FILTERS_INPUT_ID}
            defaultValue={this.state.currentTagFiltersStr}
            placeholder="tag filters"
            title="tag filters - example syntax: ( #{tag1} | !( #{tag2} ) ) & #{tag3}"
            list={SAVED_TAG_FILTERS_DATALIST_ID}
            disabled={!sourceFileIdCheck || !this.state.modifyingTagFilters}
            onBlur={event => {
              if (this.handleApplyTagFilters()) { this.setState({ modifyingTagFilters: false }); }
              else {
                const input = event.target;
                defer(() => { input.focus(); });
              }
            }}
            onKeyDown={event => { if (event.key === 'Escape') { this.handleCancelModifyingTagFilters(); } }}
            onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
          />
          <datalist id={SAVED_TAG_FILTERS_DATALIST_ID}>
            {
              Object.entries(this.state.sourceSavedTagFilters)
                .map(([_parsedTagFiltersStr, tagFiltersStr]) => <option key={tagFiltersStr} value={tagFiltersStr} />)
            }
          </datalist>
          <button
            className="MonospaceCharButton"
            title="clear"
            disabled={!sourceFileIdCheck || !this.state.currentTagFiltersStr || this.state.modifyingTagFilters}
            onClick={() => {
              document.getElementById(TAG_FILTERS_INPUT_ID).value = '';
              this.handleApplyTagFilters();
            }}>
            {'✕'}
          </button>
        </div>
      </Editor>
    );
  };
};

export default connect(state => ({ currentOpenFileId: state.currentOpenFileId }))(SourceEditorWithTagFiltersInput);
