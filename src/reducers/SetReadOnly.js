import Actions from '../actions';
import {INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY, SOURCE_FILE_NAME} from './SetFile';

const initialFileNameKey = localStorage.getItem(INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY) || SOURCE_FILE_NAME;

export const SetReadOnlyReducer = (state = initialFileNameKey !== SOURCE_FILE_NAME, action) => {
  if (action.type !== Actions.SET_READ_ONLY_TYPE) { return state; }
  return action.readOnly;
};
