import defaultOpts from "./defaultOpts";
import EventListener from "./EventListener";
import { getSupportedDriverList, getStoreClass } from "./utils";

class PerfectCache extends EventListener {
  // cache options
  opts;
  // driver is init
  __init = false;
  // the driver string
  driver;
  // the store object
  store;
  // the extra key and fallback config
  keyFallbacks = [];
  // the key pattern and fallback config
  keyRegexFallbacks = [];
  /**
   *
   * @param {String} driver the driver string
   * @param {Object} opts the store options
   */
  constructor(driver, opts) {
    super();
    const supportedDriverList = getSupportedDriverList();
    // driver and opts is null, then set the default opts
    if (!driver && !opts) {
      opts = { ...defaultOpts };
    } else {
      // driver is not null
      if (driver) {
        // driver is string and valid
        if (supportedDriverList.includes(driver)) {
          // opts is object config
          if (Object.prototype.toString.call(opts) === "[object Object]") {
            opts = { ...defaultOpts, driver, ...opts };
          } else {
            // opts is not object, then discard.
            opts = { ...defaultOpts, driver };
          }
        } else {
          // driver is object opts
          if (
            Object.prototype.toString.call(driver) === "[object Object]" &&
            supportedDriverList.includes(driver.driver)
          ) {
            opts = { ...defaultOpts, ...driver };
          } else {
            // driver is invalid
            throw new Error(
              "please input the correct driver param as the first param or in the opts params."
            );
          }
        }
      } else {
        // driver is null and opts is not null
        throw new Error("please input the driver as first param.");
      }
    }
    if (opts && opts.driver) {
      this.opts = opts;
      this.initDriver();
    } else {
      throw new Error("please input the driver as first param.");
    }
  }
  /**
   * init the driver
   */
  initDriver() {
    const supportedDriverList = getSupportedDriverList();
    if (
      this.opts &&
      this.opts.driver &&
      supportedDriverList.includes(this.opts.driver)
    ) {
      // init false
      this.__init = false;
      // get the store class
      const StoreClass = getStoreClass(this.opts.driver);
      // the store instance object
      this.store = new StoreClass(this.opts);
      // the store like database maybe async,so listen the ready event to be ready
      this.store.$on("ready", () => {
        this.__init = true;
        this.driver = this.opts.driver;
        this.$emit("ready");
      });
      // if the cache expired,fire the cacheExpired event
      this.store.$on("cacheExpired", (key) => {
        this.$emit("cacheExpired", key);
      });
    }
  }
  /**
   *
   * @param {String} driver the driver string
   */
  setDriver(driver) {
    this.opts.driver = driver;
    this.initDriver();
  }
  /**
   * @param {String} key the cache key
   * @returns {Boolean}  is the key exists
   */
  existsKey() {
    return this.store.existsKey.apply(this.store, arguments);
  }
  /**
   *
   * @param {String} key the cache key
   * @param {Object} opts the options
   * @param {Object} opts.defaultVal default value if not get it
   * @param {Boolean} opts.withFallback if use fallback when does not get the cache value
   * @param {Boolean} opts.refreshCache if refresh the cache result when use the fallback
   * @returns
   */
  getItem(key, opts = {}) {
    const { defaultVal, withFallback = true, refreshCache = true } = opts;
    return new Promise(async (resolve, reject) => {
      // get the cache value
      const result = await this.store.getItem(key);
      // is the result null
      const isResultInvalid =
        result === undefined || result === null || result === "";
      // if the result is invalid and use fallback function
      if (isResultInvalid && withFallback) {
        // get the fallback config
        const res = this.__getFallbackByKey(key);
        if (res) {
          // get the fallback result
          const fallbackResult = await res.fallback(key);
          // is fallback result invalid
          const isFallbackResultInvalid =
            fallbackResult === undefined ||
            fallbackResult === null ||
            fallbackResult === "";
          // if need refresh cache, then set the fallback result as the cache value
          if (refreshCache) {
            await this.store.setItem(key, fallbackResult, {
              expiredTime: res.expiredTime,
              maxAge: res.maxAge,
            });
          }
          // return the default value or the fallback result
          resolve(
            isFallbackResultInvalid && defaultVal !== undefined
              ? defaultVal
              : fallbackResult
          );
        } else {
          // have not the fallback config then return the default value or the origin result
          resolve(defaultVal === undefined ? result : defaultVal);
        }
      } else {
        // if the result is valid or does not use fallback function,then return the default value or the origin result
        resolve(
          isResultInvalid && defaultVal !== undefined ? defaultVal : result
        );
      }
    });
  }
  /**
   * @param {String} key the cache key
   * @param {Object} value the cache value
   * @param {Object} options the cache options
   * @returns {StoreResult}
   */
  setItem() {
    return this.store.setItem.apply(this.store, arguments);
  }
  /**
   *
   * @param {String/Regex} key the extra key or the key pattern
   * @param {Function} fallback the fallback function when the key is not exists
   * @param {Object} options the setItem operation options when the cache is updated
   * @returns
   */
  fallbackKey(key, fallback, options = {}) {
    const { expiredTime, maxAge } = options;
    //the extra key
    if (typeof key === "string") {
      if (fallback instanceof Function) {
        return this.keyFallbacks.push({ key, expiredTime, maxAge, fallback });
      } else {
        throw new Error("please input the fallback as type [Function]");
      }
    }
    // the key pattern
    if (key instanceof RegExp) {
      if (fallback instanceof Function) {
        return this.keyRegexFallbacks.push({
          regex: key,
          expiredTime,
          maxAge,
          fallback,
        });
      } else {
        throw new Error("please input the fallback as type [Function]");
      }
    }
  }
  /**
   *
   * @param {String} key the cache key
   * @returns {Object} the fallback config object if exists, undefined otherwise.
   */
  __getFallbackByKey(key) {
    // find the exact key matches the config first
    let fallback = this.keyFallbacks.find((obj) => {
      return obj.key === key && obj.fallback instanceof Function;
    });
    // if found the config then return
    if (fallback) {
      return fallback;
    } else {
      // else find the regex key matches and return
      fallback = this.keyRegexFallbacks.find((obj) => {
        return obj.regex.test(key) && obj.fallback instanceof Function;
      });
      // return the found fallback config and undefined otherwise
      return fallback;
    }
  }
}
export default PerfectCache;
