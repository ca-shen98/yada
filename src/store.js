import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import toggleEditorReadOnlyReducer from './reducers/ToggleEditorReadOnly';

export default configureStore({
  reducer: combineReducers({editorReadOnly: toggleEditorReadOnlyReducer}),
});
