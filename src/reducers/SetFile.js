import Actions from '../actions';

export const DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY = 'docsList';
export const DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_source_';
export const DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_views_';
export const INITIAL_FILE_LOCAL_STORAGE_KEY = 'initialFile';
export const DEFAULT_DOC_NAME_KEY = '_notes';
export const SOURCE_FILE_NAME_TYPE = '__source';
export const CUSTOM_VIEW_FILE_TYPE = '__custom';
export const FILTER_VIEW_FILE_TYPE = '__filter';
export const CUSTOM_VIEW_REF_NODE_TYPE = 'ref';

const docNameKeysStr = localStorage.getItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY);
const docNameKeys = docNameKeysStr ? JSON.parse(docNameKeysStr) : [];
if (!docNameKeys.includes(DEFAULT_DOC_NAME_KEY)) {
  docNameKeys.push(DEFAULT_DOC_NAME_KEY);
  localStorage.setItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(docNameKeys));
}

const initialFileStr = localStorage.getItem(INITIAL_FILE_LOCAL_STORAGE_KEY);
const initialFile = initialFileStr ?
  JSON.parse(initialFileStr) :
  { docNameKey: DEFAULT_DOC_NAME_KEY, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE };

export const SetFileReducer = (state = initialFile, action) => {
  if (action.type !== Actions.SET_FILE_TYPE) return state;
  return action.file;
};
