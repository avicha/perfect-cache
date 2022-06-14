import SyncStore from './SyncStore';
export default class SessionStorageStore extends SyncStore {
  static driver = 'sessionStorage';
  keyValueGet(key) {
    return sessionStorage.getItem(key);
  }
  keyValueSet(key, value) {
    sessionStorage.setItem(key, value);
  }
  existsKey(key) {
    if (sessionStorage.getItem(key)) {
      return true;
    } else {
      return false;
    }
  }
}
