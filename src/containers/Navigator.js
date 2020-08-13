import React from 'react';
import {batch, connect} from 'react-redux';
import Actions from '../actions';
import {
  DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY,
  DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX,
  SOURCE_FILE_NAME,
  DEFAULT_DOC_NAME_KEY,
} from '../reducers/SetFile';
import SortedMap from 'collections/sorted-map';
import SortedSet from 'collections/sorted-set';

class Navigator extends React.Component {
  DOC_NAME_KEY_INPUT_ID = 'doc_name_key_input';
  DOC_NAME_KEY_LIST_ID = 'doc_name_key_list';
  FILE_NAME_KEY_INPUT_ID = 'file_name_key_input';
  FILE_NAME_KEY_LIST_ID = 'file_name_key_list';
  DOC_FILE_NAME_KEY_CHAR_REGEX = /\w/;

  constructor(props) {
    super(props);
    const docNameKeys = JSON.parse(localStorage.getItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY));
    const docFileNameKeys = new SortedMap();
    for (const docNameKey of docNameKeys) {
      const docViewsStr = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey);
      const docViews = docViewsStr ? JSON.parse(docViewsStr) : {};
      docFileNameKeys.add(SortedSet.from(Array.from(Object.keys(docViews))), docNameKey);
    }
    this.state = { docFileNameKeys: docFileNameKeys };
  };

  handleDocNameInputKeyPress = event => {
    if (event.key === 'Enter') { this.handleLoadFile(null, SOURCE_FILE_NAME); }
    if (event.key.length !== 1 || !this.DOC_FILE_NAME_KEY_CHAR_REGEX.test(event.key)) { event.preventDefault(); }
  };

  handleFileNameInputKeyPress = event => {
    if (event.key === 'Enter') { this.handleLoadFile(this.props.docNameKey, null); }
    if (event.key.length !== 1 || !this.DOC_FILE_NAME_KEY_CHAR_REGEX.test(event.key)) { event.preventDefault(); }
  };

  handleLoadFile = (docNameKey, fileNameKey) => {
    if (!docNameKey) { docNameKey = document.getElementById(this.DOC_NAME_KEY_INPUT_ID).value.trim(); }
    if (!fileNameKey) { fileNameKey = document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value.trim(); }
    if (
      !docNameKey || !fileNameKey ||
      (!this.state.docFileNameKeys.has(docNameKey) && fileNameKey !== SOURCE_FILE_NAME) ||
      (fileNameKey !== SOURCE_FILE_NAME && !this.state.docFileNameKeys.get(docNameKey).has(fileNameKey))
    ) {
      document.getElementById(this.DOC_NAME_KEY_INPUT_ID).value = this.props.docNameKey;
      document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value = this.props.fileNameKey;
      return;
    }
    document.getElementById(this.DOC_NAME_KEY_INPUT_ID).value = docNameKey;
    document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value = fileNameKey;
    if (!this.state.docFileNameKeys.has(docNameKey)) {
      const newDocFileNameKeys = SortedMap.from(this.state.docFileNameKeys);
      newDocFileNameKeys.add(new SortedSet(), docNameKey);
      localStorage.setItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newDocFileNameKeys.keys())));
      this.setState({ docFileNameKeys: newDocFileNameKeys });
    }
    batch(() => {
      this.props.setFile({ docNameKey: docNameKey, fileNameKey: fileNameKey });
      this.props.setReadOnly(fileNameKey !== SOURCE_FILE_NAME);
      this.props.setTagFilters({ text: '', expr: null });
    });
  };

  handleDelete = (docNameKey, fileNameKey) => {
    if (docNameKey === this.props.docNameKey && fileNameKey === this.props.fileNameKey) { return; }
    const newDocFileNameKeys = SortedMap.from(this.state.docFileNameKeys);
    if (fileNameKey !== SOURCE_FILE_NAME) {
      newDocFileNameKeys.get(docNameKey).delete(fileNameKey);
      const docViews = JSON.parse(localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey));
      delete docViews[fileNameKey];
      localStorage.setItem(
        DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey,
        JSON.stringify(docViews),
      );
    } else {
      newDocFileNameKeys.delete(docNameKey);
      localStorage.removeItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey);
      localStorage.removeItem(DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX + docNameKey);
      localStorage.removeItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey);
      localStorage.setItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newDocFileNameKeys.keys())));
    }
    this.setState({ docFileNameKeys: newDocFileNameKeys });
  };

  componentDidUpdate = prevProps => {
    if (this.props.docNameKey !== prevProps.docNameKey) {
      document.getElementById(this.DOC_NAME_KEY_INPUT_ID).value = this.props.docNameKey;
    }
    if (this.props.fileNameKey !== prevProps.fileNameKey) {
      document.getElementById(this.FILE_NAME_KEY_INPUT_ID).value = this.props.fileNameKey;
    }
  };

  DocListItem = ({ docNameKey, viewFileNameKeys }) => {
    const docSourceNameKeyButton =
      (<button type="button" onClick={() => this.handleLoadFile(docNameKey, SOURCE_FILE_NAME)}>{docNameKey}</button>);
    const docViewFileNameKeysListItems = viewFileNameKeys.map(viewFileNameKey => (
      <li key={viewFileNameKey}>
        <button type="button" onClick={() => this.handleLoadFile(docNameKey, viewFileNameKey)}>
          {viewFileNameKey}
        </button>
        <button type="button" onClick={() => this.handleDelete(docNameKey, viewFileNameKey)}>-</button>
      </li>
    ));
    if (docNameKey !== DEFAULT_DOC_NAME_KEY) {
      return (
        <li key={docNameKey}>
          {docSourceNameKeyButton}
          <button type="button" onClick={() => this.handleDelete(docNameKey, SOURCE_FILE_NAME)}>-</button>
          <ul>{docViewFileNameKeysListItems}</ul>
        </li>
      );
    }
    return (<li key={docNameKey}>{docSourceNameKeyButton}<ul>{docViewFileNameKeysListItems}</ul></li>);
  };

  render = () => {
    return (
      <div className="SidePane">
        <div className="SearchBar">
          <input
            type="text"
            id={this.DOC_NAME_KEY_INPUT_ID}
            list={this.DOC_NAME_KEY_LIST_ID}
            placeholder="doc name/key"
            defaultValue={this.props.docNameKey}
            onKeyPress={this.handleDocNameInputKeyPress}
          />
          <datalist id={this.DOC_NAME_KEY_LIST_ID}>
            {
              Array.from(this.state.docFileNameKeys.keys()).map(
                docNameKey => <option key={docNameKey}>{docNameKey}</option>
              )
            }
          </datalist>
          <button type="button" onClick={() => this.handleLoadFile(null, SOURCE_FILE_NAME)}>></button>
          <input
            type="text"
            id={this.FILE_NAME_KEY_INPUT_ID}
            list={this.FILE_NAME_KEY_LIST_ID}
            placeholder="file name/key"
            defaultValue={this.props.fileNameKey}
            onKeyPress={this.handleFileNameInputKeyPress}
          />
          <datalist id={this.FILE_NAME_KEY_LIST_ID}>
            <option key={SOURCE_FILE_NAME}>{SOURCE_FILE_NAME}</option>
            {
              this.state.docFileNameKeys.get(this.props.docNameKey).map(
                viewFileNameKey => <option key={viewFileNameKey}>{viewFileNameKey}</option>
              )
            }
          </datalist>
          <button type="button" onClick={() => this.handleLoadFile(this.props.docNameKey, null)}>></button>
        </div>
        <ul className="Navigator">
          {
            this.state.docFileNameKeys.map(
              (viewFileNameKeys, docNameKey) =>
                <this.DocListItem key={docNameKey} docNameKey={docNameKey} viewFileNameKeys={viewFileNameKeys} />
            )
          }
        </ul>
      </div>
    );
  };
}

export default connect(
  state => ({ docNameKey: state.file.docNameKey, fileNameKey: state.file.fileNameKey }),
  dispatch => ({
    setFile: file => dispatch(Actions.setFile(file)),
    setReadOnly: readOnly => dispatch(Actions.setReadOnly(readOnly)),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  })
)(Navigator);
