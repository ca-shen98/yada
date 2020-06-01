import React from 'react';
import {connect} from 'react-redux';
import Actions from '../actions';
import {initialTagFiltersText} from '../reducers/SetTagFilters';
import {parse as parseTagFilters} from '../lib/TagFilters';
import {FILE_NAME_PREFIX_LOCAL_STORAGE_KEY, FILES_LIST_LOCAL_STORAGE_KEY} from '../reducers/ChangeFileNameKey';

class Header extends React.Component {
  TAG_FILTERS_INPUT_ID = 'tag_filters_input';
  FILE_EXPLORER_INPUT_ID = 'file_explorer_input';
  FILE_EXPLORER_LIST_ID = 'file_explorer_list';
  FILE_NAME_KEY_CHAR_REGEX = /\w/;

  state = {
    tagFiltersText: initialTagFiltersText,
  };

  handleApplyTagFilters = (modifyState = true, checkState = true) => {
    const tagFiltersInput = document.getElementById(this.TAG_FILTERS_INPUT_ID).value.trim();
    if (checkState && tagFiltersInput === this.state.tagFiltersText) {
      return; // don't need to re-apply since already applied
    }
    let tagFiltersExpr = null;
    if (tagFiltersInput) {
      tagFiltersExpr = parseTagFilters(tagFiltersInput);
      if (!tagFiltersExpr) { // if invalid expr, reset the input value to the current valid tag filters text state
        document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.state.tagFiltersText;
        return;
      }
    }
    this.props.setTagFilters(tagFiltersExpr);
    if (modifyState) {
      this.setState({ tagFiltersText: tagFiltersInput });
    }
  };

  handleTagFiltersKeyPress = event => {
    if (event.key === 'Enter') {
      this.handleApplyTagFilters();
    }
  };

  handleToggleEditorReadOnly = () => {
    // currently the prop is the previous value, before toggling
    document.getElementById(this.TAG_FILTERS_INPUT_ID).value =
      this.props.editorReadOnly ? '' : this.state.tagFiltersText;
    this.handleApplyTagFilters(false, false);
    this.props.toggleEditorReadOnly();
  };

  handleToggleEditorDarkMode = () => this.props.toggleEditorDarkMode();

  handleFileExplorerKeyPress = event => {
    if (event.key === 'Enter') {
      this.handleLoadFile();
    }
    if (event.key.length !== 1 || !this.FILE_NAME_KEY_CHAR_REGEX.test(event.key)) {
      event.preventDefault();
    }
  };

  handleLoadFile = () => {
    const fileNameKey = document.getElementById(this.FILE_EXPLORER_INPUT_ID).value.trim();
    if (fileNameKey) {
      const filesListStr = localStorage.getItem(FILES_LIST_LOCAL_STORAGE_KEY);
      localStorage.setItem(
        FILES_LIST_LOCAL_STORAGE_KEY,
        JSON.stringify(Array.from(new Set(filesListStr ? JSON.parse(filesListStr) : []).add(fileNameKey))),
      );
      this.props.changeFileNameKey(fileNameKey);
    } else { // if doesn't exist, reset the input value to the currently open file
      document.getElementById(this.FILE_EXPLORER_INPUT_ID).value = this.props.fileNameKey;
    }
  };

  handleRemoveFile = () => {
    const fileNameKey = document.getElementById(this.FILE_EXPLORER_INPUT_ID).value.trim();
    if (fileNameKey === this.props.fileNameKey) {
      return; // don't remove the currently open file
    }
    const filesListStr = localStorage.getItem(FILES_LIST_LOCAL_STORAGE_KEY);
    const filesList = new Set(filesListStr ? JSON.parse(filesListStr) : []);
    if (filesList.delete(fileNameKey)) {
      localStorage.removeItem(FILE_NAME_PREFIX_LOCAL_STORAGE_KEY + fileNameKey);
    }
    localStorage.setItem(FILES_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(filesList)));
  }

  render = () => {
    const filesListStr = localStorage.getItem(FILES_LIST_LOCAL_STORAGE_KEY);
    const filesList = (filesListStr ? JSON.parse(filesListStr) : [])
      .map(fileNameKey => <option key={fileNameKey}>{fileNameKey}</option>);
    return (
      <div className="Header">
        <div className="SubHeader">
          <input
            type="text"
            id={this.TAG_FILTERS_INPUT_ID}
            disabled={!this.props.editorReadOnly}
            placeholder={
              this.props.editorReadOnly
                ? 'TagFilters expr - e.g. "#{tag1} | !(#{t 2} & !(#{_3}))"'
                : 'TagFilters are only enabled in ReadOnly mode'
            }
            defaultValue={this.props.editorReadOnly ? this.state.tagFiltersText : ''}
            onKeyPress={this.handleTagFiltersKeyPress}
          />
          <button
            type="button"
            disabled={!this.props.editorReadOnly}
            onClick={this.handleApplyTagFilters}
          >
            Apply TagFilters
          </button>
        </div>
        <div className="SubHeader">
          <input
            type="text"
            id={this.FILE_EXPLORER_INPUT_ID}
            list={this.FILE_EXPLORER_LIST_ID}
            placeholder="file name/key"
            defaultValue={this.props.fileNameKey}
            onKeyPress={this.handleFileExplorerKeyPress}
          />
          <datalist id={this.FILE_EXPLORER_LIST_ID}>{filesList}</datalist>
          <button
            type="button"
            onClick={this.handleLoadFile}
          >
            Load File
          </button>
          <button
            type="button"
            onClick={this.handleRemoveFile}
          >
            Remove File
          </button>
        </div>
        <div className="SubHeader">
          <button type="button" onClick={this.handleToggleEditorDarkMode}>
            {this.props.editorDarkMode ? 'Light' : 'Dark'} Theme
          </button>
          <button type="button" onClick={this.handleToggleEditorReadOnly}>
            Make {this.props.editorReadOnly ? 'Editable' : 'ReadOnly'}
          </button>
        </div>
      </div>
    );
  };
}

export default connect(
  state => ({
    editorDarkMode: state.editorDarkMode,
    editorReadOnly: state.editorReadOnly,
    fileNameKey: state.fileNameKey,
  }),
  dispatch => ({
    toggleEditorDarkMode: () => dispatch(Actions.TOGGLE_EDITOR_DARK_MODE),
    toggleEditorReadOnly: () => dispatch(Actions.TOGGLE_EDITOR_READ_ONLY),
    changeFileNameKey: fileNameKey => dispatch(Actions.changeFileNameKey(fileNameKey)),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  }),
)(Header);
