import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  currentOpenFileIdReducer,
  saveDirtyFlagReducer,
  saveInProgressReducer,
  selectNodeReducer,
  currentOpenFileNameReducer,
  SIGNOUT,
} from "./reducers/CurrentOpenFileState";
import { backendModeSignedInStatusReducer } from "./reducers/BackendModeSignedInStatus";
import { setTagsInViewReducer } from "./reducers/SetTagsInView";
import { setToastReducer } from "./reducers/Toast";
import {
  setTagMenuOpenedReducer,
  setNewUserReducer,
  setTagEditorOpenedReducer,
} from "./reducers/Steps";

const reducers = combineReducers({
  currentOpenFileId: currentOpenFileIdReducer,
  currentOpenFileName: currentOpenFileNameReducer,
  saveDirtyFlag: saveDirtyFlagReducer,
  saveInProgress: saveInProgressReducer,
  selectNode: selectNodeReducer,
  backendModeSignedInStatus: backendModeSignedInStatusReducer,
  tagsInView: setTagsInViewReducer,
  toast: setToastReducer,
  tagMenuOpened: setTagMenuOpenedReducer,
  newUser: setNewUserReducer,
  tagEditorOpened: setTagEditorOpenedReducer,
});

const rootReducer = (state, action) => {
  if (action.type === SIGNOUT) {
    state = undefined;
  }
  return reducers(state, action);
};

export default configureStore({
  reducer: rootReducer,
});
