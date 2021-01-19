import {validateHasFileIdObj} from '../util/FileIdAndTypeUtils';

export const NO_OPEN_FILE_ID = { sourceId: 0, viewId: 0 };

const SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE = 'currentOpenFileId/set';
export const setCurrentOpenFileIdAction = fileId => ({ type: SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE, fileId });
export const currentOpenFileIdReducer = (state = NO_OPEN_FILE_ID, action) =>
  action.type !== SET_CURRENT_OPEN_FILE_ID_ACTION_TYPE || !validateHasFileIdObj(action)
    ? state : action.fileId;

export const SET_SAVE_DIRTY_FLAG_ACTION_TYPE = 'saveDirtyFlag/set';
export const CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE = 'saveDirtyFlag/clear';
export const saveDirtyFlagReducer = (state = false, action) =>
  action.type !== SET_SAVE_DIRTY_FLAG_ACTION_TYPE && action.type !== CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE
    ? state : action.type === SET_SAVE_DIRTY_FLAG_ACTION_TYPE;

const SET_SELECT_NODE_ACTION_TYPE = 'selectNode/set';
export const setSelectNodeAction = selectNode => ({ type: SET_SELECT_NODE_ACTION_TYPE, selectNode });
export const selectNodeReducer = (state = null, action) =>
  action.type === SET_SELECT_NODE_ACTION_TYPE && action.hasOwnProperty('selectNode') &&
  (!action.selectNode || action.selectNode.hasOwnProperty('pos'))
    ? action.selectNode : (action.type === SET_SELECT_NODE_ACTION_TYPE ? null : state);
