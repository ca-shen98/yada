import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {currentOpenFileIdReducer, saveDirtyFlagReducer, selectNodeReducer} from './reducers/CurrentOpenFileState';
import {renamingInputStateReducer} from './reducers/RenamingInputState';
import {userSignedInReducer} from './reducers/UserSignedIn';

export default configureStore({
  reducer: combineReducers({
    currentOpenFileId: currentOpenFileIdReducer,
    saveDirtyFlag: saveDirtyFlagReducer,
    selectNode: selectNodeReducer,
    renamingInputState: renamingInputStateReducer,
    userSignedIn: userSignedInReducer,
  }),
});
