import {validateHasFileIdKeyObj} from '../util/ValidateFileIdKey';
import {NO_OPEN_FILE_ID_KEY} from './CurrentOpenFileState';

export const RENAME_INPUT_TYPES = {
  CURRENT_SOURCE: 'CURRENT_SOURCE',
  CURRENT_VIEW: 'CURRENT_VIEW',
  SOURCE_LIST_ITEM: 'SOURCE_LIST_ITEM',
  VIEW_LIST_ITEM: 'VIEW_LIST_ITEM',
};

export const NO_RENAMING_INPUT_STATE = { inputType: null, fileIdKey: NO_OPEN_FILE_ID_KEY };

export const SET_RENAMING_INPUT_STATE_ACTION_TYPE = 'renamingInputState/set';
export const setRenamingInputStateAction = renamingInputState =>
  ({ type: SET_RENAMING_INPUT_STATE_ACTION_TYPE, renamingInputState });
export const renamingInputStateReducer = (state = NO_RENAMING_INPUT_STATE, action) =>
  action.type === SET_RENAMING_INPUT_STATE_ACTION_TYPE && action.hasOwnProperty('renamingInputState') &&
  action.renamingInputState.hasOwnProperty('inputType') && (
    !action.renamingInputState.inputType ||
    Object.values(RENAME_INPUT_TYPES).includes(action.renamingInputState.inputType)
  ) && validateHasFileIdKeyObj(action.renamingInputState)
    ? action.renamingInputState : state;
