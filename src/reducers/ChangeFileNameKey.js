import Actions from '../actions';

export const FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY = 'file_';
export const INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY = 'initialFileName';
export const FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY = 'filesList';

const fileNameKeysListStr = localStorage.getItem(FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY);
const filesNameKeysList = new Set(fileNameKeysListStr ? JSON.parse(fileNameKeysListStr) : ['notes']);
localStorage.setItem(FILE_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(filesNameKeysList)));

export const ChangeFileNameKeyReducer = (
  state = localStorage.getItem(INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY) || 'notes',
  action,
) => {
  if (action.type !== Actions.CHANGE_FILE_NAME_KEY_TYPE) return state;
  return action.fileNameKey;
};
