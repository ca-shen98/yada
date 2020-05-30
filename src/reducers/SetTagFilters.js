import Actions from '../actions';
import {initialTagFiltersExpr} from "../containers/TagFilters";

export const SetTagFiltersReducer = (state = initialTagFiltersExpr, action) => {
  if (action.type !== Actions.SET_TAG_FILTERS_TYPE) return state;
  return action.tagFilters;
};
