import BaseStore from "./BaseStore";
import StoreResult from "./StoreResult";

export default class SyncStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.isAsync = false;
    setTimeout(() => {
      this.isReady = true;
      this.$emit("ready");
    }, 0);
  }
  keyValueGet() {
    throw new Error("please implement the keyValueGet method for this driver.");
  }
  keyValueSet() {
    throw new Error("please implement the keyValueSet method for this driver.");
  }
  existsKey() {
    throw new Error("please implement the existsKey method for this driver.");
  }
  get(key) {
    const valueObj = this.keyValueGet(key);
    if (valueObj) {
      // if expiredAt set
      if (valueObj.expiredAt) {
        // if not expired
        if (valueObj.expiredAt > Date.now()) {
          // if maxAge set
          if (valueObj.maxAge) {
            // refresh expiredAt
            valueObj.expiredAt = Date.now() + valueObj.maxAge;
            // update the expiredAt field and return value
            this.keyValueSet(key, valueObj);
            return valueObj.value;
          } else {
            return valueObj.value;
          }
        } else {
          // if expired return undefined and emit the event
          this.$emit("cacheExpired", key);
          return;
        }
      } else {
        return valueObj.value;
      }
    } else {
      return;
    }
  }
  set(key, value, options = {}) {
    const {
      // seconds -- Set the specified expire time, in milliseconds.
      expiredTime,
      // timestamp-seconds -- Set the specified Unix time at which the key will expire, in milliseconds.
      expiredTimeAt,
      // exists max age, in milliseconds.
      maxAge,
      // Only set the key if it does not already exist.
      setOnlyNotExist = false,
      // Only set the key if it already exist.
      setOnlyExist = false,
    } = options;
    let expiredAt;
    if (expiredTime && typeof expiredTime === "number" && expiredTime > 0) {
      expiredAt = Date.now() + expiredTime;
    }
    if (
      expiredTimeAt &&
      typeof expiredTimeAt === "number" &&
      expiredTimeAt > 0
    ) {
      expiredAt = expiredTimeAt;
    }
    if (expiredAt) {
      expiredAt = Math.max(expiredAt, Date.now());
    } else {
      if (maxAge && typeof maxAge === "number" && maxAge > 0) {
        expiredAt = Date.now() + maxAge;
      }
    }
    if (setOnlyNotExist || setOnlyExist) {
      const existsKey = this.existsKey(key);
      if (setOnlyNotExist && existsKey) {
        return StoreResult.NX_SET_NOT_PERFORMED;
      }
      if (setOnlyExist && !existsKey) {
        return StoreResult.XX_SET_NOT_PERFORMED;
      }
      this.keyValueSet(key, { value, expiredAt, maxAge });
      return StoreResult.OK;
    } else {
      this.keyValueSet(key, { value, expiredAt, maxAge });
      return StoreResult.OK;
    }
  }
}
