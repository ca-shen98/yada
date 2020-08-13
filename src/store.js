import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {SetReadOnlyReducer} from './reducers/SetReadOnly';
import {
  INITIAL_DOC_NAME_KEY_LOCAL_STORAGE_KEY, INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY, SetFileReducer
} from './reducers/SetFile';
import {SetTagFiltersReducer} from './reducers/SetTagFilters';

const store = configureStore({
  reducer: combineReducers({
    readOnly: SetReadOnlyReducer,
    file: SetFileReducer,
    tagFilters: SetTagFiltersReducer,
  }),
});

store.subscribe(() => {
  localStorage.setItem(INITIAL_DOC_NAME_KEY_LOCAL_STORAGE_KEY, store.getState().file.docNameKey);
  const fileNameKey = store.getState().file.fileNameKey;
  localStorage.setItem(INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY, fileNameKey);
});

export default store;
