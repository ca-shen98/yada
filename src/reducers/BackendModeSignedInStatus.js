import axios from 'axios';
import Cookies from 'js-cookie';
import {SERVER_BASE_URL} from '../util/FetchWithTimeout';

export const BACKEND_MODE_SIGNED_IN_STATUS = {
  USER_SIGNED_IN: 'USER_SIGNED_IN',
  USER_SIGNED_OUT: 'USER_SIGNED_OUT',
  LOCAL_STORAGE: 'LOCAL_STORAGE',
}

export const ACCESS_TOKEN_COOKIE_KEY = 'access_token';

export const loginBackend = (name, email, token) => {
  return Promise.resolve(
    axios.post(
      SERVER_BASE_URL + "register_user",
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': `token=${token}` },
        body: JSON.stringify({ name, email, token })
      },
      { withCredentials: true },
    ).then(() => { return true; })
  );
};

export const INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY = 'initialLocalStorageBackendMode';

export const getUserSignedInStatus = () => Cookies.get(ACCESS_TOKEN_COOKIE_KEY)
  ? BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN : BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT;

const SET_BACKEND_MODE_SIGNED_IN_STATUS_ACTION_TYPE = 'backendModeSignedInStatus/set';
export const setBackendModeSignedInStatusAction =
  status => ({ type: SET_BACKEND_MODE_SIGNED_IN_STATUS_ACTION_TYPE, status });
export const backendModeSignedInStatusReducer = (
  state = !localStorage.getItem(INITIAL_LOCAL_STORAGE_BACKEND_MODE_LOCAL_STORAGE_KEY)
    ? getUserSignedInStatus() : BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE,
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
