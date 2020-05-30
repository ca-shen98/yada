import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {ToggleEditorDarkModeReducer, ToggleEditorReadOnlyReducer} from './reducers/ToggleEditorProps';
import {ChangeFileNameKeyReducer} from './reducers/ChangeFileNameKey';
import {SetTagFiltersReducer} from "./reducers/SetTagFilters";

export default configureStore({
  reducer: combineReducers({
    editorDarkMode: ToggleEditorDarkModeReducer,
    editorReadOnly: ToggleEditorReadOnlyReducer,
    fileNameKey: ChangeFileNameKeyReducer,
    tagFilters: SetTagFiltersReducer,
  }),
});
