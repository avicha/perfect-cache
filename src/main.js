import defaultOpts from "./defaultOpts";
import EventListener from "./EventListener";
import { getSupportedDriverList, getStoreClass } from "./utils";

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
            suportedDriverList.includes(driver.driver)
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
      this.store.$on("ready", () => {
        this.__init = true;
        this.driver = this.opts.driver;
        this.$emit("ready");
      });
      this.store.$on("cacheExpired", (key) => {
        this.$emit("cacheExpired", key);
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
  async get(key, opts = {}) {
    const { defaultVal, withFallback = true, refreshCache = true } = opts;
    const result = await this.get(key);
    const isResultInvalid =
      result === undefined || result === null || isNaN(result) || result === "";
    if (isResultInvalid && withFallback) {
      const res = this.__getFallbackByKey(key);
      if (res) {
        const fallbackResult = await res.fallback(key);
        const isFallbackResultInvalid =
          fallbackResult === undefined ||
          fallbackResult === null ||
          isNaN(fallbackResult) ||
          fallbackResult === "";
        if (refreshCache) {
          await this.set(key, fallbackResult, { expiredTime: res.expiredTime });
        }
        return isFallbackResultInvalid && defaultVal !== undefined
          ? defaultVal
          : fallbackResult;
      } else {
        return defaultVal === undefined ? result : defaultVal;
      }
    } else {
      return isResultInvalid && defaultVal !== undefined ? defaultVal : result;
    }
  }
  set() {
    return this.store.set.apply(this.store, arguments);
  }
  fallbackKey(key, expiredTime, fallback) {
    if (!fallback && expiredTime instanceof Function) {
      fallback = expiredTime;
      expiredTime = null;
    }
    if (typeof key === "string") {
      if (
        fallback instanceof Function &&
        (!expiredTime || typeof expiredTime === "number")
      ) {
        return this.keyFallbacks.push({ key, expiredTime, fallback });
      } else {
        throw new Error(
          "please input the expiredTime as type [number] and fallback as type [Function]"
        );
      }
    }
    if (key instanceof RegExp) {
      if (
        fallback instanceof Function &&
        (!expiredTime || typeof expiredTime === "number")
      ) {
        return this.keyRegexFallbacks.push({
          regex: key,
          expiredTime,
          fallback,
        });
      } else {
        throw new Error(
          "please input the expiredTime as type [number] and fallback as type [Function]"
        );
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
export default BrowserCache;
