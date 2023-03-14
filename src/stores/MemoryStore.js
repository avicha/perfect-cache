import BaseStore from "./BaseStore";

export default class MemoryStore extends BaseStore {
  static driver = "memory";
  data = new Map();
  constructor(opts) {
    super(opts);
    this.ready();
  }
  keyValueGet(key) {
    const valueStr = this.data.get(this.__getRealKey(key));
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
    this.data.set(this.__getRealKey(key), JSON.stringify(value));
    return Promise.resolve();
  }
  existsKey(key) {
    if (this.data.has(this.__getRealKey(key))) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  }
}
