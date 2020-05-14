import {TOGGLE_EDITOR_READ_ONLY} from "../actions";

export default (state = true, action) => {
  if (action.type === TOGGLE_EDITOR_READ_ONLY.type) return !state;
  return state;
};
