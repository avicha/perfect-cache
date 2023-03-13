import SyncStore from "./SyncStore";
export default class MemoryStore extends SyncStore {
  static driver = "memory";
  data = new Map();
  keyValueGet(key) {
    const valueStr = this.data.get(this.__getRealKey(key));
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
    this.data.set(this.__getRealKey(key), JSON.stringify(value));
  }
  existsKey(key) {
    if (this.data.has(this.__getRealKey(key))) {
      return true;
    } else {
      return false;
    }
  }
}
