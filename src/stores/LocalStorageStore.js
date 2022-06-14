import SyncStore from './SyncStore';
export default class LocalStorageStore extends SyncStore {
  static driver = 'localStorage';
  keyValueGet(key) {
    return localStorage.getItem(key);
  }
  keyValueSet(key, value) {
    localStorage.setItem(key, value);
  }
  existsKey(key) {
    if (localStorage.getItem(key)) {
      return true;
    } else {
      return false;
    }
  }
}
