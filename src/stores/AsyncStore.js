import BaseStore from './BaseStore';
import StoreResult from './StoreResult';

export default class AsyncStore extends BaseStore {
  constructor(opts) {
    super(opts);
  }
  keyValueGet() {
    return Promise.reject(
      new Error('please implement the keyValueGet method for this driver.')
    );
  }
  keyValueSet() {
    return Promise.reject(
      new Error('please implement the keyValueSet method for this driver.')
    );
  }
  existsKey() {
    return Promise.reject(
      new Error('please implement the existsKey method for this driver.')
    );
  }
  get(key, defaultVal) {
    return new Promise((resolve, reject) => {
      this.keyValueGet(key)
        .then((valueStr) => {
          if (valueStr) {
            try {
              const valueObj = JSON.parse(valueStr);
              if (valueObj.expiredAt) {
                if (valueObj.expiredAt > Date.now()) {
                  resolve(
                    valueObj.value === undefined ? defaultVal : valueObj.value
                  );
                } else {
                  this.$emit('cacheExpired', key);
                  resolve(defaultVal);
                }
              } else {
                resolve(
                  valueObj.value === undefined ? defaultVal : valueObj.value
                );
              }
            } catch (error) {
              window.console.debug('get key json parse error', error);
              resolve(defaultVal);
            }
          } else {
            resolve(defaultVal);
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
            this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }))
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
        this.keyValueSet(key, JSON.stringify({ value, expiredAt, maxAge }))
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
