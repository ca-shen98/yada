import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {fileStorageSystemReducer} from './reducers/FileStorageSystem';
import {
  currentOpenFileIdKeyReducer,
  saveDirtyFlagReducer,
  selectNodeReducer,
  modifyingTagFiltersFlagReducer,
} from './reducers/CurrentOpenFileState';
import {renamingInputStateReducer} from './reducers/RenamingInputState';

export default configureStore({
  reducer: combineReducers({
    fileStorageSystem: fileStorageSystemReducer,
    currentOpenFileIdKey: currentOpenFileIdKeyReducer,
    saveDirtyFlag: saveDirtyFlagReducer,
    selectNode: selectNodeReducer,
    modifyingTagFiltersFlag: modifyingTagFiltersFlagReducer,
    renamingInputState: renamingInputStateReducer,
  }),
});
