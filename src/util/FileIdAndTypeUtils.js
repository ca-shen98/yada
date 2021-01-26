export const FILE_TYPE = {
  SOURCE: 'SOURCE',
  TEXT_VIEW: 'TEXT_VIEW',
  CARD_VIEW: 'CARD_VIEW',
};

export const NO_OPEN_FILE_ID = { sourceId: 0, viewId: 0 };

export const validateFileIdObj = fileId => fileId.hasOwnProperty('sourceId') && fileId.hasOwnProperty('viewId');
export const validateHasFileIdObj = state => state.hasOwnProperty('fileId') && validateFileIdObj(state.fileId);

export const checkNoOpenFileId = fileId => validateFileIdObj(fileId) && !fileId.sourceId && !fileId.viewId;
export const checkSourceFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && !fileId.viewId;
export const checkViewFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && fileId.viewId;

export const checkNoOpenFileId = fileId => validateFileIdObj(fileId) && !fileId.sourceId && !fileId.viewId;
export const checkSourceFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && !fileId.viewId;
export const checkViewFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && fileId.viewId;

export const getFileIdKeyStr = fileId => validateFileIdObj(fileId)
  ? (fileId.sourceId + (fileId.viewId ? '#' + fileId.viewId : '')) : '';
