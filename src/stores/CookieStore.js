import jsCookie from 'js-cookie';
import SyncStore from './SyncStore';

export default class CookieStore extends SyncStore {
  static driver = 'cookie';
  keyValueGet(key) {
    return jsCookie.get(key);
  }
  keyValueSet(key, value) {
    jsCookie.set(key, value);
  }
  existsKey(key) {
    if (jsCookie.get(key)) {
      return true;
    } else {
      return false;
    }
  }
}
