import SyncStore from "./SyncStore";
export default class LocalStorageStore extends SyncStore {
  static driver = "localStorage";
  keyValueGet(key) {
    const valueStr = localStorage.getItem(this.__getRealKey(key));
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
    localStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
  }
  existsKey(key) {
    if (localStorage.getItem(this.__getRealKey(key))) {
      return true;
    } else {
      return false;
    }
  }
}
