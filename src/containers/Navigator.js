import React from 'react';
import {connect} from 'react-redux';
import Actions from "../actions";
import SortedSet from "collections/sorted-set";
import {
  FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY, FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY
} from '../reducers/ChangeFileNameKey';

class Navigator extends React.Component {
  FILE_NAME_KEY_INPUT_ID = 'file_name_key_input';
  FILE_NAME_KEY_LIST_ID = 'file_name_key_list';
  FILE_NAME_KEY_CHAR_REGEX = /\w/;

  constructor(props) {
    super(props);
    const fileNameKeysListStr = localStorage.getItem(FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY);
    this.state = { fileNameKeys: SortedSet.from(fileNameKeysListStr ? JSON.parse(fileNameKeysListStr) : []) }
  }

  handleFileNameInputKeyPress = event => {
    if (event.key === 'Enter') { this.handleLoadFile(); }
    if (event.key.length !== 1 || !this.FILE_NAME_KEY_CHAR_REGEX.test(event.key)) { event.preventDefault(); }
  };

  handleLoadFile = (fileNameKey = document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value.trim()) => {
    if (fileNameKey) {
      if (!this.state.fileNameKeys.has(fileNameKey)) {
        const newFileNameKeys = SortedSet.from(this.state.fileNameKeys);
        newFileNameKeys.push(fileNameKey);
        localStorage.setItem(FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newFileNameKeys)));
        this.setState({ fileNameKeys: newFileNameKeys });
      }
      this.props.changeFileNameKey(fileNameKey);
      this.props.clearTagFilters();
    } else { // if doesn't exist, reset the input value to the currently open file
      document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value = this.props.fileNameKey;
    }
  };

  handleRemoveFile = (fileNameKey = document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value.trim()) => {
    if (fileNameKey === this.props.fileNameKey || !this.state.fileNameKeys.has(fileNameKey)) { return; }
    localStorage.removeItem(FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY + fileNameKey);
    const newFileNameKeys = SortedSet.from(this.state.fileNameKeys);
    newFileNameKeys.delete(fileNameKey);
    localStorage.setItem(FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newFileNameKeys)));
    this.setState({ fileNameKeys: newFileNameKeys });
  }

  handleOpenFile = fileNameKey => {
    document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value = fileNameKey;
    this.handleLoadFile(fileNameKey);
  }

  shouldComponentUpdate = (_nextProps, nextState) => nextState.fileNameKeys !== this.state.fileNameKeys

  render = () => (
    <div className="SidePane">
      <div className="SearchBar">
        <input
          type="text"
          id={this.FILE_NAME_KEY_INPUT_ID}
          list={this.FILE_NAME_KEY_LIST_ID}
          placeholder="file name/key"
          defaultValue={this.props.fileNameKey}
          onKeyPress={this.handleFileNameInputKeyPress}
        />
        <datalist id={this.FILE_NAME_KEY_LIST_ID}>
          {this.state.fileNameKeys.map(fileNameKey => <option key={fileNameKey}>{fileNameKey}</option>)}
        </datalist>
        <button type="button" onClick={this.handleLoadFile}>Load File</button>
        <button type="button" onClick={this.handleRemoveFile}>Remove File</button>
      </div>
      <ul className="Navigator">
        {this.state.fileNameKeys.map(fileNameKey =>
          <li key={fileNameKey}>
            <button type="button" onClick={() => this.handleOpenFile(fileNameKey)}>{fileNameKey}</button>
            <button type="button" onClick={() => this.handleRemoveFile(fileNameKey)}>-</button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default connect(
  state => ({ fileNameKey: state.fileNameKey }),
  dispatch => ({
    changeFileNameKey: fileNameKey => dispatch(Actions.changeFileNameKey(fileNameKey)),
    clearTagFilters: () => dispatch(Actions.setTagFilters({ text: '', expr: null }))
  })
)(Navigator);
