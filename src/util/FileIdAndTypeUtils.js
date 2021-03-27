export const FILE_TYPE = {
  SOURCE: "SOURCE",
  TEXT_VIEW: "TEXT_VIEW",
  CARD_VIEW: "CARD_VIEW",
  EMPTY: "NON_EXISTENT",
};

export const PERMISSION_TYPE = {
  OWN: "0",
  WRITE: "1",
  READ: "2",
};

export const NO_OPEN_FILE_ID = {
  sourceId: 0,
  viewId: 0,
  viewType: FILE_TYPE.EMPTY,
};

export const validateFileIdObj = (fileId) =>
  fileId.hasOwnProperty("sourceId") && fileId.hasOwnProperty("viewId");
export const validateHasFileIdObj = (state) =>
  state.hasOwnProperty("fileId") && validateFileIdObj(state.fileId);
export const validateFileNameObj = (fileName) =>
  fileName.hasOwnProperty("sourceName") && fileName.hasOwnProperty("viewName");
export const validateHasFileNameObj = (state) =>
  state.hasOwnProperty("fileName") && validateFileNameObj(state.fileName);

export const checkNoOpenFileId = (fileId) =>
  validateFileIdObj(fileId) && !fileId.sourceId && !fileId.viewId;
export const checkSourceFileId = (fileId) =>
  validateFileIdObj(fileId) && fileId.sourceId && !fileId.viewId;
export const checkViewFileId = (fileId) =>
  validateFileIdObj(fileId) && fileId.sourceId && fileId.viewId;

export const getFileIdKeyStr = (fileId) =>
  validateFileIdObj(fileId)
    ? fileId.sourceId + (fileId.viewId ? "#" + fileId.viewId : "")
    : "";
