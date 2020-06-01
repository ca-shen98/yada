import Actions from '../actions';

export const FILE_NAME_PREFIX_LOCAL_STORAGE_KEY = 'file_';
export const INITIAL_FILE_NAME_LOCAL_STORAGE_KEY = 'initialFileName';

export const ChangeFileNameKeyReducer = (
  state = localStorage.getItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY) || 'notes',
  action,
) => {
  if (action.type !== Actions.CHANGE_FILE_NAME_KEY_TYPE) return state;
  return action.fileNameKey;
};
