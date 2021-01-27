import {convertStrValueOrDefault, convertStrValueOrDefaultIfFalsy} from '../util/ConvertStrValueOrDefault';
import {getFileIdKeyStr} from '../util/FileIdAndTypeUtils';

const SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX = 'sourceViews_';

// API-ish
export const doSetLocalStorageSourceViews = (sourceId, sourceViews) =>
  localStorage.setItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + sourceId, JSON.stringify(sourceViews));

const doGetLocalStorageSourceViews = sourceId => convertStrValueOrDefaultIfFalsy(
  localStorage.getItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + sourceId),
  {},
  'invalid sourceViews',
);

const SOURCE_ID_NAMES_LOCAL_STORAGE_KEY = 'sourceIdNames';

// API-ish
export const doSetLocalStorageSourceIdNames = sourceIdNames =>
  localStorage.setItem(SOURCE_ID_NAMES_LOCAL_STORAGE_KEY, JSON.stringify(sourceIdNames));

const doGetLocalStorageSourceIdNames = () => convertStrValueOrDefaultIfFalsy(
  localStorage.getItem(SOURCE_ID_NAMES_LOCAL_STORAGE_KEY),
  {},
  'invalid sourceIdNames',
);

export const calculateLocalStorageNextNewId = (existingIdsDict, candidate) => {
  while (!candidate || existingIdsDict.hasOwnProperty(candidate.toString())) { candidate += 1; }
  return candidate.toString();
};

export const calculateLocalStorageNextNewFileIds = filesList => ({
  source: calculateLocalStorageNextNewId(filesList, 0),
  nextNewViewIdsForSourceIds: Object.fromEntries(Object.entries(filesList).map(
    ([sourceId, { views }]) => [sourceId, calculateLocalStorageNextNewId(views, 0)]
  )),
});

const DEFAULT_VIEW_NAME = 'Unnamed View';
const DEFAULT_SOURCE_NAME = 'Unnamed Source';

const SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX = 'sourceSavedTagFilters_';

const VIEW_SPEC_LOCAL_STORAGE_KEY_PREFIX = 'viewSpec_';

const SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX = 'sourceContent_';

export default {
  doGetFilesList: async () => {
    const sourceIdNames = doGetLocalStorageSourceIdNames();
    if (!sourceIdNames) { return null; }
    const filesList = {};
    for (const [sourceId, sourceName] of Object.entries(sourceIdNames)) {
      const sourceViews = doGetLocalStorageSourceViews(sourceId);
      if (!sourceViews) { return null; }
      filesList[sourceId] = { name: sourceName, views: sourceViews };
    }
    return filesList;
  },
  doSaveViewSpec: async (tagsList, sourceId, viewId, type, createNew) => {
    const viewSpecLocalStorageKey = VIEW_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId);
    if (tagsList.length > 0) { localStorage.setItem(viewSpecLocalStorageKey, JSON.stringify(tagsList)); }
    else { localStorage.removeItem(viewSpecLocalStorageKey); }
    return { id: viewId, sourceId, ...(createNew ? { name: DEFAULT_VIEW_NAME, type } : null) };
  },
  doGetView: async (sourceId, viewId) => convertStrValueOrDefaultIfFalsy(
    localStorage.getItem(VIEW_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId)),
    [],
    'invalid viewSpec',
  ),
  doGetSourceTaggedBlocks: async sourceId => {
    const sourceContentDocStr = localStorage.getItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    if (!sourceContentDocStr) { return {}; }
    const sourceContentDoc = convertStrValueOrDefault(sourceContentDocStr, null, 'invalid sourceContent');
    if (!sourceContentDoc) { return null; }
    const sourceTaggedBlocks = {};
    if (sourceContentDoc) {
      const nodes = [sourceContentDoc];
      while (nodes.length > 0) {
        const node = nodes.shift();
        if (node.hasOwnProperty('attrs') && node.attrs.hasOwnProperty('tags')) {
          for (const [tag, tagId] of Object.entries(node.attrs.tags)) { sourceTaggedBlocks[tagId] = { tag, node }; }
        } else if (node.hasOwnProperty('content')) { nodes.push(...node.content); }
      }
    }
    return sourceTaggedBlocks;
  },
  doSaveSourceContent: async (value, sourceId, createNew) => {
    const saveValue = convertStrValueOrDefaultIfFalsy(
      value,
      '',
      'invalid sourceContent value',
      valueStr => {
        JSON.parse(valueStr);
        return valueStr;
      },
    );
    if (saveValue === null) { return null; }
    const sourceContentLocalStorageKey = SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId;
    if (saveValue) { localStorage.setItem(sourceContentLocalStorageKey, saveValue); }
    else { localStorage.removeItem(sourceContentLocalStorageKey); }
    return { id: sourceId, ...(createNew ? { name: DEFAULT_SOURCE_NAME } : null) };
  },
  doGetSourceContent: async sourceId => convertStrValueOrDefaultIfFalsy(
    localStorage.getItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId),
    '',
    'invalid sourceContent',
    valueStr => {
      JSON.parse(valueStr);
      return valueStr;
    },
  ),
  // TODO add/remove single instead of set list
  doSetSourceSavedTagFilters: async (sourceId, sourceSavedTagFilters) => {
    const sourceSavedTagFiltersLocalStorageKey = SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId;
    if (Object.keys(sourceSavedTagFilters).length > 0) {
      localStorage.setItem(sourceSavedTagFiltersLocalStorageKey, JSON.stringify(sourceSavedTagFilters));
    } else { localStorage.removeItem(sourceSavedTagFiltersLocalStorageKey); }
    return true;
  },
  doGetSourceSavedTagFilters: async sourceId => convertStrValueOrDefaultIfFalsy(
    localStorage.getItem(SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId),
    {},
    'invalid sourceSavedTagFilters',
  ),
  doDeleteView: async (sourceId, viewId) => {
    localStorage.removeItem(VIEW_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId));
    return true;
  },
  doDeleteSource: async (sourceId, localStorageSourceViewIds) => {
    localStorage.removeItem(SOURCE_SAVED_TAG_FILTERS_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    localStorage.removeItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    for (const viewId of localStorageSourceViewIds) {
      localStorage.removeItem(VIEW_SPEC_LOCAL_STORAGE_KEY_PREFIX + getFileIdKeyStr(sourceId, viewId));
    }
    localStorage.removeItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + sourceId);
    return true;
  },
  doRenameView: async () => true,
  doRenameSource: async () => true,
};
