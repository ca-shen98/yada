import React from 'react';
import {batch, connect} from 'react-redux';
import Actions from '../actions';
import {
  DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY,
  DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DEFAULT_DOC_NAME_KEY,
  SOURCE_FILE_NAME_TYPE,
  CUSTOM_VIEW_FILE_TYPE,
  FILTER_VIEW_FILE_TYPE,
} from '../reducers/SetFile';
import SortedMap from 'collections/sorted-map';
import SortedSet from 'collections/sorted-set';
import {parse as parseTagFilters} from '../Tagging/lib/TagFilteringExprGrammar';
import {INITIAL_SELECTION_LOCAL_STORAGE_KEY} from '../Tagging/extensions/BlockTagging';

const DOC_NAME_KEY_INPUT_ID = 'doc_name_key_input';
const DOC_NAME_KEY_LIST_ID = 'doc_name_key_list';
const FILE_NAME_KEY_INPUT_ID = 'file_name_key_input';
const FILE_NAME_KEY_LIST_ID = 'file_name_key_list';
const DOC_FILE_NAME_KEY_CHAR_REGEX = /\w/;

class Navigator extends React.Component {

  constructor(props) {
    super(props);
    const docNameKeys = JSON.parse(localStorage.getItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY));
    const docViewFileNameKeys = new SortedMap();
    for (const docNameKey of docNameKeys) {
      const docViewsStr = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + docNameKey);
      const docViews = docViewsStr ?
        JSON.parse(docViewsStr) :
        {[CUSTOM_VIEW_FILE_TYPE]: {}, [FILTER_VIEW_FILE_TYPE]: {viewTagFilters: {}, tagFilterViews: {}}};
      docViewFileNameKeys.add(
        {
          [CUSTOM_VIEW_FILE_TYPE]: SortedSet.from(Object.keys(docViews[CUSTOM_VIEW_FILE_TYPE])),
          [FILTER_VIEW_FILE_TYPE]: SortedSet.from(Object.keys(docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters)),
        },
        docNameKey
      );
    }
    this.state = {docViewFileNameKeys: docViewFileNameKeys};
  };

  handleDocNameInputKeyPress = event => {
    if (event.key === 'Enter') {
      this.handleLoadFile({docNameKey: null, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE});
    }
    if (event.key.length !== 1 || !DOC_FILE_NAME_KEY_CHAR_REGEX.test(event.key)) {
      event.preventDefault();
    }
  };

  handleFileNameInputKeyPress = event => {
    if (event.key === 'Enter') {
      this.handleLoadFile({docNameKey: this.props.docNameKey, fileNameKey: null, fileType: null});
    }
    if (event.key.length !== 1 || !DOC_FILE_NAME_KEY_CHAR_REGEX.test(event.key)) {
      event.preventDefault();
    }
  };

  resetFileSearchBar = () => {
    document.getElementById(DOC_NAME_KEY_INPUT_ID).value = this.props.docNameKey;
    document.getElementById(FILE_NAME_KEY_INPUT_ID).value = this.props.fileNameKey;
    return false;
  }

  checkFileSearchBar = (file, docViewFileNameKeys) => {
    if (!file.docNameKey) {
      file['docNameKey'] = document.getElementById(DOC_NAME_KEY_INPUT_ID).value.trim();
    }
    if (!file.fileNameKey) {
      file['fileNameKey'] = document.getElementById(FILE_NAME_KEY_INPUT_ID).value.trim();
    }
    if (
      (file.docNameKey === this.props.docNameKey && file.fileNameKey === this.props.fileNameKey) ||
      !file.docNameKey || !file.fileNameKey ||
      (
        file.fileNameKey !== SOURCE_FILE_NAME_TYPE && (
          (docViewFileNameKeys && !docViewFileNameKeys.has(file.docNameKey)) ||
          (!docViewFileNameKeys && !this.state.docViewFileNameKeys.has(file.docNameKey))
        )
      )
    ) {
      return this.resetFileSearchBar();
    }
    document.getElementById(DOC_NAME_KEY_INPUT_ID).value = file.docNameKey;
    document.getElementById(FILE_NAME_KEY_INPUT_ID).value = file.fileNameKey;
    return true;
  }

  doLoadFile = (file, tagFilters) => {
    batch(() => {
      this.props.setFile(file);
      localStorage.removeItem(INITIAL_SELECTION_LOCAL_STORAGE_KEY);
      this.props.setReadOnly(file.fileType !== SOURCE_FILE_NAME_TYPE);
      this.props.setTagFilters(tagFilters);
    });
  }

  handleOverwriteFile = (file, docViewFileNameKeys) => {
    if (!this.checkFileSearchBar(file)) { return; }
    let newDocViewFileNameKeys = docViewFileNameKeys;
    const tagFilters = { text: '', expr: null };
    if (
      (newDocViewFileNameKeys && !newDocViewFileNameKeys.has(file.docNameKey)) ||
      (!newDocViewFileNameKeys && !this.state.docViewFileNameKeys.has(file.docNameKey))
    ) {
      if (this.props.docNameKey === DEFAULT_DOC_NAME_KEY) { return this.resetFileSearchBar(); }
      if (!newDocViewFileNameKeys) { newDocViewFileNameKeys = SortedMap.from(this.state.docViewFileNameKeys); }
      newDocViewFileNameKeys.add(newDocViewFileNameKeys.get(this.props.docNameKey), file.docNameKey);
      newDocViewFileNameKeys.delete(this.props.docNameKey);
      const docSourceStr = localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      if (docSourceStr) {
        localStorage.setItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey, docSourceStr);
        localStorage.removeItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      }
      const docViewsStr = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      if (docViewsStr) {
        localStorage.setItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey, docViewsStr);
        localStorage.removeItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      }
      localStorage.setItem(
        DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY,
        JSON.stringify(Array.from(newDocViewFileNameKeys.keys()))
      );
      this.setState({ docViewFileNameKeys: newDocViewFileNameKeys });
    }
    if (file.fileNameKey === SOURCE_FILE_NAME_TYPE || this.props.fileType === SOURCE_FILE_NAME_TYPE) {
      if (this.props.fileType === SOURCE_FILE_NAME_TYPE && this.props.tagFiltersText) {
        for (const viewFileType of [CUSTOM_VIEW_FILE_TYPE, FILTER_VIEW_FILE_TYPE]) {
          if (
            (
              newDocViewFileNameKeys && newDocViewFileNameKeys.get(file.docNameKey)[viewFileType].has(file.fileNameKey)
            ) ||
            (
              !newDocViewFileNameKeys &&
              this.state.docViewFileNameKeys.get(file.docNameKey)[viewFileType].has(file.fileNameKey)
            )
          ) {
            this.handleDeleteFile(
              { docNameKey: file.docNameKey, fileNameKey: file.fileNameKey, fileType: viewFileType },
              newDocViewFileNameKeys
            );
            break;
          }
        }
        const docViewsStr = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey);
        const docViews = docViewsStr ?
          JSON.parse(docViewsStr) :
          { [CUSTOM_VIEW_FILE_TYPE]: {}, [FILTER_VIEW_FILE_TYPE]: { viewTagFilters: {}, tagFilterViews: {} } };
        if (docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews.hasOwnProperty(this.props.tagFiltersText)) {
          this.handleDeleteFile(
            {
              docNameKey: file.docNameKey,
              fileNameKey: docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews[this.props.tagFiltersText],
              fileType: FILTER_VIEW_FILE_TYPE,
            },
            newDocViewFileNameKeys
          );
        }
      }
      this.handleLoadFile(file, newDocViewFileNameKeys);
      return;
    }
    if (!newDocViewFileNameKeys) { newDocViewFileNameKeys = SortedMap.from(this.state.docViewFileNameKeys); }
    const docViews =
      JSON.parse(localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey));
    if (
      this.props.fileType === CUSTOM_VIEW_FILE_TYPE ||
      newDocViewFileNameKeys.get(file.docNameKey)[CUSTOM_VIEW_FILE_TYPE].has(file.fileNameKey)
    ) {
      if (this.props.fileType === CUSTOM_VIEW_FILE_TYPE) {
        docViews[CUSTOM_VIEW_FILE_TYPE][file.fileNameKey] = docViews[CUSTOM_VIEW_FILE_TYPE][this.props.fileNameKey];
      }
      const removeFileNameKey =
        this.props.fileType !== CUSTOM_VIEW_FILE_TYPE ? file.fileNameKey : this.props.fileNameKey;
      delete docViews[CUSTOM_VIEW_FILE_TYPE][removeFileNameKey];
      newDocViewFileNameKeys.get(file.docNameKey)[CUSTOM_VIEW_FILE_TYPE].delete(removeFileNameKey);
    }
    if (
      this.props.fileType === FILTER_VIEW_FILE_TYPE ||
      newDocViewFileNameKeys.get(file.docNameKey)[FILTER_VIEW_FILE_TYPE].has(file.fileNameKey)
    ) {
      if (newDocViewFileNameKeys.get(file.docNameKey)[FILTER_VIEW_FILE_TYPE].has(file.fileNameKey)) {
        const removeViewTagFilters = docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[file.fileNameKey];
        delete docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews[removeViewTagFilters];
      }
      if (this.props.fileType === FILTER_VIEW_FILE_TYPE) {
        docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews[this.props.tagFiltersText] = file.fileNameKey;
        docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[file.fileNameKey] = this.props.tagFiltersText;
        tagFilters.text = this.props.tagFiltersText;
        tagFilters.expr = this.props.tagFiltersExpr;
      }
      const removeFileNameKey =
        this.props.fileType !== FILTER_VIEW_FILE_TYPE ? file.fileNameKey : this.props.fileNameKey;
      delete docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[removeFileNameKey];
      newDocViewFileNameKeys.get(file.docNameKey)[FILTER_VIEW_FILE_TYPE].delete(removeFileNameKey);
    }
    localStorage.setItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey, JSON.stringify(docViews));
    newDocViewFileNameKeys.get(file.docNameKey)[this.props.fileType].push(file.fileNameKey);
    this.setState({ docViewFileNameKeys: newDocViewFileNameKeys });
    file.fileType = this.props.fileType;
    this.doLoadFile(file, tagFilters);
  };

  handleLoadFile = (file, docViewFileNameKeys) => {
    if (!this.checkFileSearchBar(file, docViewFileNameKeys)) { return; }
    let newDocViewFileNameKeys = docViewFileNameKeys;
    const tagFilters = { text: '', expr: null };
    if (
      (newDocViewFileNameKeys && !newDocViewFileNameKeys.has(file.docNameKey)) ||
      (!newDocViewFileNameKeys && !this.state.docViewFileNameKeys.has(file.docNameKey))
    ) {
      if (!newDocViewFileNameKeys) { newDocViewFileNameKeys = SortedMap.from(this.state.docViewFileNameKeys); }
      newDocViewFileNameKeys.add(
        { [CUSTOM_VIEW_FILE_TYPE]: new SortedSet(), [FILTER_VIEW_FILE_TYPE]: new SortedSet() },
        file.docNameKey
      );
      localStorage.setItem(
        DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY,
        JSON.stringify(Array.from(newDocViewFileNameKeys.keys()))
      );
      this.setState({ docViewFileNameKeys: newDocViewFileNameKeys });
    }
    if (
      (
        newDocViewFileNameKeys &&
        newDocViewFileNameKeys.get(file.docNameKey)[FILTER_VIEW_FILE_TYPE].has(file.fileNameKey)
      ) ||
      (
        !newDocViewFileNameKeys &&
        this.state.docViewFileNameKeys.get(file.docNameKey)[FILTER_VIEW_FILE_TYPE].has(file.fileNameKey)
      )
    ) {
      const docFilterViews = JSON.parse(
        localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey)
      )[FILTER_VIEW_FILE_TYPE];
      tagFilters.text = docFilterViews.viewTagFilters[file.fileNameKey];
      tagFilters.expr = parseTagFilters(tagFilters.text);
      file.fileType = FILTER_VIEW_FILE_TYPE;
    } else if (
      (
        newDocViewFileNameKeys &&
        newDocViewFileNameKeys.get(file.docNameKey)[CUSTOM_VIEW_FILE_TYPE].has(file.fileNameKey)
      ) ||
      (
        !newDocViewFileNameKeys &&
        this.state.docViewFileNameKeys.get(file.docNameKey)[CUSTOM_VIEW_FILE_TYPE].has(file.fileNameKey)
      )
    ) {
      file.fileType = CUSTOM_VIEW_FILE_TYPE;
    } else if (file.fileNameKey === SOURCE_FILE_NAME_TYPE) { file.fileType = SOURCE_FILE_NAME_TYPE; }
    else {
      if (!newDocViewFileNameKeys) { newDocViewFileNameKeys = SortedMap.from(this.state.docViewFileNameKeys); }
      const docViewsStr = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey);
      const docViews = docViewsStr ?
        JSON.parse(docViewsStr) :
        { [CUSTOM_VIEW_FILE_TYPE]: {}, [FILTER_VIEW_FILE_TYPE]: { viewTagFilters: {}, tagFilterViews: {} } };
      if (!this.props.tagFiltersText) {
        docViews[CUSTOM_VIEW_FILE_TYPE][file.fileNameKey] = [];
        file.fileType = CUSTOM_VIEW_FILE_TYPE;
      } else {
        if (docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews.hasOwnProperty(this.props.tagFiltersText)) {
          return this.resetFileSearchBar();
        }
        docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews[this.props.tagFiltersText] = file.fileNameKey;
        docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[file.fileNameKey] = this.props.tagFiltersText;
        tagFilters.text = this.props.tagFiltersText;
        tagFilters.expr = this.props.tagFiltersExpr;
        file.fileType = FILTER_VIEW_FILE_TYPE;
      }
      newDocViewFileNameKeys.get(file.docNameKey)[file.fileType].push(file.fileNameKey);
      localStorage.setItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey, JSON.stringify(docViews));
      this.setState({ docViewFileNameKeys: newDocViewFileNameKeys });
    }
    this.doLoadFile(file, tagFilters);
  };

  handleDeleteFile = (file, docViewFileNameKeys) => {
    if (file.docNameKey === this.props.docNameKey && file.fileNameKey === this.props.fileNameKey) { return; }
    const newDocViewFileNameKeys =
      docViewFileNameKeys ? docViewFileNameKeys : SortedMap.from(this.state.docViewFileNameKeys);
    if (file.fileNameKey !== SOURCE_FILE_NAME_TYPE) {
      newDocViewFileNameKeys.get(file.docNameKey)[file.fileType].delete(file.fileNameKey);
      const docViews =
        JSON.parse(localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey));
      if (file.fileType !== CUSTOM_VIEW_FILE_TYPE) {
        const removeViewTagFilters = docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[file.fileNameKey];
        delete docViews[FILTER_VIEW_FILE_TYPE].tagFilterViews[removeViewTagFilters];
        delete docViews[FILTER_VIEW_FILE_TYPE].viewTagFilters[file.fileNameKey];
      } else { delete docViews[CUSTOM_VIEW_FILE_TYPE][file.fileNameKey]; }
      localStorage.setItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey, JSON.stringify(docViews));
    } else {
      newDocViewFileNameKeys.delete(file.docNameKey);
      localStorage.removeItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey);
      localStorage.removeItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + file.docNameKey);
      localStorage.setItem(
        DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY,
        JSON.stringify(Array.from(newDocViewFileNameKeys.keys()))
      );
    }
    this.setState({ docViewFileNameKeys: newDocViewFileNameKeys });
  };

  componentDidUpdate = prevProps => {
    if (this.props.docNameKey !== prevProps.docNameKey) {
      document.getElementById(DOC_NAME_KEY_INPUT_ID).value = this.props.docNameKey;
    }
    if (this.props.fileNameKey !== prevProps.fileNameKey) {
      document.getElementById(FILE_NAME_KEY_INPUT_ID).value = this.props.fileNameKey;
    }
  };

  ViewTypeListItem = ({ docNameKey, fileType, viewFileNameKeys }) => (
    <li key={docNameKey + fileType}>{fileType} views ({viewFileNameKeys.length}):
      <ul>
        {viewFileNameKeys.map(viewFileNameKey => (
          <li key={docNameKey + '.' + viewFileNameKey + fileType}>
            <button
                type="button"
                onClick={() => this.handleLoadFile({ docNameKey, fileNameKey: viewFileNameKey, fileType })}>
              {viewFileNameKey}
            </button>
            <button
                type="button"
                onClick={() => this.handleDeleteFile({ docNameKey, fileNameKey: viewFileNameKey, fileType })}>
              {'<'}
            </button>
          </li>
        ))}
      </ul>
    </li>
  );

  DocListItem = ({ docNameKey, viewFileNameKeys }) => {
    const docSourceNameKeyButton = (
      <button
          type="button"
          onClick={() => this.handleLoadFile(
            { docNameKey, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE }
          )}>
        {docNameKey}
      </button>
    );
    const viewFileNameKeysList = (
      <ul>
        {[CUSTOM_VIEW_FILE_TYPE, FILTER_VIEW_FILE_TYPE].map(viewFileType => (
          <this.ViewTypeListItem
            key={docNameKey + viewFileType}
            docNameKey={docNameKey}
            fileType={viewFileType}
            viewFileNameKeys={viewFileNameKeys[viewFileType]}
          />
        ))}
      </ul>
    );
    if (docNameKey !== DEFAULT_DOC_NAME_KEY) {
      return (
        <li key={docNameKey}>
          {docSourceNameKeyButton}
          <button
              type="button"
              onClick={() => this.handleDeleteFile(
                { docNameKey, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE }
              )}>
            {'<'}
          </button>
          {viewFileNameKeysList}
        </li>
      );
    }
    return (<li key={docNameKey}>{docSourceNameKeyButton}{viewFileNameKeysList}</li>);
  };

  render = () => {
    return (
      <div className="SidePane">
        <div className="SearchBar">
          <input
            type="text"
            id={DOC_NAME_KEY_INPUT_ID}
            list={DOC_NAME_KEY_LIST_ID}
            placeholder="doc name/key"
            defaultValue={this.props.docNameKey}
            onKeyPress={this.handleDocNameInputKeyPress}
          />
          <datalist id={DOC_NAME_KEY_LIST_ID}>
            {
              Array.from(this.state.docViewFileNameKeys.keys()).map(
                docNameKey => <option key={docNameKey}>{docNameKey}</option>
              )
            }
          </datalist>
          <button
              type="button"
              onClick={() => this.handleOverwriteFile(
                { docNameKey: null, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE }
              )}>
            ^
          </button>
          <button
            type="button"
            onClick={() => this.handleLoadFile(
              { docNameKey: null, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE }
            )}>
            >
          </button>
          <input
            type="text"
            id={FILE_NAME_KEY_INPUT_ID}
            list={FILE_NAME_KEY_LIST_ID}
            placeholder="file name/key"
            defaultValue={this.props.fileNameKey}
            onKeyPress={this.handleFileNameInputKeyPress}
          />
          <datalist id={FILE_NAME_KEY_LIST_ID}>
            <option key={SOURCE_FILE_NAME_TYPE}>{SOURCE_FILE_NAME_TYPE}</option>
            {
              this.state.docViewFileNameKeys.get(this.props.docNameKey)[FILTER_VIEW_FILE_TYPE]
                .concat(this.state.docViewFileNameKeys.get(this.props.docNameKey)[CUSTOM_VIEW_FILE_TYPE])
                .map(viewFileNameKey => <option key={viewFileNameKey}>{viewFileNameKey}</option>)
            }
          </datalist>
          <button
              type="button"
              onClick={() => this.handleOverwriteFile(
                { docNameKey: this.props.docNameKey, fileNameKey: null, fileType: null }
              )}>
            ^
          </button>
          <button
            type="button"
            onClick={() => this.handleLoadFile(
              { docNameKey: null, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE }
            )}>
            >
          </button>
        </div>
        <ul className="Navigator">
          {
            this.state.docViewFileNameKeys.map(
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
  state => ({
    docNameKey: state.file.docNameKey,
    fileNameKey: state.file.fileNameKey,
    fileType: state.file.fileType,
    tagFiltersText: state.tagFilters.text,
    tagFiltersExpr: state.tagFilters.expr,
  }),
  dispatch => ({
    setFile: file => dispatch(Actions.setFile(file)),
    setReadOnly: readOnly => dispatch(Actions.setReadOnly(readOnly)),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  })
)(Navigator);
