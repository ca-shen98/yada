export const validateFileIdKeyObj =
  fileIdKey => fileIdKey.hasOwnProperty('sourceIdKey') && fileIdKey.hasOwnProperty('viewIdKey');
export const validateHasFileIdKeyObj =
  state => state.hasOwnProperty('fileIdKey') && validateFileIdKeyObj(state.fileIdKey);
