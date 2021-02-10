import './Navigator.css';
import {debounce, defer} from 'lodash';
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
  INITIAL_FILE_NAME_LOCAL_STORAGE_KEY,
  setCurrentOpenFileIdAction,
  setCurrentOpenFileNameAction,
  setSelectNodeAction,
} from '../reducers/CurrentOpenFileState';
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  setBackendModeSignedInStatusAction,
} from '../reducers/BackendModeSignedInStatus';
import {
  doSetLocalStorageSourceIdNames,
  doSetLocalStorageSourceViews,
  calculateLocalStorageNextNewId,
  calculateLocalStorageNextNewFileIds,
} from '../backend/LocalFileStorageSystemClient';
import Button from '@material-ui/core/Button';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import EditIcon from '@material-ui/icons/Edit';
import Popover from '@material-ui/core/Popover';
import store from '../store';
import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import AmpStoriesIcon from '@material-ui/icons/AmpStories';
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";
import {setStepsNavigatorAction} from "../reducers/Steps";

export const handleSetCurrentOpenFileId = (fileId, fileName={"sourceName": '', "viewName": ''}) => {
  if (!validateFileIdObj(fileId)) { return false; }
  const currentOpenFileId = store.getState().currentOpenFileId;
  if (fileId.sourceId === currentOpenFileId.sourceId && fileId.viewId === currentOpenFileId.viewId) { return true; }
  if (!store.getState().saveDirtyFlag || window.confirm('confirm discard unsaved changes')) {
    batch(() => {
      store.dispatch(setCurrentOpenFileIdAction(fileId));
      store.dispatch(setCurrentOpenFileNameAction(fileName));
      store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
      store.dispatch(setSelectNodeAction(null));
    });
    localStorage.setItem(INITIAL_FILE_ID_LOCAL_STORAGE_KEY, JSON.stringify(fileId));
    localStorage.setItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY, JSON.stringify(fileName));
    localStorage.removeItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY);
    return true;
  }
  return false;
};

const convertFilesListStateToFileIdNamesList = filesListState => Object.fromEntries(
  Object.entries(filesListState).map(([id, { name }]) => [id, name])
);

const countNumFiles = filesList => Object.entries(filesList)
  .reduce((count, [_sourceId, { views }]) => count + 1 + Object.keys(views).length, 0);

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
  selectedFileId: null,
  selectedViewId: null,
  selectedFileOpen: false,
  editMenuAnchorElement: null,
  newViewAnchorElement: null, 
  renamePopoverElement: null
};

class FileListItem extends React.Component {
  componentDidMount = () => {
    this.props.dispatchSetStepsNavigatorAction(true);
  }

  render = () => {
    if(this.props.fileId.viewId !== 0){
      const viewType = this.props.viewType;
      return (
        <div className={"fileList-viewRoot"} style={(this.props.selected) ? 
                                                  {backgroundColor: 'rgba(30, 61, 89, 0.3)', width:"100%", display: "flex", padding: "2px 4px", alignItems: "center"} : 
                                                  {width:"100%", display: "flex", padding: "2px 4px", alignItems: "center"} }>
          <IconButton>
            {
              (viewType === FILE_TYPE.CARD_VIEW) ? 
              <AmpStoriesIcon color="primary"/>:
              (viewType === FILE_TYPE.TEXT_VIEW) ?
             <TextFieldsIcon color="primary"/> :
              null
            }
          </IconButton>
          <InputBase 
            value={this.props.fileName}
            className="file_list_input"
            disabled={true}
            style={{color: "#1E3D59"}}
          />
          <Divider className={"fileList-divider"} orientation="vertical" />
          <IconButton className={"fileList-iconButton"} onClick={this.props.handleEditMenuClick}>
            <MoreVertIcon fontSize="small" color="primary"/>
          </IconButton>
        </div>
      );
    }else{
      return (
        <div className={"fileList-viewRoot"} style={(this.props.selected) ? 
                                                      {backgroundColor: 'rgba(30, 61, 89, 0.3)', border:"solid #3f51b5 thin", width:"100%", display: "flex", padding: "2px 4px", alignItems: "center"} :
                                                       {width:"100%", display: "flex", padding: "2px 4px", alignItems: "center"} }>
          <InputBase 
            value={this.props.fileName}
            className="file_list_input"
            disabled={true}
            style={{color: "#1E3D59"}}
          />
          {this.props.childViewsExist ? (this.props.open ? <ExpandLess /> : <ExpandMore />) : null}
          <Divider className={"fileList-divider"} orientation="vertical" />
          <IconButton className={"fileList-iconButton"} onClick={this.props.handleEditMenuClick}>
            <MoreVertIcon fontSize="small" color="primary"/>
          </IconButton>
        </div>
      );
    }
  }
};

class Navigator extends React.Component {
  
  state = DEFAULT_STATE;

  renameField = React.createRef();

  resetState = () => { this.setState(DEFAULT_STATE); }

  getSourceName = fileId => validateFileIdObj(fileId) && this.state.filesList.hasOwnProperty(fileId.sourceId)
      ? this.state.filesList[fileId.sourceId].name : '';
  
  getViewName = fileId => checkViewFileId(fileId) && this.state.filesList.hasOwnProperty(fileId.sourceId) &&
    this.state.filesList[fileId.sourceId].views.hasOwnProperty(fileId.viewId)
      ? this.state.filesList[fileId.sourceId].views[fileId.viewId].name : '';

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

  handleClearSearchingInput = () => {
    document.getElementById(SEARCH_FILE_NAMES_INPUT_ID).value = '';
    this.setState({ searching: '' });
  };

  handleChangeSearchingInput = () => {
    this.setState({ searching: document.getElementById(SEARCH_FILE_NAMES_INPUT_ID).value.trim() });
  };

  handleDoFileNamesSearch = () => Object.fromEntries(
    Object.entries(this.state.filesList).map(([sourceId, { name: sourceName, views }]) => [
      sourceId,
      {
        name: sourceName,
        views: this.state.searching
          ? Object.fromEntries(Object.entries(views).filter(
              ([_viewId, { name: viewName }]) => viewName.includes(this.state.searching)
            ))
          : views,
      },
    ]).filter(
      ([_sourceId, { name: sourceName, views }]) => !this.state.searching ||
        Object.keys(views).length > 0 || sourceName.includes(this.state.searching)
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
    try {
      const newFile = await newFilePromise;
      const updatedSourceId = sourceFileType ? newFile.id : this.state.selectedFileId;
      const newFilesList = {
        ...this.state.filesList,
        [updatedSourceId]: {
          name: sourceFileType ? newFile.name : this.state.filesList[updatedSourceId].name,
          views: {
            ...(
                !sourceFileType
                    ? {
                      ...this.state.filesList[updatedSourceId].views,
                      [newFile.id]: {name: newFile.name, type: newFile.type},
                    }
                    : null
            ),
          },
        },
      };
      this.setState(
        {filesList: newFilesList,
         selectedFileId: updatedSourceId,
         selectedFileOpen: !sourceFileType,
         selectedViewId: (sourceFileType) ? 0 : newFile.id
        });
      
      defer(() => {
        const fileId = {sourceId: updatedSourceId, viewId: !sourceFileType ? newFile.id : 0, viewType: sourceFileType ? FILE_TYPE.EMPTY: newFile.type};
        const fileName = {sourceName: this.getSourceName(fileId), viewName: this.getViewName(fileId)};
        handleSetCurrentOpenFileId(fileId, fileName);
      });
      this.setState({renamePopoverElement: document.getElementById(getFileIdKeyStr({sourceId: updatedSourceId, viewId: !sourceFileType ? newFile.id : 0, viewType: sourceFileType ? FILE_TYPE.EMPTY: newFile.type}))});
      if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
        if (sourceFileType) {
          doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList));
        } else {
          doSetLocalStorageSourceViews(updatedSourceId, newFilesList[updatedSourceId].views);
        }
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
                            calculateLocalStorageNextNewId(newFilesList[updatedSourceId].views, parseInt(newFile.id)),
                      }
                      : null
              ),
            },
          },
        });
      }
    } catch (e) {
      this.props.dispatchSetToastAction({
        message: "Failed to create new file",
        severity: TOAST_SEVERITY.ERROR,
        open: true
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
          Object.keys(this.state.filesList[fileId.sourceId].views),
        )
      : FileStorageSystemClient.doDeleteView(fileId.sourceId, fileId.viewId);
    const success = await deleteFilePromise;
    if (!success) {
      this.props.dispatchSetToastAction({
        message: "Failed to delete file",
        severity: TOAST_SEVERITY.ERROR,
        open: true
      });
      return;
    }
    const newFilesList = {...this.state.filesList};
    if (sourceFileIdCheck) { delete newFilesList[fileId.sourceId]; }
    else {
      const newSourceViews = {...newFilesList[fileId.sourceId].views};
      delete newSourceViews[fileId.viewId];
      newFilesList[fileId.sourceId] = { name: newFilesList[fileId.sourceId].name, views: newSourceViews };
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
      } else { doSetLocalStorageSourceViews(fileId.sourceId, newFilesList[fileId.sourceId].views); }
    }
  };

  handleRenameFile = async (fileId) => {
    if (checkNoOpenFileId(fileId)) { return; }
    const input = document.getElementById("rename_field");
    if (!input) { return; }
    const newName = input.value.trim();
    if (!newName || newName === this.getFileName(fileId)) { return; }
    const sourceFileIdCheck = checkSourceFileId(fileId);
    const renameFilePromise = sourceFileIdCheck
      ? FileStorageSystemClient.doRenameSource(fileId.sourceId, newName)
      : FileStorageSystemClient.doRenameView(fileId.sourceId, fileId.viewId, newName);
    const success = await renameFilePromise;
    if (!success) {
      this.props.dispatchSetToastAction({
        message: "Failed to rename file",
        severity: TOAST_SEVERITY.ERROR,
        open: true
      });
      return;
    }
    store.dispatch(setCurrentOpenFileNameAction({sourceName: sourceFileIdCheck ? newName : this.getSourceName(fileId), viewName: sourceFileIdCheck ? '' : newName}));
    const newFilesList = {...this.state.filesList};
    if (sourceFileIdCheck) {
      newFilesList[fileId.sourceId] = { name: newName, views: newFilesList[fileId.sourceId].views };
    } else {
      const newSourceViews = {
        ...newFilesList[fileId.sourceId].views,
        [fileId.viewId]: { ...newFilesList[fileId.sourceId].views[fileId.viewId], name: newName },
      };
      newFilesList[fileId.sourceId] = { name: newFilesList[fileId.sourceId].name, views: newSourceViews };
    }
    this.setState({ filesList: newFilesList });
    if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      if (sourceFileIdCheck) { doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList)); }
      else { doSetLocalStorageSourceViews(fileId.sourceId, newFilesList[fileId.sourceId].views); }
    }
  };

  componentDidMount = () => {
    this.setState({
      selectedFileId : this.props.currentOpenFileId.sourceId,
      selectedViewId: this.props.currentOpenFileId.viewId,
      selectedFileOpen: this.props.currentOpenFileId.viewId !== 0
    })
    FileStorageSystemClient.doGetFilesList().then(filesList => {
      if (!filesList) {
        this.props.dispatchSetToastAction({
          message: "Failed to retrieve file list",
          severity: TOAST_SEVERITY.ERROR,
          open: true
        });
      } else { this.setState({ filesList }); }
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
    if(document.getElementById("rename_field") != null && this.state.renamePopoverElement != null){
      console.log("Setting focus field");
      // document.getElementById("rename_field").select();
      document.getElementById("rename_field").focus();
      // document.getElementById("rename_field").autofocus = true;
    }
  };

  handleFileListClick = (fileId) => {
    if (fileId === this.state.selectedFileId) {
      handleSetCurrentOpenFileId({ sourceId:fileId, viewId: 0, viewType: FILE_TYPE.EMPTY}, {sourceName: this.state.filesList[fileId].name, viewName: ''});
      this.setState({
        selectedViewId: null,
        selectedFileOpen: !(this.state.selectedFileOpen)
      });
    }else{
      if(handleSetCurrentOpenFileId({ sourceId:fileId, viewId: 0, viewType: FILE_TYPE.EMPTY}, {sourceName: this.state.filesList[fileId].name, viewName: ''})){
        this.setState({
          selectedFileId: fileId,
          selectedViewId: null,
          selectedFileOpen: true
        });
      }
    }
    
  };

  handleViewListClick = (fileId) => {
    const fileName = {sourceName: this.getSourceName(fileId), viewName: this.getViewName(fileId)};
    handleSetCurrentOpenFileId(fileId, fileName);
    this.setState({
      selectedViewId: fileId.viewId,
    });
  };

  handleEditMenuClick = (event) => {
    this.setState({
      editMenuAnchorElement: event.currentTarget
    })
  }

  handleEditMenuClose = () => {
    this.setState({
      editMenuAnchorElement: null
    })
  }

  handleDeleteMenuClick = () => {
    this.handleEditMenuClose();
    const fileId = { sourceId: this.state.selectedFileId, viewId: (this.state.selectedViewId === null) ? 0 : this.state.selectedViewId}
    this.handleDeleteFile(fileId).then(success => {
      if (fileId.viewId !== 0) {
        this.setState({
          selectedViewId: null,
        });
      }else{
        this.setState({
          selectedFileId: null,
          selectedViewId: null,
          selectedFileOpen: false
        });
      }
    });
  }

  handleRenameMenuClick = (event) => {
    this.setState({
      renamePopoverElement: this.state.editMenuAnchorElement,
      editMenuAnchorElement: null
    })
  }

  handleRenamePopoverClose = () => {
    this.setState({
      renamePopoverElement: null
    })
  }

  handleViewMenuOpen = (event) => {
    this.setState({
      newViewAnchorElement : this.state.editMenuAnchorElement
    })
  }

  handleViewMenuClose = () => {
    this.setState({
      newViewAnchorElement : null,
      editMenuAnchorElement: null
    })
  }

  render = () => {
    const numFiles = countNumFiles(this.state.filesList);
    const filteredFilesList = this.state.searching ? this.handleDoFileNamesSearch() : this.state.filesList;
    const numFilteredFiles = countNumFiles(filteredFilesList);
    return (
      <div className="SidePane">
        <div id="file_list_container">
            <Button
              variant="outlined"
              color="primary"
              endIcon={<AddCircleIcon />}
              disableElevation
              id="new_document_button"
              onClick={() => { this.handleCreateNewFile(FILE_TYPE.SOURCE); }}
            >
              New Document
            </Button>
          <div className="InputRow" id="search_file_names_input_row">
            <Input
              variant="outlined"
              id={SEARCH_FILE_NAMES_INPUT_ID}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              style={{"width":"100%"}}
              title="Search File Names"
              placeholder="Search File Names"
              onChange={debounce(this.handleChangeSearchingInput, 150)}
              onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
              onKeyDown={event => { if (event.key === 'Escape') { event.target.blur(); } }}
            />
          </div>
          {
            Object.keys(filteredFilesList).length > 0
              ?  <List
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader"
                        style={{backgroundColor: "#F5F0E1"}}>
                        Source Files
                      </ListSubheader>
                    }
                    id={FILE_LIST_ID}
                    style={{"maxWidth" : 360, "width" : '100%'}}
                  >
                  {
                    Object.entries(filteredFilesList).map(([sourceId, { views }]) =>
                    <div>
                      <ListItem button 
                      key={sourceId} 
                      id ={getFileIdKeyStr({ sourceId, viewId: 0 })}
                      disableGutters={true}
                      divider={true}
                      style={{"padding":"0px"}}
                      onClick={() => {this.handleFileListClick(sourceId)}}
                      >
                        <FileListItem
                          fileId={{ sourceId, viewId: 0 }}
                          selected={sourceId === this.state.selectedFileId}
                          open={sourceId === this.state.selectedFileId && this.state.selectedFileOpen}
                          handleEditMenuClick={this.handleEditMenuClick}
                          childViewsExist={Object.keys(views).length > 0}
                          fileName={this.getFileName({ sourceId, viewId: 0 })}
                          dispatchSetStepsNavigatorAction={this.props.dispatchSetStepsNavigatorAction}
                        />
                      </ListItem>
                        {
                          Object.keys(views).length > 0
                            ? <Collapse in={sourceId === this.state.selectedFileId && this.state.selectedFileOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding style={{"borderStyle": "none solid solid solid", "borderColor" :"#3f51b5", "borderWidth": "thin", "borderRadius": "4px"}}>
                                {
                                  Object.keys(views).map(viewId => {
                                    const fileId = { sourceId, viewId, "viewType": views[viewId].type };
                                    return (
                                      <ListItem button 
                                      key={getFileIdKeyStr(fileId)} 
                                      id ={getFileIdKeyStr(fileId)}
                                      disableGutters={true}
                                      divider={true}
                                      style={{ "paddingTop": "0px", "paddingBottom": "0px", "backgroundColor": "transparent"}}
                                      onClick={() => {this.handleViewListClick(fileId)}}
                                      >
                                      <FileListItem
                                          fileId={fileId}
                                          open={viewId === this.state.selectedViewId}
                                          handleEditMenuClick={this.handleEditMenuClick}
                                          fileName={this.getFileName(fileId)}
                                          viewType={views[viewId].type}
                                          selected={viewId === this.state.selectedViewId}
                                        />
                                      </ListItem>
                                    );
                                  })
                                }
                                </List>
                              </Collapse>
                            : null
                          }
                          </div>   
                    )
                  }
                </List>
              : <div className="PlaceholderDivWithText" id="no_files_placeholder">
                  No Files
                </div>
          }
          <Menu
            id="edit_menu"
            anchorEl={this.state.editMenuAnchorElement}
            keepMounted
            open={Boolean(this.state.editMenuAnchorElement)}
            onClose={() => this.handleEditMenuClose()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {
              (this.state.selectedViewId === null) ? 
              <MenuItem onClick={() => this.handleViewMenuOpen()}>
                <ListItemIcon>
                  <AddIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="New View" color="primary"/>
              </MenuItem>
              : null
            }
              <MenuItem onClick={() => this.handleRenameMenuClick()}>
                <ListItemIcon>
                  <EditIcon fontSize="small" color="primary"/>
                </ListItemIcon>
                <ListItemText primary="Rename" color="primary"/>
              </MenuItem>
              <MenuItem onClick={() => this.handleDeleteMenuClick()}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="primary"/>
                </ListItemIcon>
                <ListItemText primary="Delete" color="primary"/>
              </MenuItem>
          </Menu>
          <Menu 
            id="viewMenu"
            anchorEl={this.state.newViewAnchorElement}
            keepMounted
            open={Boolean(this.state.newViewAnchorElement)}
            onClose={() => this.handleViewMenuClose()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
              <MenuItem 
                  onClick={() => {
                    this.handleViewMenuClose();
                    this.handleCreateNewFile(FILE_TYPE.TEXT_VIEW);}}
              >
                <ListItemIcon>
                  <TextFieldsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Text View" />
              </MenuItem>
              <MenuItem
              onClick={() => {
                this.handleViewMenuClose();
                this.handleCreateNewFile(FILE_TYPE.CARD_VIEW);}}
              >
                <ListItemIcon>
                  <AmpStoriesIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Card View" />
              </MenuItem>
          </Menu>
          <Popover
            open={Boolean(this.state.renamePopoverElement)}
            onClose={this.handleRenamePopoverClose}
            anchorEl={this.state.renamePopoverElement}
            anchorOrigin={{
              vertical:'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical:'top',
              horizontal: 'right'
            }}
            id="rename_popover"
          >
            <Input
              ref={this.renameField}
              id="rename_field"
              autoFocus={true}
              defaultValue={this.getFileName({sourceId: this.state.selectedFileId, viewId: (this.state.selectedViewId == null) ? 0 : this.state.selectedViewId})}
              onKeyPress={event => {
                if(event.key === 'Enter') {
                    this.handleRenameFile({sourceId: this.state.selectedFileId, viewId: (this.state.selectedViewId == null) ? 0 : this.state.selectedViewId})
                    this.handleRenamePopoverClose();
                }   
              }}
              onKeyDown={event => {
                if(event.key === 'Escape') {
                    this.handleRenamePopoverClose();
                }   
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton 
                    onClick= {() => {
                      this.handleRenameFile({sourceId: this.state.selectedFileId, viewId: (this.state.selectedViewId == null) ? 0 : this.state.selectedViewId})
                      this.handleRenamePopoverClose();
                    }}
                  >
                      <CheckIcon/>
                  </IconButton>
                </InputAdornment>
              }
              disableUnderline={true}
              fullWidth={true}
              style={{height:"50px", "paddingLeft": "10px"}}
            />
          </Popover>
          <div
            className="PlaceholderDivWithText"
            id="filtered_files_placeholder"
            hidden={!this.state.searching}>
            {(numFiles - numFilteredFiles) + ' of ' + (numFiles) + ' files hidden by search'}
          </div>
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
    dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
    dispatchSetStepsNavigatorAction: stepsNavigator => dispatch(setStepsNavigatorAction(stepsNavigator))
  }),
)(Navigator);
