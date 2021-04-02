export const SET_TAGS_IN_VIEW_ACTION_TYPE = "tagsInView/set";
export const setTagsInViewAction = (tagsInView) => ({
  type: SET_TAGS_IN_VIEW_ACTION_TYPE,
  tagsInView,
});
export const setTagsInViewReducer = (state = null, action) =>
  action.type !== SET_TAGS_IN_VIEW_ACTION_TYPE ||
  !action.hasOwnProperty("tagsInView")
    ? state
    : action.tagsInView;

export const SET_METADATA_IN_VIEW_ACTION_TYPE = "metadataInView/set";
export const setMetadataInViewAction = (metadataInView) => ({
  type: SET_METADATA_IN_VIEW_ACTION_TYPE,
  metadataInView,
});
export const setMetadataInViewReducer = (state = null, action) =>
  action.type !== SET_METADATA_IN_VIEW_ACTION_TYPE ||
  !action.hasOwnProperty("metadataInView")
    ? state
    : action.metadataInView;
