import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {READ_ONLY_LOCAL_STORAGE_KEY, ToggleReadOnlyReducer} from './reducers/ToggleReadOnly';
import {INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY, ChangeFileNameKeyReducer} from './reducers/ChangeFileNameKey';
import {INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, SetTagFiltersReducer} from './reducers/SetTagFilters';
import {INITIAL_TAGS_IN_VIEW_LOCAL_STORAGE_KEY, SetTagsInViewReducer} from "./reducers/SetTagsInView";

const store = configureStore({
  reducer: combineReducers({
    readOnly: ToggleReadOnlyReducer,
    fileNameKey: ChangeFileNameKeyReducer,
    tagFilters: SetTagFiltersReducer,
    tagsInView: SetTagsInViewReducer,
  }),
});

store.subscribe(() => {
  localStorage.setItem(READ_ONLY_LOCAL_STORAGE_KEY, store.getState().readOnly ? 'ReadOnly' : 'Editable');
  localStorage.setItem(INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY, store.getState().fileNameKey);
  localStorage.setItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, store.getState().tagFilters.text || '');
  localStorage.setItem(INITIAL_TAGS_IN_VIEW_LOCAL_STORAGE_KEY, JSON.stringify(store.getState().tagsInView));
});

export default store;
