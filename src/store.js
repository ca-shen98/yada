import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {ToggleEditorDarkModeReducer, ToggleEditorReadOnlyReducer} from './reducers/ToggleEditorProps';
import {ChangeFileNameKeyReducer} from './reducers/ChangeFileNameKey';

export default configureStore({
  reducer: combineReducers({
    editorDarkMode: ToggleEditorDarkModeReducer,
    editorReadOnly: ToggleEditorReadOnlyReducer,
    fileNameKey: ChangeFileNameKeyReducer,
  }),
});
