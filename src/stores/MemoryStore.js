import BaseStore from "./BaseStore";
import { cacheDebugger } from "../utils";

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
          cacheDebugger(`get key ${key} json parse error`, valueStr);
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
  removeItem(key) {
    return new Promise((resolve, reject) => {
      try {
        this.data.delete(this.__getRealKey(key));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  keys() {
    const keys = Array.from(this.data.keys()).map((key) =>
      key.replace(this.prefix, "")
    );
    return Promise.resolve(keys);
  }
  clear() {
    this.data.clear();
    return Promise.resolve();
  }
  length() {
    return Promise.resolve(this.data.size);
  }
}
