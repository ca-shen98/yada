import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {currentOpenFileIdReducer, saveDirtyFlagReducer, selectNodeReducer} from './reducers/CurrentOpenFileState';
import {renamingInputStateReducer} from './reducers/RenamingInputState';
import {backendModeSignedInStatusReducer} from './reducers/BackendModeSignedInStatus';

export default configureStore({
  reducer: combineReducers({
    currentOpenFileId: currentOpenFileIdReducer,
    saveDirtyFlag: saveDirtyFlagReducer,
    selectNode: selectNodeReducer,
    renamingInputState: renamingInputStateReducer,
    backendModeSignedInStatus: backendModeSignedInStatusReducer,
  }),
});
