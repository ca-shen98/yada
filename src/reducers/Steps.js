export const SET_STEPS_ACTION_TYPE = 'steps/set'
export const setStepsAction = steps => ({type: SET_STEPS_ACTION_TYPE, steps});
export const setStepsReducer = (state = false, action) =>
    action.type !== SET_STEPS_ACTION_TYPE 
        ? state : action.steps;

export const SET_STEPS_NAVIGATOR_ACTION_TYPE = 'stepsNavigator/set'
export const setStepsNavigatorAction = stepsNavigator => ({type: SET_STEPS_NAVIGATOR_ACTION_TYPE, stepsNavigator});
export const setStepsNavigatorReducer = (state = false, action) =>
    action.type !== SET_STEPS_NAVIGATOR_ACTION_TYPE 
        ? state : action.stepsNavigator;