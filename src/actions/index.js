export const TOGGLE_READ_ONLY = { type: 'TOGGLE_READ_ONLY' };

export const CHANGE_FILE_NAME_KEY_TYPE = 'CHANGE_FILE_NAME_KEY';
export const changeFileNameKey = fileNameKey => ({ type: CHANGE_FILE_NAME_KEY_TYPE, fileNameKey });

export const SET_TAG_FILTERS_TYPE = 'SET_TAG_FILTERS';
export const setTagFilters = tagFilters => ({ type: SET_TAG_FILTERS_TYPE, tagFilters });

export default {
  'TOGGLE_READ_ONLY': TOGGLE_READ_ONLY,
  'CHANGE_FILE_NAME_KEY_TYPE': CHANGE_FILE_NAME_KEY_TYPE,
  'changeFileNameKey': changeFileNameKey,
  'SET_TAG_FILTERS_TYPE': SET_TAG_FILTERS_TYPE,
  'setTagFilters': setTagFilters,
};
