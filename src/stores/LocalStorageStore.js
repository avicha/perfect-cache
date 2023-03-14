import BaseStore from "./BaseStore";

export default class LocalStorageStore extends BaseStore {
  static driver = "localStorage";
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = localStorage.getItem(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          window.console.debug(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    localStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
    return Promise.resolve();
  }
  existsKey(key) {
    if (localStorage.getItem(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}
