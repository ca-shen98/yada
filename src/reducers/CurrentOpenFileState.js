import {validateHasFileIdKeyObj} from '../util/ValidateFileIdKey';

export const NO_OPEN_FILE_ID_KEY = { sourceIdKey: 0, viewIdKey: 0 };

export const SET_CURRENT_OPEN_FILE_ID_KEY_ACTION_TYPE = 'currentOpenFileIdKey/set';
export const setCurrentOpenFileIdKeyActionType = fileIdKey =>
  ({ type: SET_CURRENT_OPEN_FILE_ID_KEY_ACTION_TYPE, fileIdKey });
export const currentOpenFileIdKeyReducer = (state = NO_OPEN_FILE_ID_KEY, action) =>
  action.type === SET_CURRENT_OPEN_FILE_ID_KEY_ACTION_TYPE && validateHasFileIdKeyObj(action)
    ? action.fileIdKey : state;

export const SET_SAVE_DIRTY_FLAG_ACTION_TYPE = 'saveDirtyFlag/set';
export const CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE = 'saveDirtyFlag/clear';
export const saveDirtyFlagReducer = (state = false, action) =>
  action.type !== SET_SAVE_DIRTY_FLAG_ACTION_TYPE && action.type !== CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE
    ? state : action.type === SET_SAVE_DIRTY_FLAG_ACTION_TYPE;

export const SET_SELECT_NODE_ACTION_TYPE = 'selectNode/set';
export const setSelectNodeAction = selectNode => ({ type: SET_SELECT_NODE_ACTION_TYPE, selectNode });
export const selectNodeReducer = (state = null, action) =>
  action.type === SET_SELECT_NODE_ACTION_TYPE && action.hasOwnProperty('selectNode') &&
  (!action.selectNode || action.selectNode.hasOwnProperty('pos'))
    ? action.selectNode : (action.type === SET_SELECT_NODE_ACTION_TYPE ? null : state);

export const SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE = 'modifyingTagFiltersFlag/set';
export const CLEAR_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE = 'modifyingTagFiltersFlag/clear';
export const modifyingTagFiltersFlagReducer = (state = false, action) =>
  action.type !== SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE &&
  action.type !== CLEAR_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE
    ? state : action.type === SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE;
