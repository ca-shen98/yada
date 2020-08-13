import Actions from '../actions';

export const SetTagFiltersReducer = (state = { text: '', expr: null }, action) => {
  if (action.type !== Actions.SET_TAG_FILTERS_TYPE) { return state; }
  return action.tagFilters;
};
