import {Node} from 'rich-markdown-editor/node_modules/prosemirror-model';
import {validateFileIdKeyObj} from '../util/ValidateFileIdKey';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';
  
const SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX = 'sourceContent_';

// API
export const doGetSourceContent = sourceIdKey => {
  const sourceContentStr = localStorage.getItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceIdKey);
  let sourceContentVal = '';
  if (sourceContentStr) {
    try {
      Node.fromJSON(BlockTaggingEditorExtension.editor.schema, JSON.parse(sourceContentStr));
      sourceContentVal = sourceContentStr;
    } catch (e) {
      console.log('invalid sourceContent doc');
      console.log(e);
    }
  }
  return sourceContentVal;
};

// API
export const doSaveSourceContent = (sourceIdKey, value) => {
  let saveValue = localStorage.getItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceIdKey);
  try {
    JSON.parse(value);
    saveValue = value;
  } catch (e) {
    console.log('invalid sourceContent value');
    console.log(e);
  }
  if (saveValue) { localStorage.setItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + sourceIdKey, value); }
};

export const getFileIdKeyStr = fileIdKey =>
  (fileIdKey.hasOwnProperty('sourceIdKey') ? fileIdKey.sourceIdKey : '') +
  (fileIdKey.hasOwnProperty('viewIdKey') && fileIdKey.viewIdKey ? '#' + fileIdKey.viewIdKey : '');

export const calculateNextNewIdKey = (existingIdKeys, candidate) => {
  while (!candidate || existingIdKeys.hasOwnProperty(candidate)) { candidate += 1; }
  return candidate.toString();
};

const calculateInitialNextNewIdKey = existingIdKeys =>
  calculateNextNewIdKey(existingIdKeys, Object.keys(existingIdKeys).reduce((max, idKey) => Math.max(max, idKey), 0));

const SOURCES_LIST_LOCAL_STORAGE_KEY = 'sourcesList';

let sourcesList = {};
const sourcesListStr = localStorage.getItem(SOURCES_LIST_LOCAL_STORAGE_KEY);
if (sourcesListStr) {
  try { sourcesList = JSON.parse(sourcesListStr); }
  catch (e) {
    console.log('invalid sourcesList');
    console.log(e);
  }
}

const SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX = 'sourceViews_';

let numViews = 0;
const viewsState = Object.keys(sourcesList).reduce(
  (partial, sourceIdKey) => {
    const sourceViewsStr = localStorage.getItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + sourceIdKey);
    let sourceViews = {};
    if (sourceViewsStr) {
      try { sourceViews = JSON.parse(sourceViewsStr); }
      catch (e) {
        console.log('invalid sourceViews');
        console.log(e);
      }
    }
    numViews += Object.keys(sourceViews).length;
    return {
      ...partial,
      ...(
        Object.keys(sourceViews).length > 0
          ? { [sourceIdKey]: { nextNewViewIdKey: calculateInitialNextNewIdKey(sourceViews), sourceViews } }
          : null
      ),
    };
  },
  {},
);

export const FILE_TYPES = {
  INVALID: 'INVALID',
  SOURCE: 'SOURCE',
  FILTER_VIEW: 'FILTER_VIEW',
  REFERENCE_VIEW: 'REFERENCE_VIEW',
};
  
const DEFAULT_VIEW_NAME_PREFIX = 'Unnamed View';

// APIs
export const NEW_SOURCE_ACTION_TYPE = 'sources/new';
export const DELETE_SOURCE_ACTION_TYPE = 'sources/delete';
export const RENAME_SOURCE_ACTION_TYPE = 'sources/rename';
export const PERSIST_NEW_FILTER_VIEW_ACTION_TYPE = 'views/filter/create';
export const DELETE_VIEW_ACTION_TYPE = 'views/delete';
export const RENAME_VIEW_ACTION_TYPE = 'views/rename';
export const MODIFY_FILTER_VIEW_ACTION_TYPE = 'views/filter/modify';

export const newSourceAction = name => ({ type: NEW_SOURCE_ACTION_TYPE, name });
export const deleteSourceAction = sourceIdKey => ({ type: DELETE_SOURCE_ACTION_TYPE, sourceIdKey });
export const renameSourceAction = (sourceIdKey, name) =>
  ({ type: RENAME_SOURCE_ACTION_TYPE, sourceIdKey, name });
export const persistNewFilterViewAction = (sourceIdKey, tagFilters) =>
  ({ type: PERSIST_NEW_FILTER_VIEW_ACTION_TYPE, sourceIdKey, tagFilters });
export const deleteViewAction = (sourceIdKey, viewIdKey) =>
  ({ type: DELETE_VIEW_ACTION_TYPE, sourceIdKey, viewIdKey });
export const renameViewAction = (sourceIdKey, viewIdKey, name) =>
  ({ type: RENAME_VIEW_ACTION_TYPE, sourceIdKey, viewIdKey, name });
export const modifyFilterViewAction = (sourceIdKey, viewIdKey, tagFilters) =>
  ({ type: MODIFY_FILTER_VIEW_ACTION_TYPE, sourceIdKey, viewIdKey, tagFilters });

export const fileStorageSystemReducer = (
  state = {
    sourcesList,
    nextNewSourceIdKey: calculateInitialNextNewIdKey(sourcesList),
    viewsState,
    numViews,
  },
  action,
) => {
  if (
    (
      action.type !== NEW_SOURCE_ACTION_TYPE && action.type !== DELETE_SOURCE_ACTION_TYPE &&
      action.type !== RENAME_SOURCE_ACTION_TYPE && action.type !== PERSIST_NEW_FILTER_VIEW_ACTION_TYPE &&
      action.type !== DELETE_VIEW_ACTION_TYPE && action.type !== RENAME_VIEW_ACTION_TYPE &&
      action.type !== MODIFY_FILTER_VIEW_ACTION_TYPE
    ) || (
      (
        action.type === NEW_SOURCE_ACTION_TYPE || action.type === RENAME_SOURCE_ACTION_TYPE ||
        action.type === RENAME_VIEW_ACTION_TYPE
      ) && (
        !action.hasOwnProperty('name') || !action.name
      )
    ) || (
      (action.type === PERSIST_NEW_FILTER_VIEW_ACTION_TYPE || action.type === MODIFY_FILTER_VIEW_ACTION_TYPE) &&
      (!action.hasOwnProperty('tagFilters') || !action.tagFilters)
    ) || (
      action.type !== NEW_SOURCE_ACTION_TYPE && (
        !action.hasOwnProperty('sourceIdKey') || !state.sourcesList.hasOwnProperty(action.sourceIdKey) || (
          (
            action.type === DELETE_VIEW_ACTION_TYPE || action.type === RENAME_VIEW_ACTION_TYPE ||
            action.type === MODIFY_FILTER_VIEW_ACTION_TYPE
          ) && (
            !validateFileIdKeyObj(action) || !state.viewsState.hasOwnProperty(action.sourceIdKey) ||
            !state.viewsState[action.sourceIdKey].sourceViews.hasOwnProperty(action.viewIdKey)
          )
        )
      )
    )
  ) { return state; }
  const newState = {
    sourcesList: {...state.sourcesList},
    nextNewSourceIdKey: state.nextNewSourceIdKey,
    viewsState: {...state.viewsState},
    numViews: state.numViews,
  };
  if (
    action.type === NEW_SOURCE_ACTION_TYPE || action.type === DELETE_SOURCE_ACTION_TYPE ||
    action.type === RENAME_SOURCE_ACTION_TYPE
  ) {
    if (action.type === NEW_SOURCE_ACTION_TYPE) {
      newState.sourcesList[newState.nextNewSourceIdKey] = { name: action.name };
      newState.nextNewSourceIdKey =
        calculateNextNewIdKey(newState.sourcesList, parseInt(newState.nextNewSourceIdKey));
    } else if (action.type === DELETE_SOURCE_ACTION_TYPE) {
      delete newState.sourcesList[action.sourceIdKey];
      if (newState.viewsState.hasOwnProperty(action.sourceIdKey)) { delete newState.viewsState[action.sourceIdKey]; }
      localStorage.removeItem(SOURCE_CONTENT_LOCAL_STORAGE_KEY_PREFIX + action.sourceIdKey);
      localStorage.removeItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + action.sourceIdKey);
    } else if (action.type === RENAME_SOURCE_ACTION_TYPE) {
      newState.sourcesList[action.sourceIdKey] = { name: action.name };
    }
    localStorage.setItem(SOURCES_LIST_LOCAL_STORAGE_KEY, JSON.stringify(newState.sourcesList));
  } else if (
    action.type === PERSIST_NEW_FILTER_VIEW_ACTION_TYPE || action.type === DELETE_VIEW_ACTION_TYPE ||
    action.type === RENAME_VIEW_ACTION_TYPE || action.type === MODIFY_FILTER_VIEW_ACTION_TYPE
  ) {
    const existsOtherSourceViews = newState.viewsState.hasOwnProperty(action.sourceIdKey);
    const sourceViewsState = {
      nextNewViewIdKey: existsOtherSourceViews
        ? newState.viewsState[action.sourceIdKey].nextNewViewIdKey : calculateNextNewIdKey({}, 0),
      sourceViews: {...(existsOtherSourceViews ? newState.viewsState[action.sourceIdKey].sourceViews : null)},
    }
    if (action.type === PERSIST_NEW_FILTER_VIEW_ACTION_TYPE) {
      sourceViewsState.sourceViews[sourceViewsState.nextNewViewIdKey] =
        { name: DEFAULT_VIEW_NAME_PREFIX, tagFilters: action.tagFilters };
      sourceViewsState.nextNewViewIdKey =
        calculateNextNewIdKey(sourceViewsState.sourceViews, parseInt(sourceViewsState.nextNewViewIdKey));
      newState.numViews += 1;
    } else if (action.type === DELETE_VIEW_ACTION_TYPE) {
      delete sourceViewsState.sourceViews[action.viewIdKey];
      newState.numViews -= 1;
    } else if (action.type === RENAME_VIEW_ACTION_TYPE) {
      sourceViewsState.sourceViews[action.viewIdKey] =
        { name: action.name, tagFilters: sourceViewsState.sourceViews[action.viewIdKey].tagFilters };
    } else if (action.type === MODIFY_FILTER_VIEW_ACTION_TYPE) {
      sourceViewsState.sourceViews[action.viewIdKey] =
        { name: sourceViewsState.sourceViews[action.viewIdKey].name, tagFilters: action.tagFilters };
    }
    if (action.type !== DELETE_VIEW_ACTION_TYPE || Object.keys(sourceViewsState.sourceViews).length > 0) {
      newState.viewsState[action.sourceIdKey] = sourceViewsState;
      localStorage.setItem(
        SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + action.sourceIdKey,
        JSON.stringify(sourceViewsState.sourceViews),
      );
    } else {
      delete newState.viewsState[action.sourceIdKey];
      localStorage.removeItem(SOURCE_VIEWS_LOCAL_STORAGE_KEY_PREFIX + action.sourceIdKey);
    }
  }
  return newState;
};
