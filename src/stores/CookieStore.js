import jsCookie from "js-cookie";
import SyncStore from "./SyncStore";

export default class CookieStore extends SyncStore {
  static driver = "cookie";
  keyValueGet(key) {
    const valueStr = jsCookie.get(this.__getRealKey(key));
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
    jsCookie.set(this.__getRealKey(key), JSON.stringify(value));
  }
  existsKey(key) {
    if (jsCookie.get(this.__getRealKey(key))) {
      return true;
    } else {
      return false;
    }
  }
}
