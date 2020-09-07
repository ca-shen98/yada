export const SET_READ_ONLY_TYPE = 'SET_READ_ONLY';
export const setReadOnly = readOnly => ({ type: SET_READ_ONLY_TYPE, readOnly });
export const SET_SELECT_NODE_TYPE = 'SET_SELECT_NODE';
export const setSelectNode = selectNode => ({ type: SET_SELECT_NODE_TYPE, selectNode });
export const SET_FILE_TYPE = 'SET_FILE';
export const setFile = file => ({ type: SET_FILE_TYPE, file });
export const SET_TAG_FILTERS_TYPE = 'SET_TAG_FILTERS';
export const setTagFilters = tagFilters => ({ type: SET_TAG_FILTERS_TYPE, tagFilters });

export default {
  SET_READ_ONLY_TYPE: SET_READ_ONLY_TYPE,
  setReadOnly: setReadOnly,
  SET_SELECT_NODE_TYPE: SET_SELECT_NODE_TYPE,
  setSelectNode: setSelectNode,
  SET_FILE_TYPE: SET_FILE_TYPE,
  setFile: setFile,
  SET_TAG_FILTERS_TYPE: SET_TAG_FILTERS_TYPE,
  setTagFilters: setTagFilters,
};
