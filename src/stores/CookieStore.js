import jsCookie from "js-cookie";
import BaseStore from "./BaseStore";

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
          window.console.debug(`get key ${key} json parse error`, valueStr);
          resolve();
        }
      } else {
        resolve();
      }
    });
  }
  keyValueSet(key, value) {
    jsCookie.set(this.__getRealKey(key), JSON.stringify(value));
    return Promise.resolve();
  }
  existsKey(key) {
    if (jsCookie.get(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}
