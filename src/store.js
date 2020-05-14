import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {ToggleEditorDarkModeReducer, ToggleEditorReadOnlyReducer} from './reducers/ToggleEditorProps';

export default configureStore({
  reducer: combineReducers({
    editorDarkMode: ToggleEditorDarkModeReducer,
    editorReadOnly: ToggleEditorReadOnlyReducer,
  }),
});
