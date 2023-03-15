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
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (localStorage.getItem(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = [];
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
