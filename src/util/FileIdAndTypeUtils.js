export const FILE_TYPE = {
  SOURCE: 'SOURCE',
  VIEW: 'VIEW',
};

export const NO_OPEN_FILE_ID = { sourceId: 0, viewId: 0 };

export const validateFileIdObj = fileId => fileId.hasOwnProperty('sourceId') && fileId.hasOwnProperty('viewId');
export const validateHasFileIdObj = state => state.hasOwnProperty('fileId') && validateFileIdObj(state.fileId);

export const getFileType = fileId => validateFileIdObj(fileId) && fileId.sourceId
  ? (fileId.viewId ? FILE_TYPE.VIEW : FILE_TYPE.SOURCE) : null;

export const getFileIdKeyStr = fileId => validateFileIdObj(fileId)
  ? (fileId.sourceId + (fileId.viewId ? '#' + fileId.viewId : '')) : '';
