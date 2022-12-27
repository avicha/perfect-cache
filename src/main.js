import defaultOpts from './defaultOpts';
import EventListener from './EventListener';
import { getSupportedDriverList, getStoreClass } from './utils';

class BrowserCache extends EventListener {
  opts;
  __init = false;
  driver;
  store;
  keyFallbacks = [];
  keyRegexFallbacks = [];
  constructor(driver, opts) {
    super();
    const suportedDriverList = getSupportedDriverList();
    // driver and opts is null, then set the default opts
    if (!driver && !opts) {
      opts = { ...defaultOpts };
    } else {
      // driver is not null
      if (driver) {
        // driver is string and valid
        if (suportedDriverList.includes(driver)) {
          // opts is object config
          if (Object.prototype.toString.call(opts) === '[object Object]') {
            opts = { ...defaultOpts, driver, ...opts };
          } else {
            // opts is not object, then discard.
            opts = { ...defaultOpts, driver };
          }
        } else {
          // driver is object opts
          if (
            Object.prototype.toString.call(driver) === '[object Object]' &&
            suportedDriverList.includes(driver.driver)
          ) {
            opts = { ...defaultOpts, ...driver };
          } else {
            // driver is invalid
            throw new Error(
              'please input the correct driver param as the first param or in the opts params.'
            );
          }
        }
      } else {
        // driver is null and opts is not null
        throw new Error('please input the driver as first param.');
      }
    }
    if (opts && opts.driver) {
      this.opts = opts;
      this.initDriver();
    } else {
      throw new Error('please input the driver as first param.');
    }
  }
  initDriver() {
    const suportedDriverList = getSupportedDriverList();
    if (
      this.opts &&
      this.opts.driver &&
      suportedDriverList.includes(this.opts.driver)
    ) {
      this.__init = false;
      const StoreClass = getStoreClass(this.opts.driver);
      this.store = new StoreClass(this.opts);
      this.store.$on('ready', () => {
        this.__init = true;
        this.driver = this.opts.driver;
        this.$emit('ready');
      });
      this.store.$on('cacheExpired', (key) => {
        this.$emit('cacheExpired', key);
      });
    }
  }
  setDriver(driver) {
    this.opts.driver = driver;
    this.initDriver();
  }
  existsKey() {
    return this.store.existsKey.apply(this.store, arguments);
  }
  get() {
    return this.store.get.apply(this.store, arguments);
  }
  set() {
    return this.store.set.apply(this.store, arguments);
  }
  fallbackKey(key, expiredTime, fallback) {
    if (!fallback && expiredTime instanceof Function) {
      fallback = expiredTime;
      expiredTime = null;
    }
    if (typeof key === 'string') {
      if (
        fallback instanceof Function &&
        (!expiredTime || typeof expiredTime === 'number')
      ) {
        return this.keyFallbacks.push({ key, expiredTime, fallback });
      } else {
        throw new Error(
          'please input the expiredTime as type [number] and fallback as type [Function]'
        );
      }
    }
    if (key instanceof RegExp) {
      if (
        fallback instanceof Function &&
        (!expiredTime || typeof expiredTime === 'number')
      ) {
        return this.keyRegexFallbacks.push({
          regex: key,
          expiredTime,
          fallback,
        });
      } else {
        throw new Error(
          'please input the expiredTime as type [number] and fallback as type [Function]'
        );
      }
    }
  }
  __getFallbackByKey(key) {
    let fallback = this.keyFallbacks.find((obj) => {
      return obj.key === key && obj.fallback instanceof Function;
    });
    if (fallback) {
      return fallback;
    } else {
      fallback = this.keyRegexFallbacks.find((obj) => {
        return obj.regex.test(key) && obj.fallback instanceof Function;
      });
      return fallback;
    }
  }
  async getWithFallback(key) {
    let result = this.get(key);
    const isResultInvalid =
      result === undefined || result === null || isNaN(result) || result === '';
    if (isResultInvalid) {
      const res = this.__getFallbackByKey(key);
      if (res) {
        result = await res.fallback(key);
        await this.set(key, result, { expiredTime: res.expiredTime });
        return result;
      } else {
        return result;
      }
    } else {
      return result;
    }
  }
}
export default BrowserCache;
