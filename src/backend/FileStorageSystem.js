import store from '../store';
import convertStrValueOrDefault from '../util/ConvertStrValueOrDefault';
import {getFileIdKeyStr} from '../util/FileIdAndTypeUtils';
import {BACKEND_MODE_SIGNED_IN_STATUS} from '../reducers/BackendModeSignedInStatus';

const SOURCE_ID_NAMES_LOCAL_STORAGE_KEY = 'sourceIdNames';

// API-ish
export const doSetLocalStorageSourceIdNames = sourceIdNames =>
  localStorage.setItem(SOURCE_ID_NAMES_LOCAL_STORAGE_KEY, JSON.stringify(sourceIdNames));

const doGetLocalStorageSourceIdNames = () => convertStrValueOrDefault(
  localStorage.getItem(SOURCE_ID_NAMES_LOCAL_STORAGE_KEY),
  {},
  'invalid sourceIdNames',
);

const SOURCE_VIEW_ID_NAMES_LOCAL_STORAGE_KEY_PREFIX = 'sourceViewIdNames_';

// API-ish
export const doSetLocalStorageSourceViewIdNames = (sourceId, sourceViewIdNames) =>
  localStorage.setItem(SOURCE_VIEW_ID_NAMES_LOCAL_STORAGE_KEY_PREFIX + sourceId, JSON.stringify(sourceViewIdNames));

const doGetLocalStorageSourceViewIdNames = sourceId => convertStrValueOrDefault(
  localStorage.getItem(SOURCE_VIEW_ID_NAMES_LOCAL_STORAGE_KEY_PREFIX + sourceId),
  {},
  'invalid sourceViewIdNames',
);

export const convertFilesListStateToFileIdNamesList = filesListState => Object.fromEntries(
  Object.entries(filesListState).map(([id, { name }]) => [id, name])
);

// API
export const doGetFilesList = () => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    return Object.fromEntries(Object.entries(doGetLocalStorageSourceIdNames()).map(
      ([sourceId, sourceName]) => [
        sourceId,
        { name: sourceName, viewIdNames: doGetLocalStorageSourceViewIdNames(sourceId) },
      ]
    ));
  }
  return null;
};

// API-ish
export const doFileNamesSearch = (filesList, search) => Object.fromEntries(
  Object.entries(filesList).map(([sourceId, { name: sourceName, viewIdNames }]) => [
    sourceId,
    {
      name: sourceName,
      viewIdNames: search
        ? Object.fromEntries(Object.entries(viewIdNames).filter(
            ([_viewId, { viewName }]) => viewName.includes(search)
          ))
        : viewIdNames,
    },
  ]).filter(
    ([_sourceId, { name: sourceName, viewIdNames }]) => !search ||
      Object.keys(viewIdNames).length > 0 || sourceName.includes(search)
  )
);

export const countNumFiles = filesList => Object.entries(filesList)
  .reduce((count, [_sourceId, { viewIdNames }]) => count + 1 + viewIdNames.length, 0);

const VIEW_CONTENT_SPEC_LOCAL_STORAGE_KEY_PREFIX = 'viewContentSpec_';

const SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX = 'sourceContent_';

// API
export const doSaveSourceContent = (sourceId, value) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT) { return false; }
  const saveValue = convertStrValueOrDefault(
    value,
    null,
    'invalid sourceContent value',
    valueStr => {
      JSON.parse(valueStr);
      return valueStr;
    },
  );
  if (!saveValue) { return false; }
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    localStorage.setItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId, saveValue);
    return true;
  }
  return false;
};

// API
export const doGetSourceContent = (sourceId, strValue = true) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    return convertStrValueOrDefault(
      localStorage.getItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId),
      strValue ? '' : { type: 'doc', content: [] },
      'invalid sourceContent',
      valueStr => {
        const sourceContentDoc = JSON.parse(valueStr);
        return strValue ? valueStr : sourceContentDoc;
      },
    );
  }
  return null;
};

const SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX = 'sourceSavedTagFilters_';

// API-ish
export const doSetSourceSavedTagFilters = (sourceId, sourceSavedTagFilters) => {
  if (Object.keys(sourceSavedTagFilters).length > 0) {
    localStorage.setItem(
      SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId,
      JSON.stringify(sourceSavedTagFilters),
    );
  } else { localStorage.removeItem(SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId); }
};

// API
export const doGetSourceSavedTagFilters = sourceId => convertStrValueOrDefault(
  localStorage.getItem(SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId),
  {},
  'invalid sourceSavedTagFilters',
);

export const calculateLocalStorageNextNewId = (existingIdsDict, candidate) => {
  while (!candidate || existingIdsDict.hasOwnProperty(candidate.toString())) { candidate += 1; }
  return candidate.toString();
};

export const calculateLocalStorageNextNewFileIds = filesList => ({
  source: calculateLocalStorageNextNewId(filesList, 0),
  nextNewViewIdsForSourceIds: Object.fromEntries(Object.entries(filesList).map(
    ([sourceId, { viewIdNames }]) => [sourceId, calculateLocalStorageNextNewId(viewIdNames, 0)]
  )),
});

// API // TODO
export const doCreateNewSource = (name, localStorageNextNewSourceId) => {
  if (store.getState().backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    return { id: localStorageNextNewSourceId, name };
  }
  return null;
};

// API
export const doDeleteSource = (sourceId, localStorageSourceViewIds) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    localStorage.removeItem(SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    localStorage.removeItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    for (const viewId of localStorageSourceViewIds) {
      localStorage.removeItem(VIEW_CONTENT_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId));
    }
    localStorage.removeItem(SOURCE_VIEW_ID_NAMES_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    return true;
  }
  return false;
};

// API
export const doDeleteView = (sourceId, viewId) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    localStorage.removeItem(VIEW_CONTENT_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId));
    return true;
  }
  return false;
};

// API
export const doRenameSource = (sourceId, name) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) { return true; }
  return false;
};

// API
export const doRenameView = (sourceId, viewId, name) => {
  const backendModeSignedInStatus = store.getState().backendModeSignedInStatus;
  if (backendModeSignedInStatus === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) { return true; }
  return false;
};
