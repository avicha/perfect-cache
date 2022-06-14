import BaseStore from './BaseStore';
import StoreResult from './StoreResult';

export default class SyncStore extends BaseStore {
  keyValueGet() {
    throw new Error('please implement the keyValueGet method for this driver.');
  }
  keyValueSet() {
    throw new Error('please implement the keyValueSet method for this driver.');
  }
  existsKey() {
    throw new Error('please implement the existsKey method for this driver.');
  }
  get(key) {
    const valueStr = this.keyValueGet(key);
    if (valueStr) {
      try {
        const valueObj = JSON.parse(valueStr);
        if (valueObj.expiredAt) {
          if (valueObj.expiredAt > Date.now()) {
            return valueObj.value;
          } else {
            this.$emit('cacheExpired', key);
            return undefined;
          }
        } else {
          return valueObj.value;
        }
      } catch (error) {
        window.console.debug('get key json parse error', error);
        return undefined;
      }
    }
  }
  set(key, value, options = {}) {
    const {
      // seconds -- Set the specified expire time, in seconds.
      EX,
      // milliseconds -- Set the specified expire time, in milliseconds.
      PX,
      // timestamp-seconds -- Set the specified Unix time at which the key will expire, in seconds.
      EXAT,
      // timestamp-milliseconds -- Set the specified Unix time at which the key will expire, in milliseconds.
      PXAT,
      // Only set the key if it does not already exist.
      NX = false,
      // Only set the key if it already exist.
      XX = false,
      // Return the old string stored at key, or nil if key did not exist. An error is returned and SET aborted if the value stored at key is not a string.
      GET = false,
    } = options;
    let expiredAt, maxAge;
    if (EX && typeof EX === 'number' && EX > 0) {
      expiredAt = Date.now() + EX * 1000;
    }
    if (PX && typeof PX === 'number' && PX > 0) {
      expiredAt = Date.now() + PX;
    }
    if (EXAT && typeof EXAT === 'number' && EXAT > 0) {
      expiredAt = EXAT * 1000;
    }
    if (PXAT && typeof PXAT === 'number' && PXAT > 0) {
      expiredAt = PXAT;
    }
    if (expiredAt) {
      maxAge = Math.max(expiredAt - Date.now(), 0);
    }
    if (NX || XX || GET) {
      const oldValue = this.get(key);
      const existsKey = this.existsKey(key);
      if (NX && existsKey) {
        if (GET) {
          return oldValue;
        } else {
          return StoreResult.NX_SET_NOT_PERFORMED;
        }
      }
      if (XX && !existsKey) {
        if (GET) {
          return oldValue;
        } else {
          return StoreResult.XX_SET_NOT_PERFORMED;
        }
      }
      this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }));
      if (GET) {
        return oldValue;
      } else {
        return StoreResult.OK;
      }
    } else {
      this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }));
      return StoreResult.OK;
    }
  }
}
