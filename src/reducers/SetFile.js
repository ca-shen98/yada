import Actions from '../actions';

export const DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY = 'docsList';
export const DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_source_';
export const DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_views_';
export const DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX = 'doc_tags_';
export const DEFAULT_DOC_NAME_KEY = '_notes';
export const SOURCE_FILE_NAME = '__source';
export const INITIAL_DOC_NAME_KEY_LOCAL_STORAGE_KEY = 'initialDocNameKey';
export const INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY = 'initialFileNameKey';

if (!localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY)) {
  localStorage.setItem(
    DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY,
    '{"type":"doc","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a b c"}]},{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"1"}},"content":[{"type":"text","text":"#{a} b c"}]},{"type":"bullet_list","attrs":{"hidden":false,"tags":{"b":"1"}},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a #{b} c"}]},{"type":"bullet_list","attrs":{"hidden":false,"tags":{"c":"1"}},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a b #{c}"}]}]}]}]}]},{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"2","b":"2"}},"content":[{"type":"text","text":"#{a} #{b} c"}]},{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"3","c":"2"}},"content":[{"type":"text","text":"#{a} b #{c}"}]},{"type":"paragraph","attrs":{"hidden":false,"tags":{}}}]}',
  );
  localStorage.setItem(
    DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY,
    '{"a":{"1":{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"1"}},"content":[{"type":"text","text":"#{a} b c"}]},"2":{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"2","b":"2"}},"content":[{"type":"text","text":"#{a} #{b} c"}]},"3":{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"3","c":"2"}},"content":[{"type":"text","text":"#{a} b #{c}"}]}},"b":{"1":{"type":"bullet_list","attrs":{"hidden":false,"tags":{"b":"1"}},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a #{b} c"}]},{"type":"bullet_list","attrs":{"hidden":false,"tags":{"c":"1"}},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a b #{c}"}]}]}]}]}]},"2":{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"2","b":"2"}},"content":[{"type":"text","text":"#{a} #{b} c"}]}},"c":{"1":{"type":"bullet_list","attrs":{"hidden":false,"tags":{"c":"1"}},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"hidden":false,"tags":{}},"content":[{"type":"text","text":"a b #{c}"}]}]}]},"2":{"type":"paragraph","attrs":{"hidden":false,"tags":{"a":"3","c":"2"}},"content":[{"type":"text","text":"#{a} b #{c}"}]}}}',
  )
  localStorage.setItem(
    DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY,
    '{"_view":[{"tag":"a","id":"2"},{"tag":"c","id":"1"}]}',
  );
  const docNameKeysStr = localStorage.getItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY);
  const docNameKeys = docNameKeysStr ? JSON.parse(docNameKeysStr) : [];
  if (!docNameKeys.includes(DEFAULT_DOC_NAME_KEY)) {
    docNameKeys.push(DEFAULT_DOC_NAME_KEY);
    localStorage.setItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(docNameKeys));
  }
}

export const SetFileReducer = (
  state = {
    docNameKey: localStorage.getItem(INITIAL_DOC_NAME_KEY_LOCAL_STORAGE_KEY) || DEFAULT_DOC_NAME_KEY,
    fileNameKey: localStorage.getItem(INITIAL_FILE_NAME_KEY_LOCAL_STORAGE_KEY) || SOURCE_FILE_NAME,
  },
  action,
) => {
  if (action.type !== Actions.SET_FILE_TYPE) return state;
  return action.file;
};
