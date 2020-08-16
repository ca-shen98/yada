import Actions from '../actions';

export const INITIAL_READ_ONLY_LOCAL_STORAGE_KEY = 'initialReadOnly';

export const SetReadOnlyReducer = (
  state = localStorage.getItem(INITIAL_READ_ONLY_LOCAL_STORAGE_KEY) === 'ReadOnly',
  action,
) => {
  if (action.type !== Actions.SET_READ_ONLY_TYPE) { return state; }
  return action.readOnly;
};
