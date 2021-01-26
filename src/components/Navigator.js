import './Navigator.css';
import {debounce, defer} from 'lodash';
import Cookies from 'js-cookie';
import React from 'react';
import {batch, connect} from 'react-redux';
import {
  FILE_TYPE,
  NO_OPEN_FILE_ID,
  validateFileIdObj,
  checkNoOpenFileId,
  checkSourceFileId,
  checkViewFileId,
  getFileIdKeyStr,
} from '../util/FileIdAndTypeUtils';
import {INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY} from './SourceEditorWithTagFiltersInput';
import {
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  INITIAL_FILE_ID_LOCAL_STORAGE_KEY,
  setCurrentOpenFileIdAction,
  setSelectNodeAction,
} from '../reducers/CurrentOpenFileState';
import {
  ACCESS_TOKEN_COOKIE_KEY,
  BACKEND_MODE_SIGNED_IN_STATUS,
  getUserSignedInStatus,
  setBackendModeSignedInStatusAction,
} from '../reducers/BackendModeSignedInStatus';
import {
  doSetLocalStorageSourceIdNames,
  doSetLocalStorageSourceViewsList,
  calculateLocalStorageNextNewId,
  calculateLocalStorageNextNewFileIds,
} from '../backend/LocalFileStorageSystemClient';

import store from '../store';
import FileStorageSystemClient from '../backend/FileStorageSystemClient';

export const handleSetCurrentOpenFileId = fileId => {
  if (!validateFileIdObj(fileId)) { return false; }
  const currentOpenFileId = store.getState().currentOpenFileId;
  if (fileId.sourceId === currentOpenFileId.sourceId && fileId.viewId === currentOpenFileId.viewId) { return true; }
  if (!store.getState().saveDirtyFlag || window.confirm('confirm discard unsaved changes')) {
    batch(() => {
      store.dispatch(setCurrentOpenFileIdAction(fileId));
      store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
      store.dispatch(setSelectNodeAction(null));
    });
    localStorage.setItem(INITIAL_FILE_ID_LOCAL_STORAGE_KEY, JSON.stringify(fileId));
    localStorage.removeItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY);
    return true;
  }
  return false;
};

const convertFilesListStateToFileIdNamesList = filesListState => Object.fromEntries(
  Object.entries(filesListState).map(([id, { name }]) => [id, name])
);

const countNumFiles = filesList => Object.entries(filesList)
  .reduce((count, [_sourceId, { viewsList }]) => count + 1 + Object.keys(viewsList).length, 0);

const FILE_LIST_ID = 'file_list';

const SEARCH_FILE_NAMES_INPUT_ID = 'search_file_names_input';

const CURRENT_SOURCE_NAME_INPUT_ID = 'current_source_name_input';
const CURRENT_VIEW_NAME_INPUT_ID = 'current_view_name_input';

const RENAME_SOURCE_LIST_ITEM_INPUT_ID_PREFIX = 'rename_source_list_item_input_';
const RENAME_VIEW_LIST_ITEM_INPUT_ID_PREFIX = 'rename_view_list_item_input_';

const RENAME_INPUT_TYPES = {
  CURRENT_SOURCE: 'CURRENT_SOURCE',
  CURRENT_VIEW: 'CURRENT_VIEW',
  SOURCE_LIST_ITEM: 'SOURCE_LIST_ITEM',
  VIEW_LIST_ITEM: 'VIEW_LIST_ITEM',
};

const getRenameInputIdFunctions = {
  [RENAME_INPUT_TYPES.CURRENT_SOURCE]: () => CURRENT_SOURCE_NAME_INPUT_ID,
  [RENAME_INPUT_TYPES.CURRENT_VIEW]: () => CURRENT_VIEW_NAME_INPUT_ID,
  [RENAME_INPUT_TYPES.SOURCE_LIST_ITEM]: fileId => RENAME_SOURCE_LIST_ITEM_INPUT_ID_PREFIX + fileId.sourceId,
  [RENAME_INPUT_TYPES.VIEW_LIST_ITEM]: fileId => RENAME_VIEW_LIST_ITEM_INPUT_ID_PREFIX + getFileIdKeyStr(fileId),
};

const NO_RENAMING_STATE = { inputType: null, fileId: NO_OPEN_FILE_ID };

const DEFAULT_STATE = {
  searching: '',
  renaming: NO_RENAMING_STATE,
  filesList: {},
  nextNewFileIds: null,
};

class Navigator extends React.Component {
  
  state = DEFAULT_STATE;

  resetState = () => { this.setState(DEFAULT_STATE); }

  getSourceName = fileId => validateFileIdObj(fileId) && this.state.filesList.hasOwnProperty(fileId.sourceId)
      ? this.state.filesList[fileId.sourceId].name : '';
  
  getViewName = fileId => checkViewFileId(fileId) && this.state.filesList.hasOwnProperty(fileId.sourceId) &&
    this.state.filesList[fileId.sourceId].viewsList.hasOwnProperty(fileId.viewId)
      ? this.state.filesList[fileId.sourceId].viewsList[fileId.viewId].name : '';

  getFileName = fileId => checkViewFileId(fileId) ? this.getViewName(fileId) : this.getSourceName(fileId);

  getRenameInputValueFunctions = {
    [RENAME_INPUT_TYPES.CURRENT_SOURCE]: this.getSourceName,
    [RENAME_INPUT_TYPES.CURRENT_VIEW]: this.getViewName,
    [RENAME_INPUT_TYPES.SOURCE_LIST_ITEM]: this.getFileName,
    [RENAME_INPUT_TYPES.VIEW_LIST_ITEM]: this.getFileName,
  };

  handleSwitchBackendModeSignedInStatus = status => {
    if (status === this.props.backendModeSignedInStatus) { return true; }
    if (handleSetCurrentOpenFileId(NO_OPEN_FILE_ID)) {
      this.resetState();
      this.props.dispatchSetBackendModeSignedInStatusAction(status);
      return true;
    }
    return false;
  };

  handleCancelRenaming = (inputType, fileId) => {
    const input = document.getElementById(getRenameInputIdFunctions[inputType](fileId));
    input.value = this.getRenameInputValueFunctions[inputType](fileId);
    input.setSelectionRange(0, 0);
    this.setState({ renaming: NO_RENAMING_STATE });
  };

  handleStartRenaming = (inputType, fileId) => {
    this.setState({ renaming: { inputType, fileId } });
    const inputId = getRenameInputIdFunctions[inputType](fileId);
    defer(() => {
      const input = document.getElementById(inputId);
      input.focus();
      input.setSelectionRange(0, input.value.length);
    });
  };

  handleClearSearchingInput = () => {
    document.getElementById(SEARCH_FILE_NAMES_INPUT_ID).value = '';
    this.setState({ searching: '' });
  };

  handleChangeSearchingInput = () => {
    this.setState({ searching: document.getElementById(SEARCH_FILE_NAMES_INPUT_ID).value.trim() });
  };

  handleDoFileNamesSearch = () => Object.fromEntries(
    Object.entries(this.state.filesList).map(([sourceId, { name: sourceName, viewsList }]) => [
      sourceId,
      {
        name: sourceName,
        viewsList: this.state.searching
          ? Object.fromEntries(Object.entries(viewsList).filter(
              ([_viewId, { name: viewName }]) => viewName.includes(this.state.searching)
            ))
          : viewsList,
      },
    ]).filter(
      ([_sourceId, { name: sourceName, viewsList }]) => !this.state.searching ||
        Object.keys(viewsList).length > 0 || sourceName.includes(this.state.searching)
    )
  );

  handleCreateNewFile = async fileType => {
    if (!FILE_TYPE.hasOwnProperty(fileType)) { return; }
    const sourceFileType = fileType === FILE_TYPE.SOURCE;
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    if (
      (noOpenFileIdCheck && !sourceFileType) ||
      (!noOpenFileIdCheck && !handleSetCurrentOpenFileId(NO_OPEN_FILE_ID))
    ) { return; }
    const localStorageNextNewFileId =
      this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE
        ? (
            sourceFileType
              ? this.state.nextNewFileIds.source
              : this.state.nextNewFileIds.nextNewViewIdsForSourceIds[this.props.currentOpenFileId.sourceId]
          )
        : null;
    const newFilePromise = sourceFileType
      ? FileStorageSystemClient.doSaveSourceContent(null, localStorageNextNewFileId, true)
      : FileStorageSystemClient.doSaveViewSpec(
          [],
          this.props.currentOpenFileId.sourceId,
          localStorageNextNewFileId,
          fileType,
          true,
        );
    const newFile = await newFilePromise;
    if (!newFile) {
      alert('failed to create new file');
      return;
    }
    const updatedSourceId = sourceFileType ? newFile.id : this.props.currentOpenFileId.sourceId;
    const newFilesList = {
      ...this.state.filesList,
      [updatedSourceId]: {
        name: sourceFileType ? newFile.name : this.state.filesList[updatedSourceId].name,
        viewsList: {
          ...(
            !sourceFileType
              ? {
                  ...this.state.filesList[updatedSourceId].viewsList,
                  [newFile.id]: { name: newFile.name, type: newFile.type },
                }
              : null
          ),
        },
      },
    };
    this.setState({ filesList: newFilesList });
    defer(() => {
      const fileId = { sourceId: updatedSourceId, viewId: !sourceFileType ? newFile.id : 0 };
      handleSetCurrentOpenFileId(fileId);
      this.handleStartRenaming(
        sourceFileType ? RENAME_INPUT_TYPES.CURRENT_SOURCE : RENAME_INPUT_TYPES.CURRENT_VIEW,
        fileId,
      );
    });
    if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      if (sourceFileType) { doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList)); }
      else { doSetLocalStorageSourceViewsList(updatedSourceId, newFilesList[updatedSourceId].viewsList); }
      this.setState({
        nextNewFileIds: {
          source: sourceFileType
            ? calculateLocalStorageNextNewId(newFilesList, parseInt(updatedSourceId))
            : this.state.nextNewFileIds.source,
          nextNewViewIdsForSourceIds: {
            ...this.state.nextNewFileIds.nextNewViewIdsForSourceIds,
            ...(
              !sourceFileType
                ? {
                    [updatedSourceId]:
                      calculateLocalStorageNextNewId(newFilesList[updatedSourceId].viewsList, parseInt(newFile.id)),
                  }
                : null
            ),
          },
        },
      });
    }
  }

  handleDeleteFile = async fileId => {
    if (checkNoOpenFileId(fileId)) { return; }
    if (
      fileId.sourceId === this.props.currentOpenFileId.sourceId &&
      fileId.viewId === this.props.currentOpenFileId.viewId &&
      !handleSetCurrentOpenFileId(NO_OPEN_FILE_ID)
    ) { return; }
    const sourceFileIdCheck = checkSourceFileId(fileId);
    const deleteFilePromise = sourceFileIdCheck
      ? FileStorageSystemClient.doDeleteSource(
          fileId.sourceId,
          Object.keys(this.state.filesList[fileId.sourceId].viewsList),
        )
      : FileStorageSystemClient.doDeleteView(fileId.sourceId, fileId.viewId);
    const success = await deleteFilePromise;
    if (!success) {
      alert('failed to delete file');
      return;
    }
    const newFilesList = {...this.state.filesList};
    if (sourceFileIdCheck) { delete newFilesList[fileId.sourceId]; }
    else {
      const newSourceViewsList = {...newFilesList[fileId.sourceId].viewsList};
      delete newSourceViewsList[fileId.viewId];
      newFilesList[fileId.sourceId] = { name: newFilesList[fileId.sourceId].name, viewsList: newSourceViewsList };
    }
    this.setState({ filesList: newFilesList });
    if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      if (sourceFileIdCheck) {
        doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList));
        const newNextNewViewIdsForSourceIds = {...this.state.nextNewFileIds.nextNewViewIdsForSourceIds};
        delete newNextNewViewIdsForSourceIds[fileId.sourceId];
        this.setState({
          nextNewFileIds: {
            source: this.state.nextNewFileIds.source,
            nextNewViewIdsForSourceIds: newNextNewViewIdsForSourceIds,
          },
        });
      } else { doSetLocalStorageSourceViewsList(fileId.sourceId, newFilesList[fileId.sourceId].viewsList); }
    }
  };

  handleRenameFile = async (inputType, fileId) => {
    if (checkNoOpenFileId(fileId)) { return; }
    const input = document.getElementById(getRenameInputIdFunctions[inputType](fileId));
    if (!input) { return; }
    const newName = input.value.trim();
    if (!newName || newName === this.getFileName(fileId)) { return; }
    const sourceFileIdCheck = checkSourceFileId(fileId);
    const renameFilePromise = sourceFileIdCheck
      ? FileStorageSystemClient.doRenameSource(fileId.sourceId, newName)
      : FileStorageSystemClient.doRenameView(fileId.sourceId, fileId.viewId, newName);
    const success = await renameFilePromise;
    if (!success) {
      alert('failed to rename file');
      return;
    }
    const newFilesList = {...this.state.filesList};
    if (sourceFileIdCheck) {
      newFilesList[fileId.sourceId] = { name: newName, viewsList: newFilesList[fileId.sourceId].viewsList };
    } else {
      const newSourceViewsList = {
        ...newFilesList[fileId.sourceId].viewsList,
        [fileId.viewId]: { ...newFilesList[fileId.sourceId].viewsList[fileId.viewId], name: newName },
      };
      newFilesList[fileId.sourceId] = { name: newFilesList[fileId.sourceId].name, viewsList: newSourceViewsList };
    }
    this.setState({ filesList: newFilesList });
    if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      if (sourceFileIdCheck) { doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList)); }
      else { doSetLocalStorageSourceViewsList(fileId.sourceId, newFilesList[fileId.sourceId].viewsList); }
    }
  };

  componentDidMount = () => {
    FileStorageSystemClient.doGetFilesList().then(filesList => {
      if (!filesList) { alert('failed to retrieve files list'); }
      else { this.setState({ filesList }); }
      if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
        this.setState({ nextNewFileIds: calculateLocalStorageNextNewFileIds(this.state.filesList) });
      }
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.backendModeSignedInStatus !== this.props.backendModeSignedInStatus) {
      FileStorageSystemClient.doGetFilesList().then(filesListValue => filesListValue ?? {}).then(filesList => {
        this.setState({
          ...DEFAULT_STATE,
          filesList,
          nextNewFileIds: this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE
            ? calculateLocalStorageNextNewFileIds(filesList) : null,
        });
      });
    }
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId ||
      prevState.filesList !== this.state.filesList
    ) {
      document.getElementById(CURRENT_SOURCE_NAME_INPUT_ID).value = this.getSourceName(this.props.currentOpenFileId);
      document.getElementById(CURRENT_VIEW_NAME_INPUT_ID).value = this.getViewName(this.props.currentOpenFileId);
    }
  };
  
  renameInput = ({ inputType, fileId, ...remainingProps }) => {
    const inputId = getRenameInputIdFunctions[inputType](fileId);
    const value = this.getRenameInputValueFunctions[inputType](fileId);
    return (
      <input
        id={inputId}
        defaultValue={value}
        placeholder={value}
        disabled={
          checkNoOpenFileId(fileId) || this.state.renaming.inputType !== inputType ||
          this.state.renaming.fileId.sourceId !== fileId.sourceId ||
          this.state.renaming.fileId.viewId !== fileId.viewId
        }
        onBlur={() => {
          this.handleRenameFile(inputType, fileId).then(() => {
            if (
              this.state.renaming.inputType === inputType && this.state.renaming.fileId.sourceId === fileId.sourceId &&
              this.state.renaming.fileId.viewId === fileId.viewId
            ) { this.handleCancelRenaming(inputType, fileId); }
          });
        }}
        onKeyDown={event => { if (event.key === 'Escape') { this.handleCancelRenaming(inputType, fileId); } }}
        onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
        {...remainingProps}
      />
    );
  };

  renameButton = ({ inputType, fileId, ...remainingProps }) =>
    <button
      className="MonospaceCharButton"
      title="rename"
      hidden={
        this.state.renaming.inputType === inputType && this.state.renaming.fileId.sourceId === fileId.sourceId &&
        this.state.renaming.fileId.viewId === fileId.viewId
      }
      disabled={checkNoOpenFileId(fileId)}
      onClick={() => { this.handleStartRenaming(inputType, fileId); }}
      {...remainingProps}>
      {'*'}
    </button>;

  fileListItemButtonRow = ({ inputType, fileId }) => {
    const fileName = this.getFileName(fileId);
    const currentlyOpen = fileId.sourceId === this.props.currentOpenFileId.sourceId &&
      fileId.viewId === this.props.currentOpenFileId.viewId;
    const renameComponentProps = { inputType, fileId };
    return (
      <div className="ButtonRow">
        {
          this.state.renaming.inputType !== inputType ||
          this.state.renaming.fileId.sourceId !== fileId.sourceId ||
          this.state.renaming.fileId.viewId !== fileId.viewId
            ? <button
                title={(currentlyOpen ? 'currently ' : '') + 'open'}
                disabled={currentlyOpen}
                onClick={() => { handleSetCurrentOpenFileId(fileId); }}>
                <span style={{ fontStyle: currentlyOpen ? 'italic' : 'normal' }}>
                  {
                    this.state.searching
                      ? <React.Fragment>
                          {
                            fileName.split(this.state.searching).reduce(
                              (partial, substring, idx) => partial.concat([
                                ...(idx > 0 ? [<b key={idx}>{this.state.searching}</b>] : []),
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
          onClick={() => { if (window.confirm('confirm delete file')) { this.handleDeleteFile(fileId); } }}>
          {'-'}
        </button>
      </div>
    );
  };

  render = () => {
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    const currentSourceRenameComponentProps = {
      inputType: RENAME_INPUT_TYPES.CURRENT_SOURCE,
      fileId: { sourceId: this.props.currentOpenFileId.sourceId, viewId: 0 },
    };
    const currentViewRenameComponentProps = {
      inputType: RENAME_INPUT_TYPES.CURRENT_VIEW,
      fileId: this.props.currentOpenFileId,
    };
    const numFiles = countNumFiles(this.state.filesList);
    const filteredFilesList = this.state.searching ? this.handleDoFileNamesSearch() : this.state.filesList;
    const numFilteredFiles = countNumFiles(filteredFilesList);
    return (
      <div className="SidePane">
        <div id="current_file_container">
          <div className="InputRow">
            {!noOpenFileIdCheck ? <this.renameButton {...currentSourceRenameComponentProps} /> : null}
            <this.renameInput {...currentSourceRenameComponentProps} title="current open source" />
          </div>
          <div className="InputRow">
            {
              checkViewFileId(this.props.currentOpenFileId)
                ? <this.renameButton {...currentViewRenameComponentProps} /> : null
            }
            <this.renameInput {...currentViewRenameComponentProps} title="current open view" />
          </div>
        </div>
        <div id="create_file_buttons_row">
          <button onClick={() => { this.handleCreateNewFile(FILE_TYPE.SOURCE); }}>
            <span className="MonospaceCharButton">{'+'}</span> source
          </button>
          <div id="create_view_dropdown_button" hidden={noOpenFileIdCheck}>
            <button>
              <span className="MonospaceCharButton">{'+'}</span> view
            </button>
            <button disabled>
              <span className="MonospaceCharButton">{'+'}</span> view
            </button>
            <div>
              <button onClick={() => { this.handleCreateNewFile(FILE_TYPE.TEXT_VIEW); }}>
                <span className="MonospaceCharButton">{'+'}</span> text view
              </button>
              <button onClick={() => { this.handleCreateNewFile(FILE_TYPE.CARD_VIEW); }}>
                <span className="MonospaceCharButton">{'+'}</span> card view
              </button>
            </div>
          </div>
        </div>
        <div id="file_list_container">
          <div className="InputRow" id="search_file_names_input_row">
            <input
              id={SEARCH_FILE_NAMES_INPUT_ID}
              title="search file names"
              placeholder="search file names"
              onChange={debounce(this.handleChangeSearchingInput, 150)}
              onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
              onKeyDown={event => { if (event.key === 'Escape') { event.target.blur(); } }}
            />
            <button
              className="MonospaceCharButton"
              title="clear"
              disabled={!this.state.searching}
              onClick={this.handleClearSearchingInput}>
              {'✕'}
            </button>
          </div>
          {
            Object.keys(filteredFilesList).length > 0
              ? <ul id={FILE_LIST_ID}>
                  {
                    Object.entries(filteredFilesList).map(([sourceId, { viewsList }]) =>
                      <li key={sourceId}>
                        <this.fileListItemButtonRow
                          inputType={RENAME_INPUT_TYPES.SOURCE_LIST_ITEM}
                          fileId={{ sourceId, viewId: 0 }}
                        />
                        {
                          Object.keys(viewsList).length > 0
                            ? <ul>
                                {
                                  Object.keys(viewsList).map(viewId => {
                                    const fileId = { sourceId, viewId };
                                    return (
                                      <li key={getFileIdKeyStr(fileId)}>
                                        <this.fileListItemButtonRow
                                          inputType={RENAME_INPUT_TYPES.VIEW_LIST_ITEM}
                                          fileId={fileId}
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
            hidden={!this.state.searching}>
            {(numFiles - numFilteredFiles) + ' of ' + (numFiles) + ' files hidden by search'}
          </div>
        </div>
        <div id="user_controls_container">
          {
            this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN
              ? <button
                  onClick={() => {
                    if (
                      this.props.dispatchSetBackendModeSignedInStatusAction(
                        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
                      )
                    ) { Cookies.remove(ACCESS_TOKEN_COOKIE_KEY); }
                  }}>
                  Sign out
                </button>
              : null
          }
          <button
            onClick={() => {
              if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
                getUserSignedInStatus().then(backendModeSignedInStatus => {
                  this.handleSwitchBackendModeSignedInStatus(backendModeSignedInStatus);
                });
              } else { this.handleSwitchBackendModeSignedInStatus(BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE); }
            }}>
            {
              'Switch to ' +
              (
                this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE
                  ? 'cloud' : 'local'
              ) + ' storage'
            }
          </button>
        </div>
      </div>
    );
  };
};

export default connect(
  state => ({
    currentOpenFileId: state.currentOpenFileId,
    backendModeSignedInStatus: state.backendModeSignedInStatus,
  }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
  }),
)(Navigator);
