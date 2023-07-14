import BaseStore from "./BaseStore";
import { cacheDebugger } from "../utils";

export default class SessionStorageStore extends BaseStore {
  static driver = "sessionStorage";
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = sessionStorage.getItem(this.__getRealKey(key));
    return new Promise((resolve) => {
      if (valueStr) {
        try {
          const valueObj = JSON.parse(valueStr);
          resolve(valueObj);
        } catch (error) {
          cacheDebugger(`get key ${key} json parse error`, valueStr);
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
        sessionStorage.setItem(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (sessionStorage.getItem(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        sessionStorage.removeItem(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = [];
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
