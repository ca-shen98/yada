import './Navigator.css';
import {debounce, defer} from 'lodash';
import React from 'react';
import {batch, connect} from 'react-redux';
import store from '../store';
import {validateFileIdKeyObj} from '../util/ValidateFileIdKey';
import {
  getFileIdKeyStr,
  newSourceAction,
  deleteSourceAction,
  renameSourceAction,
  deleteViewAction,
  renameViewAction,
  FILE_TYPES,
} from '../reducers/FileStorageSystem';
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  NO_OPEN_FILE_ID_KEY,
  setCurrentOpenFileIdKeyActionType,
} from '../reducers/CurrentOpenFileState';
import {
  NO_RENAMING_INPUT_STATE,
  RENAME_INPUT_TYPES,
  setRenamingInputStateAction,
} from '../reducers/RenamingInputState';

const INITIAL_FILE_ID_KEY_LOCAL_STORAGE_KEY = 'initialFileIdKey';

const FILE_LIST_ID = 'file_list';

const SEARCH_FILE_NAMES_INPUT_ID = 'search_file_names_input';
const CREATE_SOURCE_NAME_INPUT_ID = 'create_source_name_input';

const CURRENT_SOURCE_NAME_INPUT_ID = 'current_source_name_input';
const CURRENT_VIEW_NAME_INPUT_ID = 'current_view_name_input';

const RENAME_SOURCE_LIST_ITEM_INPUT_ID_PREFIX = 'rename_source_list_item_input_';
const RENAME_VIEW_LIST_ITEM_INPUT_ID_PREFIX = 'rename_view_list_item_input_';

export const calculateFileIdKeyDerivedParameters = (fileIdKey, sourcesList, viewsState) => {
  if (!sourcesList) { sourcesList = store.getState().fileStorageSystem.sourcesList; }
  if (!viewsState) { viewsState = store.getState().fileStorageSystem.viewsState; }
  const validFileIdKeyObj = validateFileIdKeyObj(fileIdKey);
  const validSourceIdKey = (validFileIdKeyObj || fileIdKey.hasOwnProperty('sourceIdKey')) &&
    sourcesList.hasOwnProperty(fileIdKey.sourceIdKey) && sourcesList[fileIdKey.sourceIdKey].hasOwnProperty('name');
  const validViewIdKey = validFileIdKeyObj && validSourceIdKey && viewsState.hasOwnProperty(fileIdKey.sourceIdKey) &&
    viewsState[fileIdKey.sourceIdKey].sourceViews.hasOwnProperty(fileIdKey.viewIdKey) &&
    viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].hasOwnProperty('name');
  const fileType =
    validViewIdKey && viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].hasOwnProperty('tagFilters')
      ? FILE_TYPES.FILTER_VIEW
      : (
          validViewIdKey && viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].hasOwnProperty('listHead')
            ? FILE_TYPES.REFERENCE_VIEW
            : validSourceIdKey && validFileIdKeyObj && !fileIdKey.viewIdKey ? FILE_TYPES.SOURCE : FILE_TYPES.INVALID
        );
  const validFileIdKey = fileType !== FILE_TYPES.INVALID;
  const sourceName = validFileIdKey ? sourcesList[fileIdKey.sourceIdKey].name : '';
  return {
    validFileIdKeyObj,
    validFileIdKey,
    fileType,
    sourceName,
    fileName: validFileIdKey
      ? (
          fileType !== FILE_TYPES.SOURCE
            ? viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].name : sourceName
        )
      : '',
    tagFilters: fileType === FILE_TYPES.FILTER_VIEW
      ? viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].tagFilters : '',
    listHead: fileType === FILE_TYPES.REFERENCE_VIEW
      ? viewsState[fileIdKey.sourceIdKey].sourceViews[fileIdKey.viewIdKey].listHead : '',
  };
};

export const handleSetCurrentOpenFileIdKey = fileIdKey => {
  const { validFileIdKeyObj } = calculateFileIdKeyDerivedParameters(fileIdKey);
  if (!validFileIdKeyObj) { return; }
  if (
    fileIdKey.sourceIdKey !== store.getState().currentOpenFileIdKey.sourceIdKey ||
    fileIdKey.viewIdKey !== store.getState().currentOpenFileIdKey.viewIdKey
  ) {
    if (store.getState().saveDirtyFlag && !window.confirm('confirm discard unsaved changes')) { return; }
    batch(() => {
      store.dispatch(setCurrentOpenFileIdKeyActionType(fileIdKey));
      if (store.getState().saveDirtyFlag) { store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE }); }
    });
    localStorage.setItem(INITIAL_FILE_ID_KEY_LOCAL_STORAGE_KEY, JSON.stringify(fileIdKey));
  }
};

export const getRenameInputIdFunctions = {
  [RENAME_INPUT_TYPES.CURRENT_SOURCE]: () => CURRENT_SOURCE_NAME_INPUT_ID,
  [RENAME_INPUT_TYPES.CURRENT_VIEW]: () => CURRENT_VIEW_NAME_INPUT_ID,
  [RENAME_INPUT_TYPES.SOURCE_LIST_ITEM]: fileIdKey =>
    RENAME_SOURCE_LIST_ITEM_INPUT_ID_PREFIX + (fileIdKey.hasOwnProperty('sourceIdKey') ? fileIdKey.sourceIdKey : ''),
  [RENAME_INPUT_TYPES.VIEW_LIST_ITEM]: fileIdKey =>
    RENAME_VIEW_LIST_ITEM_INPUT_ID_PREFIX + getFileIdKeyStr(fileIdKey),
};

const getDisplaySourceName = fileIdKey => {
  const { sourceName } = calculateFileIdKeyDerivedParameters(fileIdKey);
  return sourceName;
};

const getDisplayViewName = fileIdKey => {
  const { fileType, fileName } = calculateFileIdKeyDerivedParameters(fileIdKey);
  return fileType !== FILE_TYPES.SOURCE ? fileName : '';
};

const getRenameInputValueFunctions = {
  [RENAME_INPUT_TYPES.CURRENT_SOURCE]: getDisplaySourceName,
  [RENAME_INPUT_TYPES.CURRENT_VIEW]: getDisplayViewName,
  [RENAME_INPUT_TYPES.SOURCE_LIST_ITEM]: getDisplaySourceName,
  [RENAME_INPUT_TYPES.VIEW_LIST_ITEM]: getDisplayViewName,
};

class Navigator extends React.Component {
  
  state = { [SEARCH_FILE_NAMES_INPUT_ID]: '', [CREATE_SOURCE_NAME_INPUT_ID]: '' };

  handleClearInputState = inputId => {
    document.getElementById(inputId).value = '';
    this.setState({ [inputId]: '' });
  };

  resetRenameInput = (inputType, fileIdKey) => {
    const { validFileIdKeyObj, fileName } = calculateFileIdKeyDerivedParameters(fileIdKey);
    if (!validFileIdKeyObj) { return; }
    const input = document.getElementById(getRenameInputIdFunctions[inputType](fileIdKey));
    if (input.value !== fileName) { input.value = fileName; }
    if (
      this.props.renamingInputState.inputType === inputType &&
      this.props.renamingInputState.fileIdKey.sourceIdKey === fileIdKey.sourceIdKey &&
      this.props.renamingInputState.fileIdKey.viewIdKey === fileIdKey.viewIdKey
    ) { this.props.dispatchSetRenamingInputStateAction(NO_RENAMING_INPUT_STATE); }
  };

  doFileNamesSearchFilter = idKeysDict => {
    const idKeys = Object.keys(idKeysDict);
    return new Set(
      this.state[SEARCH_FILE_NAMES_INPUT_ID]
        ? idKeys.filter(idKey => idKeysDict[idKey].name.includes(this.state[SEARCH_FILE_NAMES_INPUT_ID])) : idKeys
    );
  };

  handleSearchFileNames = () => {
    this.setState({ [SEARCH_FILE_NAMES_INPUT_ID]: document.getElementById(SEARCH_FILE_NAMES_INPUT_ID).value.trim() });
  };

  handleCreateNewSource = () => {
    if (!this.state[CREATE_SOURCE_NAME_INPUT_ID]) { return false; }
    this.props.dispatchNewSourceAction(this.state[CREATE_SOURCE_NAME_INPUT_ID]);
    defer(
      newSourceIdKey => { handleSetCurrentOpenFileIdKey({ sourceIdKey: newSourceIdKey, viewIdKey: 0 }); },
      this.props.nextNewSourceIdKey,
    );
    return true;
  };

  handleDeleteFile = fileIdKey => {
    const { validFileIdKeyObj, fileType } = calculateFileIdKeyDerivedParameters(fileIdKey);
    if (!validFileIdKeyObj || fileType === FILE_TYPES.INVALID) { return false; }
    if (
      fileIdKey.sourceIdKey === this.props.currentOpenFileIdKey.sourceIdKey &&
      fileIdKey.viewIdKey === this.props.currentOpenFileIdKey.viewIdKey
    ) { handleSetCurrentOpenFileIdKey(NO_OPEN_FILE_ID_KEY); }
    if (fileType !== FILE_TYPES.SOURCE) {
      this.props.dispatchDeleteViewAction(fileIdKey.sourceIdKey, fileIdKey.viewIdKey);
    } else { this.props.dispatchDeleteSourceAction(fileIdKey.sourceIdKey); }
    return true;
  }

  handleRenameFile = (inputType, fileIdKey) => {
    const { validFileIdKeyObj, fileType, fileName: oldName } =
      calculateFileIdKeyDerivedParameters(fileIdKey);
    if (!validFileIdKeyObj || fileType === FILE_TYPES.INVALID) { return false; }
    const input = document.getElementById(getRenameInputIdFunctions[inputType](fileIdKey));
    if (!input) { return false; }
    const newName = input.value.trim();
    if (!newName) { return false; }
    if (newName !== oldName) {
      if (fileType !== FILE_TYPES.SOURCE) {
        this.props.dispatchRenameViewAction(fileIdKey.sourceIdKey, fileIdKey.viewIdKey, newName);
      } else { this.props.dispatchRenameSourceAction(fileIdKey.sourceIdKey, newName); }
    }
    return true;
  }

  componentDidMount = () => {
    const storedInitialFileIdKeyStr = localStorage.getItem(INITIAL_FILE_ID_KEY_LOCAL_STORAGE_KEY);
    let storedInitialFileIdKey = {};
    if (storedInitialFileIdKeyStr) {
      try { storedInitialFileIdKey = JSON.parse(storedInitialFileIdKeyStr); }
      catch (e) {
        console.log('invalid initial fileIdKey');
        console.log(e);
      }
    }
    const initialFileIdKey = {
      sourceIdKey: storedInitialFileIdKey.hasOwnProperty('sourceIdKey')
        ? storedInitialFileIdKey.sourceIdKey : NO_OPEN_FILE_ID_KEY.sourceIdKey,
      viewIdKey: storedInitialFileIdKey.hasOwnProperty('viewIdKey')
        ? storedInitialFileIdKey.viewIdKey : NO_OPEN_FILE_ID_KEY.viewIdKey,
    }
    if (
      initialFileIdKey.sourceIdKey !== this.props.currentOpenFileIdKey.sourceIdKey ||
      initialFileIdKey.viewIdKey !== this.props.currentOpenFileIdKey.viewIdKey
    ) { handleSetCurrentOpenFileIdKey(initialFileIdKey); }
  };

  componentDidUpdate = prevProps => {
    const { fileType: previousFileType, sourceName: previousSourceName, fileName: previousFileName } =
      calculateFileIdKeyDerivedParameters(
        prevProps.currentOpenFileIdKey,
        prevProps.sourcesList,
        prevProps.viewsState,
      );
    const { fileType: currentFileType, sourceName: currentSourceName, fileName: currentFileName } =
      calculateFileIdKeyDerivedParameters(this.props.currentOpenFileIdKey);
    if (currentSourceName !== previousSourceName) {
      document.getElementById(CURRENT_SOURCE_NAME_INPUT_ID).value = currentSourceName;
    }
    if (currentFileType !== previousFileType || currentFileName !== previousFileName) {
      document.getElementById(CURRENT_VIEW_NAME_INPUT_ID).value = getDisplayViewName(this.props.currentOpenFileIdKey);
    }
  };
  
  renameInput = ({ inputType, fileIdKey, ...remainingProps }) => {
    const inputId = getRenameInputIdFunctions[inputType](fileIdKey);
    const { validFileIdKey } = calculateFileIdKeyDerivedParameters(fileIdKey);
    const value = getRenameInputValueFunctions[inputType](fileIdKey);
    return (
      <input
        id={inputId}
        defaultValue={value}
        placeholder={value}
        disabled={
          !validFileIdKey || this.props.renamingInputState.inputType !== inputType ||
          this.props.renamingInputState.fileIdKey.sourceIdKey !== fileIdKey.sourceIdKey ||
          this.props.renamingInputState.fileIdKey.viewIdKey !== fileIdKey.viewIdKey
        }
        onBlur={event => {
          if (this.handleRenameFile(inputType, fileIdKey)) { this.resetRenameInput(inputType, fileIdKey); }
          else { event.target.focus(); }
        }}
        onKeyDown={event => { if (event.key === 'Escape') { this.resetRenameInput(inputType, fileIdKey); } }}
        onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
        {...remainingProps}
      />
    );
  };

  renameButton = ({ inputType, fileIdKey, ...remainingProps }) => {
    const inputId = getRenameInputIdFunctions[inputType](fileIdKey);
    const { validFileIdKey } = calculateFileIdKeyDerivedParameters(fileIdKey);
    return (
      <button
        className="MonospaceCharButton"
        title="rename"
        hidden={
          this.props.renamingInputState.inputType === inputType &&
          this.props.renamingInputState.fileIdKey.sourceIdKey === fileIdKey.sourceIdKey &&
          this.props.renamingInputState.fileIdKey.viewIdKey === fileIdKey.viewIdKey
        }
        disabled={!validFileIdKey}
        onClick={() =>{
          this.props.dispatchSetRenamingInputStateAction({ inputType, fileIdKey });
          defer(() => {
            const input = document.getElementById(inputId);
            input.focus();
            input.setSelectionRange(0, input.value.length);
          });
        }}
        {...remainingProps}>
        {'*'}
      </button>
    );
  };

  fileListItemButtonRow = ({ inputType, fileIdKey }) => {
    const { fileType, fileName } = calculateFileIdKeyDerivedParameters(fileIdKey);
    const currentlyOpen = fileIdKey.sourceIdKey === this.props.currentOpenFileIdKey.sourceIdKey &&
      fileIdKey.viewIdKey === this.props.currentOpenFileIdKey.viewIdKey;
    const renameComponentProps = { inputType, fileIdKey };
    return (
      <div className="ButtonRow">
        {
          this.props.renamingInputState.inputType !== inputType ||
          this.props.renamingInputState.fileIdKey.sourceIdKey !== fileIdKey.sourceIdKey ||
          this.props.renamingInputState.fileIdKey.viewIdKey !== fileIdKey.viewIdKey
            ? <button
                title={(currentlyOpen ? 'currently ' : '') + 'open'}
                disabled={currentlyOpen}
                onClick={() => { handleSetCurrentOpenFileIdKey(fileIdKey); }}>
                <span style={{ fontStyle: currentlyOpen ? 'italic' : 'normal' }}>
                  {
                    this.state[SEARCH_FILE_NAMES_INPUT_ID]
                      ? <React.Fragment>
                          {
                            fileName.split(this.state[SEARCH_FILE_NAMES_INPUT_ID]).reduce(
                              (partial, substring, idx) => partial.concat([
                                ...(idx > 0 ? [<b key={idx}>{this.state[SEARCH_FILE_NAMES_INPUT_ID]}</b>] : []),
                                substring,
                              ]),
                              [],
                            )
                          }
                        </React.Fragment>
                      : fileName
                  }
                </span>
              </button>
            : <this.renameInput {...renameComponentProps} />
        }
        <this.renameButton {...renameComponentProps} />
        <button
          className="MonospaceCharButton"
          title="delete"
          onClick={() => {
            if (fileType !== FILE_TYPES.SOURCE || window.confirm('confirm delete source "' + fileName + '"')) {
              this.handleDeleteFile(fileIdKey);
            }
          }}>
          {'-'}
        </button>
      </div>
    );
  };

  render = () => {
    const { fileType: currentOpenFileType } = calculateFileIdKeyDerivedParameters(this.props.currentOpenFileIdKey);
    const currentSourceRenameComponentProps = {
      inputType: RENAME_INPUT_TYPES.CURRENT_SOURCE,
      fileIdKey: { sourceIdKey: this.props.currentOpenFileIdKey.sourceIdKey, viewIdKey: 0 },
    };
    const currentViewRenameComponentProps = {
      inputType: RENAME_INPUT_TYPES.CURRENT_VIEW,
      fileIdKey: this.props.currentOpenFileIdKey,
    };
    let numFilteredViews = 0;
    const filteredSourceViews = Object.keys(this.props.viewsState).reduce(
      (partial, sourceIdKey) => {
        const filteredSourceViewIdKeys_ = this.doFileNamesSearchFilter(this.props.viewsState[sourceIdKey].sourceViews);
        numFilteredViews += filteredSourceViewIdKeys_.size;
        return {
          ...partial,
          ...(filteredSourceViewIdKeys_.size > 0 ? { [sourceIdKey]: filteredSourceViewIdKeys_ } : null),
        };
      },
      {},
    );
    const filteredSources_ = this.doFileNamesSearchFilter(this.props.sourcesList);
    const filteredSources = this.state[SEARCH_FILE_NAMES_INPUT_ID]
      ? new Set([...filteredSources_, ...Object.keys(filteredSourceViews)]) : filteredSources_;
    return (
      <div className="SidePane">
        <div id="current_file_container">
          <div className="InputRow">
            {
              currentOpenFileType !== FILE_TYPES.INVALID
                ? <this.renameButton {...currentSourceRenameComponentProps} /> : null
            }
            <this.renameInput {...currentSourceRenameComponentProps} title="current open source" />
          </div>
          <div className="InputRow">
            {
              currentOpenFileType !== FILE_TYPES.INVALID && currentOpenFileType !== FILE_TYPES.SOURCE
                ? <this.renameButton {...currentViewRenameComponentProps} /> : null
            }
            <this.renameInput {...currentViewRenameComponentProps} title="current open view" />
          </div>
        </div>
        <div className="InputRow" id="search_file_names_input_row">
          <input
            id={SEARCH_FILE_NAMES_INPUT_ID}
            title="search file names"
            placeholder="search file names"
            onChange={debounce(this.handleSearchFileNames, 150)}
            onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
            onKeyDown={event => { if (event.key === 'Escape') { event.target.blur(); } }}
          />
          <button
            className="MonospaceCharButton"
            title="clear"
            disabled={!this.state[SEARCH_FILE_NAMES_INPUT_ID]}
            onClick={() => { this.handleClearInputState(SEARCH_FILE_NAMES_INPUT_ID); }}>
            {'✕'}
          </button>
        </div>
        {
          filteredSources.size > 0
            ? <ul id={FILE_LIST_ID}>
                {
                  Array.from(filteredSources).map(sourceIdKey =>
                    <li key={sourceIdKey}>
                      <this.fileListItemButtonRow
                        inputType={RENAME_INPUT_TYPES.SOURCE_LIST_ITEM}
                        fileIdKey={{ sourceIdKey, viewIdKey: 0 }}
                      />
                      {
                        filteredSourceViews.hasOwnProperty(sourceIdKey)
                          ? <ul>
                              {
                                Array.from(filteredSourceViews[sourceIdKey]).map(viewIdKey => {
                                  const fileIdKey = { sourceIdKey, viewIdKey };
                                  return (
                                    <li key={getFileIdKeyStr(fileIdKey)}>
                                      <this.fileListItemButtonRow
                                        inputType={RENAME_INPUT_TYPES.VIEW_LIST_ITEM}
                                        fileIdKey={fileIdKey}
                                      />
                                    </li>
                                  );
                                })
                              }
                            </ul>
                          : null
                      }
                    </li>
                  )
                }
              </ul>
            : <div className="PlaceholderDivWithText" id="no_files_placeholder">
                no files
              </div>
        }
        <div
          className="PlaceholderDivWithText"
          id="filtered_files_placeholder"
          hidden={!this.state[SEARCH_FILE_NAMES_INPUT_ID]}>
          {
            (
              Object.keys(this.props.sourcesList).length + this.props.numViews -
              filteredSources.size - numFilteredViews
            ) + ' of ' + (Object.keys(this.props.sourcesList).length + this.props.numViews) + ' files filtered'
          }
        </div>
        <div className="InputRow" id="create_source_name_input_row">
          <input
            id={CREATE_SOURCE_NAME_INPUT_ID}
            title="new source name"
            placeholder="new source name"
            onChange={event => { this.setState({ [CREATE_SOURCE_NAME_INPUT_ID]: event.target.value }); }}
            onKeyPress={event => {
              if (event.key === 'Enter' && this.handleCreateNewSource()) {
                this.handleClearInputState(CREATE_SOURCE_NAME_INPUT_ID);
                this.handleClearInputState(SEARCH_FILE_NAMES_INPUT_ID);
              }
            }}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                this.handleClearInputState(CREATE_SOURCE_NAME_INPUT_ID);
                event.target.blur();
              }
            }}
          />
          <button
            className="MonospaceCharButton"
            title="create"
            disabled={!this.state[CREATE_SOURCE_NAME_INPUT_ID]}
            onClick={() => {
              if (this.handleCreateNewSource()) {
                this.handleClearInputState(CREATE_SOURCE_NAME_INPUT_ID);
                this.handleClearInputState(SEARCH_FILE_NAMES_INPUT_ID);
              }
            }}>
            {'+'}
          </button>
        </div>
      </div>
    );
  };
};

export default connect(
  state => ({
    sourcesList: state.fileStorageSystem.sourcesList,
    nextNewSourceIdKey: state.fileStorageSystem.nextNewSourceIdKey,
    viewsState: state.fileStorageSystem.viewsState,
    numViews: state.fileStorageSystem.numViews,
    currentOpenFileIdKey: state.currentOpenFileIdKey,
    saveDirtyFlag: state.saveDirtyFlag,
    renamingInputState: state.renamingInputState,
  }),
  dispatch => ({
    dispatchNewSourceAction: name => dispatch(newSourceAction(name)),
    dispatchDeleteSourceAction: sourceIdKey => dispatch(deleteSourceAction(sourceIdKey)),
    dispatchRenameSourceAction: (sourceIdKey, newName) => dispatch(renameSourceAction(sourceIdKey, newName)),
    dispatchDeleteViewAction: (sourceIdKey, viewIdKey) => dispatch(deleteViewAction(sourceIdKey, viewIdKey)),
    dispatchRenameViewAction:
      (sourceIdKey, viewIdKey, newName) => dispatch(renameViewAction(sourceIdKey, viewIdKey, newName)),
    dispatchSetRenamingInputStateAction:
      renamingInputState => dispatch(setRenamingInputStateAction(renamingInputState)),
  }),
)(Navigator);
