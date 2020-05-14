import { TOGGLE_EDITOR_READ_ONLY } from "../actions";

export default (state = false, action) => {
  if (action.type === TOGGLE_EDITOR_READ_ONLY.type) return !state;
  return state;
};
