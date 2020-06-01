import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {EDITOR_PROPS_LOCAL_STORAGE_KEYS, ToggleEditorDarkModeReducer, ToggleEditorReadOnlyReducer} from './reducers/ToggleEditorProps';
import {INITIAL_FILE_NAME_LOCAL_STORAGE_KEY, ChangeFileNameKeyReducer} from './reducers/ChangeFileNameKey';
import {INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY, SetTagFiltersReducer} from './reducers/SetTagFilters';

const store = configureStore({
  reducer: combineReducers({
    editorDarkMode: ToggleEditorDarkModeReducer,
    editorReadOnly: ToggleEditorReadOnlyReducer,
    fileNameKey: ChangeFileNameKeyReducer,
    tagFilters: SetTagFiltersReducer,
  }),
});

store.subscribe(() => {
  localStorage.setItem(
    EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_DARK_MODE,
    store.getState().editorDarkMode ? 'Dark' : 'Light',
  );
  localStorage.setItem(
    EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_READ_ONLY,
    store.getState().editorReadOnly ? 'ReadOnly' : 'Editable',
  );
  localStorage.setItem(INITIAL_FILE_NAME_LOCAL_STORAGE_KEY, store.getState().fileNameKey);
  localStorage.setItem(
    INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY,
    store.getState().tagFilters || '',
  );
});

export default store;
