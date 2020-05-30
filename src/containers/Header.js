import React from 'react';
import {connect} from 'react-redux';
import Actions from '../actions';
import {EDITOR_PROPS_LOCAL_STORAGE_KEYS} from '../reducers/ToggleEditorProps';
import {INITIAL_FILE_NAME_LOCAL_STORAGE_KEY} from '../reducers/ChangeFileNameKey';
import {INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, initialTagFiltersText, parse as parseTagFilters} from "./TagFilters";

class Header extends React.Component {
  TAG_FILTERS_INPUT_ID = 'tag_filters_input';
  FILE_EXPLORER_INPUT_ID = 'file_explorer_input';

  state = {
    tagFiltersText: initialTagFiltersText,
  };

  handleApplyTagFilters = () => {
    localStorage.setItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, this.state.tagFiltersText);
    this.props.setTagFilters(parseTagFilters(this.state.tagFiltersText));
  };

  // is there a race condition that would cause a disabled text value to be saved?
  handleTagFiltersChange = () => {
    if (this.props.editorReadOnly) {
      this.setState({
        tagFiltersText: document.getElementById(this.TAG_FILTERS_INPUT_ID).value.trim(),
      });
    }
  };

  handleTagFiltersEnter = event => {
    if (event.key === 'Enter') {
      this.handleApplyTagFilters();
    }
  };

  handleToggleEditorReadOnly = () => {
    this.props.toggleEditorReadOnly();
    // dispatch is async? so state/prop change only happens once function exits? so the prop is the previous value.
    localStorage.setItem(EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_READ_ONLY,
      this.props.editorReadOnly ? 'Editable' : 'ReadOnly');
    document.getElementById(this.TAG_FILTERS_INPUT_ID).value =
      this.props.editorReadOnly ? '' : this.state.tagFiltersText;
  };

  handleToggleEditorDarkMode = () => {
    this.props.toggleEditorDarkMode();
    // dispatch is async? so state/prop change only happens once function exits? so the prop is the previous value.
    localStorage.setItem(EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_DARK_MODE,
      this.props.editorDarkMode ? 'Light' : 'Dark');
  };

  handleFileExplorerEnter = event => {
    if (event.key === 'Enter') {
      this.handleLoadFile();
    }
  };

  handleLoadFile = () => {
    const fileNameKey = document.getElementById(this.FILE_EXPLORER_INPUT_ID).value;
    this.props.changeFileNameKey(fileNameKey);
    localStorage.setItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY, fileNameKey);
  };

  render = () => (
    <div className="Header">
      <div className="SubHeader">
        <input
          type="text"
          id={this.TAG_FILTERS_INPUT_ID}
          disabled={!this.props.editorReadOnly}
          placeholder={
            this.props.editorReadOnly ?
              'TagFilters expr - e.g. "#{tag1} | !(#{t2} & !(#{_3}))"' : 'TagFilters are only enabled in ReadOnly mode'
          }
          defaultValue={this.props.editorReadOnly ? this.state.tagFiltersText : ''}
          onKeyPress={this.handleTagFiltersEnter}
          onChange={this.handleTagFiltersChange}
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
          placeholder="file name/key"
          defaultValue={this.props.fileNameKey}
          onKeyPress={this.handleFileExplorerEnter}
        />
        <button
          type="button"
          onClick={this.handleLoadFile}
        >
          Load File
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
