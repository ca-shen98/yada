import Actions from '../actions';
import {parse as parseTagFilters} from '../lib/TagFilters';

export const INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY = 'initialTagFilters';
export const initialTagFiltersText =
  localStorage.getItem(INITIAL_TAG_FILTERS_LOCAL_STORAGE_KEY) || '';
export const initialTagFiltersExpr = parseTagFilters(initialTagFiltersText);

export const SetTagFiltersReducer = (
  state = { text: initialTagFiltersText, expr: initialTagFiltersExpr },
  action,
) => {
  if (action.type !== Actions.SET_TAG_FILTERS_TYPE) { return state; }
  return action.tagFilters;
};
