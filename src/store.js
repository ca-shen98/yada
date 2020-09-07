import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {INITIAL_READ_ONLY_LOCAL_STORAGE_KEY, SetReadOnlyReducer} from './reducers/SetReadOnly';
import {SetSelectNodeReducer} from './reducers/SetSelectNode';
import {INITIAL_FILE_LOCAL_STORAGE_KEY, SetFileReducer} from './reducers/SetFile';
import {INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, SetTagFiltersReducer} from './reducers/SetTagFilters';

const store = configureStore({
  reducer: combineReducers({
    file: SetFileReducer,
    readOnly: SetReadOnlyReducer,
    selectNode: SetSelectNodeReducer,
    tagFilters: SetTagFiltersReducer,
  }),
});

store.subscribe(() => {
  localStorage.setItem(INITIAL_FILE_LOCAL_STORAGE_KEY, JSON.stringify(store.getState().file));
  localStorage.setItem(INITIAL_READ_ONLY_LOCAL_STORAGE_KEY, store.getState().readOnly ? 'ReadOnly' : 'Editable');
  localStorage.setItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, store.getState().tagFilters.text);
});

export default store;
