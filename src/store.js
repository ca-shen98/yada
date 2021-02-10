import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {currentOpenFileIdReducer, saveDirtyStatusReducer, selectNodeReducer, currentOpenFileNameReducer} from './reducers/CurrentOpenFileState';
import {backendModeSignedInStatusReducer} from './reducers/BackendModeSignedInStatus';
import {setTagsInViewReducer} from "./reducers/SetTagsInView";
import {setToastReducer} from "./reducers/Toast";

export default configureStore({
  reducer: combineReducers({
    currentOpenFileId: currentOpenFileIdReducer,
    currentOpenFileName: currentOpenFileNameReducer,
    saveDirtyStatus: saveDirtyStatusReducer,
    selectNode: selectNodeReducer,
    backendModeSignedInStatus: backendModeSignedInStatusReducer,
    tagsInView: setTagsInViewReducer,
    toast: setToastReducer,
  }),
});
