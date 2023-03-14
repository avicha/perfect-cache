import EventListener from "../EventListener";
import StoreResult from "./StoreResult";

export default class BaseStore extends EventListener {
  opts;
  isReady = false;
  prefix = "cache:";
  constructor(opts = {}) {
    super();
    this.opts = opts;
    if (this.opts.prefix) {
      this.prefix = this.opts.prefix;
    }
    this.isReady = false;
  }
  __getRealKey(key) {
    return `${this.prefix}${key}`;
  }
  ready() {
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
  getItem(key) {
    return new Promise((resolve, reject) => {
      this.keyValueGet(key)
        .then((valueObj) => {
          if (valueObj) {
            // if expiredAt set
            if (valueObj.expiredTimeAt) {
              // if not expired
              if (valueObj.expiredTimeAt > Date.now()) {
                // if maxAge set
                if (valueObj.maxAge) {
                  // refresh expiredAt
                  valueObj.expiredTimeAt = Date.now() + valueObj.maxAge;
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
  setItem(key, value, options = {}) {
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
    let localExpiredTimeAt, localMaxAge;
    if (expiredTime && typeof expiredTime === "number" && expiredTime > 0) {
      localExpiredTimeAt = Date.now() + expiredTime;
    }
    if (
      expiredTimeAt &&
      typeof expiredTimeAt === "number" &&
      expiredTimeAt > 0
    ) {
      localExpiredTimeAt = expiredTimeAt;
    }
    if (localExpiredTimeAt) {
      localExpiredTimeAt = Math.max(localExpiredTimeAt, Date.now());
    } else {
      if (maxAge && typeof maxAge === "number" && maxAge > 0) {
        localExpiredTimeAt = Date.now() + maxAge;
        localMaxAge = maxAge;
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
            this.keyValueSet(key, {
              value,
              expiredTimeAt: localExpiredTimeAt,
              maxAge: localMaxAge,
            })
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
        this.keyValueSet(key, {
          value,
          expiredTimeAt: localExpiredTimeAt,
          maxAge: localMaxAge,
        })
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
