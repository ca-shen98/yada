import Actions from '../actions';
import {parse as parseTagFilters} from '../Tagging/lib/TagFilteringExprGrammar';

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';

const initialTagFilters = {};
initialTagFilters['text'] = localStorage.getItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY) || '';
initialTagFilters['expr'] = parseTagFilters(initialTagFilters.text);

export const SetTagFiltersReducer = (state = initialTagFilters, action) => {
  if (action.type !== Actions.SET_TAG_FILTERS_TYPE) { return state; }
  return action.tagFilters;
};
