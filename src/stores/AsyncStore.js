import BaseStore from "./BaseStore";
import StoreResult from "./StoreResult";

export default class AsyncStore extends BaseStore {
  constructor(opts) {
    super(opts);
    this.isAsync = true;
  }
  keyValueGet() {
    return Promise.reject(
      new Error("please implement the keyValueGet method for this driver.")
    );
  }
  keyValueSet() {
    return Promise.reject(
      new Error("please implement the keyValueSet method for this driver.")
    );
  }
  existsKey() {
    return Promise.reject(
      new Error("please implement the existsKey method for this driver.")
    );
  }
  get(key) {
    return new Promise((resolve, reject) => {
      this.keyValueGet(key)
        .then((valueObj) => {
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
                  this.keyValueSet(key, valueObj)
                    .then(() => {
                      return resolve(valueObj.value);
                    })
                    .catch((e) => {
                      reject(e);
                    });
                } else {
                  resolve(valueObj.value);
                }
              } else {
                // if expired return undefined and emit the event
                this.$emit("cacheExpired", key);
                resolve();
              }
            } else {
              // not set the expiredAt then return the value directly
              resolve(valueObj.value);
            }
          } else {
            resolve();
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
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
    return new Promise((resolve, reject) => {
      if (setOnlyNotExist || setOnlyExist) {
        this.existsKey(key)
          .then((existsKey) => {
            if (setOnlyNotExist && existsKey) {
              return resolve(StoreResult.NX_SET_NOT_PERFORMED);
            }
            if (setOnlyExist && !existsKey) {
              return resolve(StoreResult.XX_SET_NOT_PERFORMED);
            }
            this.keyValueSet(key, { value, expiredAt, maxAge })
              .then(() => {
                return resolve(StoreResult.OK);
              })
              .catch((e) => {
                reject(e);
              });
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        this.keyValueSet(key, { value, expiredAt, maxAge })
          .then(() => {
            return resolve(StoreResult.OK);
          })
          .catch((e) => {
            reject(e);
          });
      }
    });
  }
}
