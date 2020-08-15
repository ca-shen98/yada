import Actions from '../actions';

export const INITIAL_TAGS_IN_VIEW_LOCAL_STORAGE_KEY = 'initialTagsInView';

const initialTagsInView = JSON.parse(localStorage.getItem(INITIAL_TAGS_IN_VIEW_LOCAL_STORAGE_KEY)) || []

export const SetTagsInViewReducer = (
	state = initialTagsInView,
	action,
) => {
	if (action.type !== Actions.SET_TAGS_IN_VIEW) { return state; }
	return action.tagsInView;
};
