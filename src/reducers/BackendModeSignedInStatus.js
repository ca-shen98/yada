import Cookies from 'js-cookie';
import {fetchWithTimeout} from '../util/FetchWithTimeout';

export const SERVER_BASE_URL = process.env.NODE_ENV === 'development'
  ? "http://localhost:5000/" : "http://3.96.155.30:8080/";

export const BACKEND_MODE_SIGNED_IN_STATUS = {
  USER_SIGNED_IN: 'USER_SIGNED_IN',
  USER_SIGNED_OUT: 'USER_SIGNED_OUT',
  LOCAL_STORAGE: 'LOCAL_STORAGE',
}

export const ACCESS_TOKEN_COOKIE_KEY = 'access_token';

export const getUserSignedInStatus = async () => {
  const token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
  if (token) {
    try {
      const { ok } = await fetchWithTimeout(
        SERVER_BASE_URL + `auth`,
        { headers: new Headers({ 'Set-Cookie': `token=${token}` }) },
      );
      if (ok) { return BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN; }
    } catch (e) { console.log(e); }
  }
  return BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT;
};

export const INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY = 'initialLocalStorageBackendMode';

const SET_BACKEND_MODE_SIGNED_IN_STATUS_ACTION_TYPE = 'backendModeSignedInStatus/set';
export const setBackendModeSignedInStatusAction =
  status => ({ type: SET_BACKEND_MODE_SIGNED_IN_STATUS_ACTION_TYPE, status });
export const backendModeSignedInStatusReducer = (
  state = localStorage.getItem(INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY)
    ? BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE : BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT,
  action,
) => {
  if (
    action.type !== SET_BACKEND_MODE_SIGNED_IN_STATUS_ACTION_TYPE || !action.hasOwnProperty('status') ||
    !BACKEND_MODE_SIGNED_IN_STATUS.hasOwnProperty(action.status)
  ) { return state; }
  if (action.status === BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
    localStorage.setItem(INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY, true);
  } else { localStorage.removeItem(INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY); }
  return action.status;
};
