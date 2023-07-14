import jsCookie from "js-cookie";
import BaseStore from "./BaseStore";
import { cacheDebugger } from "../utils";

export default class CookieStore extends BaseStore {
  static driver = "cookie";
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = jsCookie.get(this.__getRealKey(key));
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
        jsCookie.set(this.__getRealKey(key), JSON.stringify(value));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  existsKey(key) {
    if (jsCookie.get(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        jsCookie.remove(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const cookies = jsCookie.get();
    const keys = [];
    for (const key of Object.keys(cookies)) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ""));
      }
    }
    return Promise.resolve(keys);
  }
}
