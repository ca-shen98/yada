import Actions from '../actions';

export const SetSelectNodeReducer = (state = null, action) => {
  if (action.type !== Actions.SET_SELECT_NODE_TYPE) { return state; }
  return action.selectNode;
};
