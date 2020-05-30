export const TOGGLE_EDITOR_READ_ONLY = { type: 'TOGGLE_EDITOR_READ_ONLY' };

export const TOGGLE_EDITOR_DARK_MODE = { type: 'TOGGLE_EDITOR_DARK_MODE' };

export const CHANGE_FILE_NAME_KEY_TYPE = 'CHANGE_FILE_NAME_KEY';

export const changeFileNameKey = fileNameKey => ({ type: CHANGE_FILE_NAME_KEY_TYPE, fileNameKey });

export default {
  'TOGGLE_EDITOR_READ_ONLY': TOGGLE_EDITOR_READ_ONLY,
  'TOGGLE_EDITOR_DARK_MODE': TOGGLE_EDITOR_DARK_MODE,
  'CHANGE_FILE_NAME_KEY_TYPE': CHANGE_FILE_NAME_KEY_TYPE,
  'changeFileNameKey': changeFileNameKey,
}
