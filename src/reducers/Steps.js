export const SET_TAG_MENU_OPENED_ACTION_TYPE = 'tagMenuOpened/set'
export const setTagMenuOpenedAction = tagMenuOpened => ({type: SET_TAG_MENU_OPENED_ACTION_TYPE, tagMenuOpened});
export const setTagMenuOpenedReducer = (state = false, action) =>
    action.type !== SET_TAG_MENU_OPENED_ACTION_TYPE 
        ? state : action.tagMenuOpened;

export const SET_NEW_USER_ACTION_TYPE = 'newUser/set'
export const setNewUserAction = newUser => ({type: SET_NEW_USER_ACTION_TYPE, newUser});
export const setNewUserReducer = (state = false, action) =>
    action.type !== SET_NEW_USER_ACTION_TYPE 
        ? state : action.newUser;