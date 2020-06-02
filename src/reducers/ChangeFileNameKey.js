import Actions from '../actions';

export const FILE_NAME_PREFIX_LOCAL_STORAGE_KEY = 'file_';
export const INITIAL_FILE_NAME_LOCAL_STORAGE_KEY = 'initialFileName';
export const FILES_LIST_LOCAL_STORAGE_KEY = 'filesList';

const filesListStr = localStorage.getItem(FILES_LIST_LOCAL_STORAGE_KEY);
const filesList = new Set(filesListStr ? JSON.parse(filesListStr) : ['notes']);
localStorage.setItem(FILES_LIST_LOCAL_STORAGE_KEY, JSON.stringify(Array.from(filesList)));

export const ChangeFileNameKeyReducer = (
  state = localStorage.getItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY) || 'notes',
  action,
) => {
  if (action.type !== Actions.CHANGE_FILE_NAME_KEY_TYPE) return state;
  return action.fileNameKey;
};
