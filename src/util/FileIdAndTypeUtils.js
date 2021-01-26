export const FILE_TYPE = {
  SOURCE: 'SOURCE',
  VIEW: 'VIEW',
};

export const validateFileIdObj = fileId => fileId.hasOwnProperty('sourceId') && fileId.hasOwnProperty('viewId');
export const validateHasFileIdObj = state => state.hasOwnProperty('fileId') && validateFileIdObj(state.fileId);

export const getFileType = fileId => validateFileIdObj(fileId) && fileId.sourceId
  ? (fileId.viewId ? FILE_TYPE.VIEW : FILE_TYPE.SOURCE) : null;

export const checkNoOpenFileId = fileId => validateFileIdObj(fileId) && !fileId.sourceId && !fileId.viewId;
export const checkSourceFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && !fileId.viewId;
export const checkViewFileId = fileId => validateFileIdObj(fileId) && fileId.sourceId && fileId.viewId;

export const getFileIdKeyStr = fileId => validateFileIdObj(fileId)
  ? (fileId.sourceId + (fileId.viewId ? '#' + fileId.viewId : '')) : '';
