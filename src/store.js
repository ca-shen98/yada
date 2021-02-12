import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import {currentOpenFileIdReducer, saveDirtyFlagReducer, selectNodeReducer, currentOpenFileNameReducer} from './reducers/CurrentOpenFileState';
import {backendModeSignedInStatusReducer} from './reducers/BackendModeSignedInStatus';
import {setTagsInViewReducer} from "./reducers/SetTagsInView";
import {setToastReducer} from "./reducers/Toast";
import { setStepsReducer, setStepsNavigatorReducer} from './reducers/Steps';

export default configureStore({
  reducer: combineReducers({
    currentOpenFileId: currentOpenFileIdReducer,
    currentOpenFileName: currentOpenFileNameReducer,
    saveDirtyFlag: saveDirtyFlagReducer,
    selectNode: selectNodeReducer,
    backendModeSignedInStatus: backendModeSignedInStatusReducer,
    tagsInView: setTagsInViewReducer,
    toast: setToastReducer,
    steps: setStepsReducer,
    stepsNavigator: setStepsNavigatorReducer
  }),
});
