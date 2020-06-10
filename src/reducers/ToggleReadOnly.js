import Actions from '../actions';

export const READ_ONLY_LOCAL_STORAGE_KEY = 'readOnly';

export const ToggleReadOnlyReducer = (
  state = localStorage.getItem(READ_ONLY_LOCAL_STORAGE_KEY) === 'ReadOnly',
  action,
) => {
  if (action.type === Actions.TOGGLE_READ_ONLY.type) { return !state; }
  return state;
};
