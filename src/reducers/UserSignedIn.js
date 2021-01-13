import Cookies from 'js-cookie';

export const ACCESS_TOKEN_COOKIE_KEY = 'access_token';

export const SET_USER_SIGNED_IN_ACTION_TYPE = 'userSignedIn/set';
export const setUserSignedInAction = status => ({ type: SET_USER_SIGNED_IN_ACTION_TYPE, status });
export const userSignedInReducer = (state = !(!Cookies.get(ACCESS_TOKEN_COOKIE_KEY)), action) =>
  action.type !== SET_USER_SIGNED_IN_ACTION_TYPE || !action.hasOwnProperty('status') ? state : action.status;
  