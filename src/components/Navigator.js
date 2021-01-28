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
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
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
import DescriptionIcon from '@material-ui/icons/Description';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

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
  renameSelected: false,
  newViewAnchorElement: null
};

class Navigator extends React.Component {
  
  state = DEFAULT_STATE;

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
    const newFile = await newFilePromise;
    if (!newFile) {
      alert('failed to create new file');
      return;
    }
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
    });
    if (this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      if (sourceFileType) { doSetLocalStorageSourceIdNames(convertFilesListStateToFileIdNamesList(newFilesList)); }
      else { doSetLocalStorageSourceViews(updatedSourceId, newFilesList[updatedSourceId].views); }
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
      alert('failed to delete file');
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
      alert('failed to rename file');
      return;
    }
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

  fileListItem = ({ fileId, selected, open, handleEditMenuClick, childViewsExist }) => {
    const useStyles = makeStyles((theme) => ({
      root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
      },
      viewRoot: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 200,
      },
      input: {
        marginLeft: theme.spacing(1),
        flex: 1,
      },
      iconButton: {
        padding: 5,
      },
      divider: {
        height: 28,
        margin: 4,
      },
    }));
    const classes = useStyles();
    const fileName = this.getFileName(fileId);
    if(fileId.viewId !== 0){
      const viewType = this.state.filesList[fileId.sourceId].views[fileId.viewId].type;
      return (
        <Paper className={classes.viewRoot} style={(selected) ? {backgroundColor: 'rgba(0, 0, 0, 0.08)'} : {} } component="form" elevation={0}>
          <IconButton>
            {
              (viewType === FILE_TYPE.CARD_VIEW) ? 
              <AmpStoriesIcon/>:
              (viewType === FILE_TYPE.TEXT_VIEW) ?
             <TextFieldsIcon /> :
              null
            }
          </IconButton>
          <InputBase 
            value={fileName}
            className="file_list_input"
            disabled={!(selected && this.state.renameSelected)}
          />
          <Divider className={classes.divider} orientation="vertical" />
          <IconButton className={classes.iconButton} onClick={handleEditMenuClick}>
            <MoreVertIcon fontSize="small" color="disabled"/>
          </IconButton>
        </Paper>
      );
    }else{
      return (
        <Paper className={classes.root} style={(selected) ? {backgroundColor: '#a3d2f7', border:"solid #3f51b5 thin"} : {} } component="form" elevation={0}>
          <InputBase 
            value={fileName}
            className="file_list_input"
            disabled={!(selected && this.state.renameSelected)}
          />
          {childViewsExist ? (open ? <ExpandLess /> : <ExpandMore />) : null}
          <Divider className={classes.divider} orientation="vertical" />
          <IconButton className={classes.iconButton} onClick={handleEditMenuClick}>
            <MoreVertIcon fontSize="small" color="disabled"/>
          </IconButton>
        </Paper>
      );
    }
  };

  handleFileListClick = (fileId) => {
    if (fileId == this.state.selectedFileId) {
      this.setState({
        selectedViewId: null,
        selectedFileOpen: !(this.state.selectedFileOpen)
      });
    }else{
      if(handleSetCurrentOpenFileId({ sourceId:fileId, viewId: 0 })){
        this.setState({
          selectedFileId: fileId,
          selectedViewId: null,
          selectedFileOpen: true
        });
      }
    }
    
  };

  handleViewListClick = (viewId) => {
    this.setState({
      selectedViewId: viewId,
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
        { (this.state.selectedFileId === null) ? null :
              <div>
                <div id="current_file_container">
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={3}>
                    <IconButton>
                    <DescriptionIcon   />
                    </IconButton>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="h6" color="inherit" id={CURRENT_SOURCE_NAME_INPUT_ID}>
                          {this.getFileName({sourceId: this.state.selectedFileId, viewId: 0})}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
                <Divider variant="middle" />
              </div>
        }
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
                      <ListSubheader component="div" id="nested-list-subheader">
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
                      disableGutters={true}
                      divider={true}
                      selected={true}
                      style={{"padding":"0px"}}
                      onClick={() => {this.handleFileListClick(sourceId)}}
                      >
                        <this.fileListItem
                          fileId={{ sourceId, viewId: 0 }}
                          selected={sourceId === this.state.selectedFileId}
                          open={sourceId === this.state.selectedFileId && this.state.selectedFileOpen}
                          handleEditMenuClick={this.handleEditMenuClick}
                          childViewsExist={Object.keys(views).length > 0}
                        />
                      </ListItem>
                        {
                          Object.keys(views).length > 0
                            ? <Collapse in={sourceId === this.state.selectedFileId && this.state.selectedFileOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding style={{"borderStyle": "none solid solid solid", "borderColor" :"#3f51b5", "borderWidth": "thin", "borderRadius": "4px"}}>
                                {
                                  Object.keys(views).map(viewId => {
                                    const fileId = { sourceId, viewId };
                                    return (
                                      <ListItem button 
                                      key={getFileIdKeyStr(fileId)} 
                                      disableGutters={true}
                                      divider={true}
                                      selected={true}
                                      style={{ "paddingTop": "0px", "paddingBottom": "0px", "backgroundColor": "transparent"}}
                                      onClick={() => {this.handleViewListClick(viewId)}}
                                      >
                                      <this.fileListItem
                                          fileId={fileId}
                                          open={viewId === this.state.selectedViewId}
                                          handleEditMenuClick={this.handleEditMenuClick}
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
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="New View" />
              </MenuItem>
              : null
            }
              <MenuItem onClick={() => this.handleRenameMenuClick()}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Rename" />
              </MenuItem>
              <MenuItem onClick={() => this.handleDeleteMenuClick()}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete" />
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
              id="rename_field"
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
        <div id="user_controls_container">
          {
            this.props.backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN
              ? <Button
                  variant="outlined"
                  onClick={() => {
                    if (
                      this.props.dispatchSetBackendModeSignedInStatusAction(
                        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
                      )
                    ) { Cookies.remove(ACCESS_TOKEN_COOKIE_KEY); }
                  }}>
                  Sign out
                </Button>
              : null
          }
          <Button
            variant="outlined"
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
          </Button>
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
