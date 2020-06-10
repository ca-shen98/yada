import React from 'react';
import {connect} from 'react-redux';
import Actions from '../actions';
import {parse as parseTagFilters} from '../lib/TagFilters';
import {initialTagFiltersText} from "../reducers/SetTagFilters";
import {FILE_NAME_PREFIX_LOCAL_STORAGE_KEY, FILES_LIST_LOCAL_STORAGE_KEY} from '../reducers/ChangeFileNameKey';

class Header extends React.Component {
  TAG_FILTERS_INPUT_ID = 'tag_filters_input';
  FILE_EXPLORER_INPUT_ID = 'file_explorer_input';
  FILE_EXPLORER_LIST_ID = 'file_explorer_list';
  FILE_NAME_KEY_CHAR_REGEX = /\w/;

  state = {
    tagFiltersText: initialTagFiltersText,
  }

  handleApplyTagFilters = (modifyState = true, checkState = true) => {
    const tagFiltersInput = document.getElementById(this.TAG_FILTERS_INPUT_ID).value.trim();
    if (checkState && tagFiltersInput === this.state.tagFiltersText) { return; } // don't need to re-apply
    let tagFiltersExpr = null;
    if (tagFiltersInput) {
      tagFiltersExpr = parseTagFilters(tagFiltersInput);
      if (!tagFiltersExpr) { // if invalid expr, reset the input value to the current valid tag filters text state
        document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.state.tagFiltersText;
        return;
      }
    }
    if (modifyState) { this.setState({ tagFiltersText: tagFiltersInput }); }
    this.props.setTagFilters({ text: tagFiltersInput, expr: tagFiltersExpr });
  };

  handleTagFiltersKeyPress = event => { if (event.key === 'Enter') { this.handleApplyTagFilters(); } };

  handleToggleReadOnly = () => {
    // currently the prop is the previous value, before toggling
    document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.props.readOnly ? '' : this.state.tagFiltersText;
    this.handleApplyTagFilters(false, false);
    this.props.toggleReadOnly();
  };

  handleFileExplorerKeyPress = event => {
    if (event.key === 'Enter') { this.handleLoadFile(); }
    if (event.key.length !== 1 || !this.FILE_NAME_KEY_CHAR_REGEX.test(event.key)) { event.preventDefault(); }
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
      document.getElementById(this.TAG_FILTERS_INPUT_ID).value = '';
      this.handleApplyTagFilters(true, false);
    } else { // if doesn't exist, reset the input value to the currently open file
      document.getElementById(this.FILE_EXPLORER_INPUT_ID).value = this.props.fileNameKey;
    }
  };

  handleRemoveFile = () => {
    const fileNameKey = document.getElementById(this.FILE_EXPLORER_INPUT_ID).value.trim();
    if (fileNameKey === this.props.fileNameKey) { return; } // don't remove the currently open file
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
            id={this.FILE_EXPLORER_INPUT_ID}
            list={this.FILE_EXPLORER_LIST_ID}
            placeholder="file name/key"
            defaultValue={this.props.fileNameKey}
            onKeyPress={this.handleFileExplorerKeyPress}
          />
          <datalist id={this.FILE_EXPLORER_LIST_ID}>{filesList}</datalist>
          <button type="button" onClick={this.handleLoadFile}>Load File</button>
          <button type="button" onClick={this.handleRemoveFile}>Remove File</button>
        </div>
        <div className="SubHeader">
          <input
            type="text"
            id={this.TAG_FILTERS_INPUT_ID}
            disabled={!this.props.readOnly}
            placeholder={
              this.props.readOnly
                ? 'TagFilters expr - e.g. "#{tag1} | !(#{t 2} & !(#{_3}))"'
                : 'TagFilters are only enabled in ReadOnly mode'
            }
            defaultValue={this.props.readOnly ? this.state.tagFiltersText : ''}
            onKeyPress={this.handleTagFiltersKeyPress}
          />
          <button type="button" disabled={!this.props.readOnly} onClick={this.handleApplyTagFilters}>
            Apply TagFilters
          </button>
          <button type="button" onClick={this.handleToggleReadOnly}>
            Make {this.props.readOnly ? 'Editable' : 'ReadOnly'}
          </button>
        </div>
      </div>
    );
  };
}

export default connect(
  state => ({ readOnly: state.readOnly, fileNameKey: state.fileNameKey }),
  dispatch => ({
    toggleReadOnly: () => dispatch(Actions.TOGGLE_READ_ONLY),
    changeFileNameKey: fileNameKey => dispatch(Actions.changeFileNameKey(fileNameKey)),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  }),
)(Header);
