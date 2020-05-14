import {TOGGLE_EDITOR_READ_ONLY} from '../actions';

export const MODE_LOCAL_STORAGE_KEY = "mode";

export default (state = localStorage.getItem(MODE_LOCAL_STORAGE_KEY) === 'ReadOnly', action) => {
  if (action.type === TOGGLE_EDITOR_READ_ONLY.type) return !state;
  return state;
};
