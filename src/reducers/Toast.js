export const SET_TOAST_ACTION_TYPE = "toast/set";
export const setToastAction = (toast) => ({
  type: SET_TOAST_ACTION_TYPE,
  toast,
});

export const TOAST_DURATION_MS = 5000;
export const TOAST_CLEAR = "clear";
export const TOAST_SEVERITY = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "success",
};
const DEFAULT_STATE = {
  message: "",
  severity: TOAST_SEVERITY.INFO,
  open: false,
};

export const setToastReducer = (state = DEFAULT_STATE, action) =>
  action.type !== SET_TOAST_ACTION_TYPE || !action.hasOwnProperty("toast")
    ? state
    : action === TOAST_CLEAR
    ? DEFAULT_STATE
    : action.toast;
