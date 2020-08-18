import Actions from '../actions';

export const DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY = 'docsList';
export const DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_source_';
export const DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX = 'doc_views_';
export const INITIAL_FILE_LOCAL_STORAGE_KEY = 'initialFile';
export const DEFAULT_DOC_NAME_KEY = '_notes';
export const SOURCE_FILE_NAME_TYPE = '__source';
export const CUSTOM_VIEW_FILE_TYPE = '__custom';
export const FILTER_VIEW_FILE_TYPE = '__filter';

if (!localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY)) {
  localStorage.setItem(
    DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY,
    '{"doc":{"type":"doc","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a b c"}]},{"type":"paragraph","attrs":{"tags":{"a":"1"},"hidden":false},"content":[{"type":"text","text":"#{a} b c"}]},{"type":"bullet_list","attrs":{"tags":{"b":"1"},"hidden":false},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a #{b} c"}]},{"type":"bullet_list","attrs":{"tags":{"c":"1"},"hidden":false},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a b #{c} #{_view}"}]}]}]}]}]},{"type":"paragraph","attrs":{"tags":{"a":"2","b":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} #{b} c #{_view}"}]},{"type":"paragraph","attrs":{"tags":{"a":"3","c":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} b #{c}"}]},{"type":"paragraph","attrs":{"tags":{},"hidden":false}}]},' +
    '"tags":{"a":{"1":{"type":"paragraph","attrs":{"tags":{"a":"1"},"hidden":false},"content":[{"type":"text","text":"#{a} b c"}]},"2":{"type":"paragraph","attrs":{"tags":{"a":"2","b":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} #{b} c #{_view}"}]},"3":{"type":"paragraph","attrs":{"tags":{"a":"3","c":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} b #{c}"}]}},"b":{"1":{"type":"bullet_list","attrs":{"tags":{"b":"1"},"hidden":false},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a #{b} c"}]},{"type":"bullet_list","attrs":{"tags":{"c":"1"},"hidden":false},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a b #{c} #{_view}"}]}]}]}]}]},"2":{"type":"paragraph","attrs":{"tags":{"a":"2","b":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} #{b} c #{_view}"}]}},"c":{"1":{"type":"bullet_list","attrs":{"tags":{"c":"1"},"hidden":false},"content":[{"type":"list_item","content":[{"type":"paragraph","attrs":{"tags":{},"hidden":false},"content":[{"type":"text","text":"a b #{c} #{_view}"}]}]}]},"2":{"type":"paragraph","attrs":{"tags":{"a":"3","c":"2"},"hidden":false},"content":[{"type":"text","text":"#{a} b #{c}"}]}}}}'
  );
  localStorage.setItem(
    DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + DEFAULT_DOC_NAME_KEY,
    '{"__custom":{"_view":[{"tag":"a","id":"2"},{"tag":"c","id":"1"}]},"__filter":{"viewTagFilters":{},"tagFilterViews":{}}}'
  );
  const docNameKeysStr = localStorage.getItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY);
  const docNameKeys = docNameKeysStr ? JSON.parse(docNameKeysStr) : [];
  if (!docNameKeys.includes(DEFAULT_DOC_NAME_KEY)) {
    docNameKeys.push(DEFAULT_DOC_NAME_KEY);
    localStorage.setItem(DOC_NAME_KEYS_LIST_LOCAL_STORAGE_KEY, JSON.stringify(docNameKeys));
  }
}

const initialFileStr = localStorage.getItem(INITIAL_FILE_LOCAL_STORAGE_KEY);
const initialFile = initialFileStr ?
  JSON.parse(initialFileStr) :
  { docNameKey: DEFAULT_DOC_NAME_KEY, fileNameKey: SOURCE_FILE_NAME_TYPE, fileType: SOURCE_FILE_NAME_TYPE };

export const SetFileReducer = (state = initialFile, action) => {
  if (action.type !== Actions.SET_FILE_TYPE) return state;
  return action.file;
};
