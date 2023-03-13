import SyncStore from "./SyncStore";
export default class SessionStorageStore extends SyncStore {
  static driver = "sessionStorage";
  keyValueGet(key) {
    const valueStr = sessionStorage.getItem(this.__getRealKey(key));
    if (valueStr) {
      try {
        const valueObj = JSON.parse(valueStr);
        return valueObj;
      } catch (error) {
        window.console.debug(`get key ${key} json parse error`, error);
        return;
      }
    }
  }
  keyValueSet(key, value) {
    sessionStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
  }
  existsKey(key) {
    if (sessionStorage.getItem(this.__getRealKey(key))) {
      return true;
    } else {
      return false;
    }
  }
}
