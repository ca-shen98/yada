import { convertStrValueOrDefault } from "../util/ConvertStrValueOrDefault";
import {
  NO_OPEN_FILE_ID,
  validateHasFileIdObj,
  validateHasFileNameObj,
} from "../util/FileIdAndTypeUtils";

export const SIGNOUT = "signout";
export const signoutAction = () => ({ type: SIGNOUT });

export const INITIAL_FILE_ID_LOCAL_STORAGE_KEY = "initialFileId";
export const INITIAL_FILE_NAME_LOCAL_STORAGE_KEY = "initialFileName";

const storedInitialFileId = convertStrValueOrDefault(
  localStorage.getItem(INITIAL_FILE_ID_LOCAL_STORAGE_KEY),
  {},
  "invalid initialFileId"
);

const storedInitialFileName = convertStrValueOrDefault(
  localStorage.getItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY),
  {},
  "invalid initialFileName"
);

const initialFileId = {
  sourceId: storedInitialFileId.hasOwnProperty("sourceId")
    ? storedInitialFileId.sourceId
    : NO_OPEN_FILE_ID.sourceId,
  viewId: storedInitialFileId.hasOwnProperty("viewId")
    ? storedInitialFileId.viewId
    : NO_OPEN_FILE_ID.viewId,
  viewType: storedInitialFileId.hasOwnProperty("viewType")
    ? storedInitialFileId.viewType
    : NO_OPEN_FILE_ID.viewType,
};

const initialFileName = {
  sourceName: storedInitialFileName.hasOwnProperty("sourceName")
    ? storedInitialFileName.sourceName
    : "",
  viewName: storedInitialFileName.hasOwnProperty("viewName")
    ? storedInitialFileName.viewName
    : "",
};

const emptyFileId = {
  sourceId: NO_OPEN_FILE_ID.sourceId,
  viewId: NO_OPEN_FILE_ID.viewId,
  viewType: NO_OPEN_FILE_ID.viewType,
};

const emptyFileName = {
  sourceName: "",
  viewName: "",
};

const SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE = "currentOpenFileId/set";
export const setCurrentOpenFileIdAction = (fileId) => ({
  type: SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE,
  fileId,
});
export const currentOpenFileIdReducer = (state = initialFileId, action) => {
  if (action.type === SIGNOUT) {
    return emptyFileId;
  } else {
    return action.type !== SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE ||
      !validateHasFileIdObj(action)
      ? state
      : action.fileId;
  }
};

const SET_CURRENT_OPEN_FILE_NAME_ACTION_TYPE = "currentOpenFileName/set";
export const setCurrentOpenFileNameAction = (fileName) => ({
  type: SET_CURRENT_OPEN_FILE_NAME_ACTION_TYPE,
  fileName,
});
export const currentOpenFileNameReducer = (state = initialFileName, action) => {
  if (action.type === SIGNOUT) {
    return emptyFileName;
  } else {
    return action.type !== SET_CURRENT_OPEN_FILE_NAME_ACTION_TYPE ||
      !validateHasFileNameObj(action)
      ? state
      : action.fileName;
  }
};

export const SET_SAVE_DIRTY_FLAG_ACTION_TYPE = "saveDirtyFlag/set";
export const CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE = "saveDirtyFlag/clear";
export const saveDirtyFlagReducer = (state = false, action) =>
  action.type !== SET_SAVE_DIRTY_FLAG_ACTION_TYPE &&
  action.type !== CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE
    ? state
    : action.type === SET_SAVE_DIRTY_FLAG_ACTION_TYPE;

export const SET_SAVE_IN_PROGRESS = "save_in_progress/set";
export const CLEAR_SAVE_IN_PROGRESS = "save_in_progress/clear";
export const saveInProgressReducer = (state = false, action) =>
  action.type !== SET_SAVE_IN_PROGRESS && action.type !== CLEAR_SAVE_IN_PROGRESS
    ? state
    : action.type === SET_SAVE_IN_PROGRESS;

export const SET_FILE_LOADING = "file_loading/set";
export const CLEAR_FILE_LOADING = "file_loading/clear";
export const fileLoadingReducer = (state = false, action) =>
  action.type !== SET_FILE_LOADING && action.type !== CLEAR_FILE_LOADING
    ? state
    : action.type === SET_FILE_LOADING;

const SET_SELECT_NODE_ACTION_TYPE = "selectNode/set";
export const setSelectNodeAction = (selectNode) => ({
  type: SET_SELECT_NODE_ACTION_TYPE,
  selectNode,
});
export const selectNodeReducer = (state = null, action) =>
  action.type === SET_SELECT_NODE_ACTION_TYPE &&
  action.hasOwnProperty("selectNode") &&
  (!action.selectNode || action.selectNode.hasOwnProperty("pos"))
    ? action.selectNode
    : action.type === SET_SELECT_NODE_ACTION_TYPE
    ? null
    : state;

const SET_FILE_PERMISSIONS_TYPE = "setFilePermissions/set";
export const setFilePermissionsAction = (filePermissions) => ({
  type: SET_FILE_PERMISSIONS_TYPE,
  filePermissions,
});

export const setFilePermissionsReducer = (state = null, action) =>
  action.type !== SET_FILE_PERMISSIONS_TYPE ||
  !action.hasOwnProperty("filePermissions")
    ? state
    : action.filePermissions;
