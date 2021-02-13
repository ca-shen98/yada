import { BACKEND_MODE_SIGNED_IN_STATUS } from "../reducers/BackendModeSignedInStatus";
import LocalFileStorageSystemClient from "./LocalFileStorageSystemClient";
import HostedFileStorageSystemClient from "./HostedFileStorageSystemClient";
import store from "../store";

const getFileStorageSystemClient = () =>
  store.getState().backendModeSignedInStatus ===
  BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE
    ? LocalFileStorageSystemClient
    : HostedFileStorageSystemClient;

const clientInterface = {
  doGetFilesList: () => {
    throw new Error("not implemented");
  },
  doSaveViewSpec: () => {
    throw new Error("not implemented");
  },
  doGetView: () => {
    throw new Error("not implemented");
  },
  doGetSourceTaggedBlocks: () => {
    throw new Error("not implemented");
  },
  doSaveSourceContent: () => {
    throw new Error("not implemented");
  },
  doGetSourceContent: () => {
    throw new Error("not implemented");
  },
  doSetSourceSavedTagFilters: () => {
    throw new Error("not implemented");
  },
  doGetSourceSavedTagFilters: () => {
    throw new Error("not implemented");
  },
  doDeleteView: () => {
    throw new Error("not implemented");
  },
  doDeleteSource: () => {
    throw new Error("not implemented");
  },
  doRenameView: () => {
    throw new Error("not implemented");
  },
  doRenameSource: () => {
    throw new Error("not implemented");
  },
};

export default Object.keys(clientInterface).reduce((partial, key) => {
  partial[key] = async (...args) => {
    const fileStorageSystemClient = getFileStorageSystemClient();
    return fileStorageSystemClient.hasOwnProperty(key)
      ? store.getState().backendModeSignedInStatus !==
        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
        ? await fileStorageSystemClient[key](...args)
        : null
      : clientInterface[key]();
  };
  return partial;
}, {});
