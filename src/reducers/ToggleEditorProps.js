import Actions from '../actions';

export const EDITOR_PROPS_LOCAL_STORAGE_KEYS = {
  EDITOR_READ_ONLY: 'editorReadOnly',
  EDITOR_DARK_MODE: 'editorDarkMode',
};

export const ToggleEditorReadOnlyReducer = (
  state = localStorage.getItem(EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_READ_ONLY) === 'ReadOnly',
  action,
) => {
  if (action.type === Actions.TOGGLE_EDITOR_READ_ONLY.type) return !state;
  return state;
};

export const ToggleEditorDarkModeReducer = (
  state = localStorage.getItem(EDITOR_PROPS_LOCAL_STORAGE_KEYS.EDITOR_DARK_MODE) === 'Dark',
  action,
) => {
  if (action.type === Actions.TOGGLE_EDITOR_DARK_MODE.type) return !state;
  return state;
};
