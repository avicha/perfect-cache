import BaseStore from './BaseStore';
import StoreResult from './StoreResult';

export default class SyncStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.isReady = true;
    this.$emit('ready');
  }
  keyValueGet() {
    throw new Error('please implement the keyValueGet method for this driver.');
  }
  keyValueSet() {
    throw new Error('please implement the keyValueSet method for this driver.');
  }
  existsKey() {
    throw new Error('please implement the existsKey method for this driver.');
  }
  get(key, defaultVal) {
    const valueStr = this.keyValueGet(key);
    if (valueStr) {
      try {
        const valueObj = JSON.parse(valueStr);
        if (valueObj.expiredAt) {
          if (valueObj.expiredAt > Date.now()) {
            return valueObj.value === undefined ? defaultVal : valueObj.value;
          } else {
            this.$emit('cacheExpired', key);
            return defaultVal;
          }
        } else {
          return valueObj.value === undefined ? defaultVal : valueObj.value;
        }
      } catch (error) {
        window.console.debug('get key json parse error', error);
        return defaultVal;
      }
    } else {
      return defaultVal;
    }
  }
  set(key, value, options = {}) {
    const {
      // seconds -- Set the specified expire time, in milliseconds.
      expiredTime,
      // timestamp-seconds -- Set the specified Unix time at which the key will expire, in milliseconds.
      expiredTimeAt,
      // Only set the key if it does not already exist.
      setOnlyNotExist = false,
      // Only set the key if it already exist.
      setOnlyExist = false,
    } = options;
    let expiredAt, maxAge;
    if (expiredTime && typeof expiredTime === 'number' && expiredTime > 0) {
      expiredAt = Date.now() + expiredTime;
    }
    if (
      expiredTimeAt &&
      typeof expiredTimeAt === 'number' &&
      expiredTimeAt > 0
    ) {
      expiredAt = expiredTimeAt;
    }
    if (expiredAt) {
      maxAge = Math.max(expiredAt - Date.now(), 0);
    }
    if (setOnlyNotExist || setOnlyExist) {
      const existsKey = this.existsKey(key);
      if (setOnlyNotExist && existsKey) {
        return StoreResult.NX_SET_NOT_PERFORMED;
      }
      if (setOnlyExist && !existsKey) {
        return StoreResult.XX_SET_NOT_PERFORMED;
      }
      this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }));
      return StoreResult.OK;
    } else {
      this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }));
      return StoreResult.OK;
    }
  }
}
