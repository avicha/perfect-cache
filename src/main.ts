/* eslint-disable @typescript-eslint/no-explicit-any */
import defaultOpts from './defaultOpts';
import EventListener from './EventListener';
import { getSupportedDriverList, getStoreClass } from './utils';
import type {
    CacheOptions,
    BaseStoreOptions,
    SetItemOptions,
    GetItemOptions,
    KeyFallbackConfig,
    KeyRegexFallbackConfig,
} from './types';
import { BaseStore } from './stores';
class PerfectCache<StoreOptions extends BaseStoreOptions, Store extends BaseStore<StoreOptions>> extends EventListener {
    // cache options
    opts: CacheOptions;
    // driver is init
    __init = false;
    // the driver string
    driver?: string;
    // the store object
    store?: Store;
    // the extra key and fallback config
    keyFallbacks: KeyFallbackConfig[] = [];
    // the key pattern and fallback config
    keyRegexFallbacks: KeyRegexFallbackConfig[] = [];
    /**
     *
     * @param {String} driver the driver string
     * @param {Object} opts the store options
     */
    constructor(driver?: CacheOptions);
    constructor(driver?: string, opts?: StoreOptions);
    constructor(driver?: string | CacheOptions, opts?: StoreOptions) {
        super();
        const supportedDriverList = getSupportedDriverList();
        let cacheOptions: CacheOptions;
        // driver and opts is null, then set the default opts
        if (!driver && !opts) {
            cacheOptions = { ...defaultOpts };
        } else {
            // driver is not null
            if (driver) {
                // driver is string and valid
                if (typeof driver === 'string' && supportedDriverList.includes(driver)) {
                    // opts is object config
                    if (Object.prototype.toString.call(opts) === '[object Object]') {
                        cacheOptions = { ...defaultOpts, driver, ...opts };
                    } else {
                        // opts is not object, then discard.
                        cacheOptions = { ...defaultOpts, driver };
                    }
                } else {
                    // driver is object opts
                    if (
                        typeof driver !== 'string' &&
                        Object.prototype.toString.call(driver) === '[object Object]' &&
                        supportedDriverList.includes(driver.driver)
                    ) {
                        cacheOptions = { ...defaultOpts, ...driver };
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
        if (cacheOptions && cacheOptions.driver) {
            this.opts = cacheOptions;
            this.initDriver();
        } else {
            throw new Error('please input the driver as first param.');
        }
    }
    /**
     * init the driver
     */
    initDriver() {
        const supportedDriverList = getSupportedDriverList();
        if (this.opts && this.opts.driver && supportedDriverList.includes(this.opts.driver)) {
            // init false
            this.__init = false;
            // get the store class
            const StoreClass: new (opts: StoreOptions) => Store = getStoreClass(this.opts.driver);
            // the store instance object
            this.store = new StoreClass(this.opts as unknown as StoreOptions);
            // the store like database maybe async,so listen the ready event to be ready
            this.store.$on('ready', () => {
                this.__init = true;
                this.driver = this.opts.driver;
                this.$emit('ready');
            });
            // if the cache expired,fire the cacheExpired event
            this.store.$on('cacheExpired', (key) => {
                this.$emit('cacheExpired', key);
            });
        }
    }
    /**
     *
     * @param {String} driver the driver string
     */
    setDriver(driver: string) {
        this.opts.driver = driver;
        this.initDriver();
    }
    /**
     * @param {String} key the cache key
     * @returns {Boolean}  is the key exists
     */
    existsKey(...args: [string]) {
        return this.store!.existsKey(...args);
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
    async getItem(key: string, opts: GetItemOptions = {}) {
        const { defaultVal, withFallback = true, refreshCache = true } = opts;
        // get the cache value
        const result = await this.store!.getItem(key);
        // is the result null
        const isResultInvalid = result === undefined || result === null;
        // if the result is invalid and use fallback function
        if (isResultInvalid && withFallback) {
            // get the fallback config
            const res = this.__getFallbackByKey(key);
            if (res) {
                // get the fallback result
                const fallbackResult = await res.fallback(key);
                // is fallback result invalid
                const isFallbackResultInvalid = fallbackResult === undefined || fallbackResult === null;
                // if need refresh cache, then set the fallback result as the cache value
                if (refreshCache && !isFallbackResultInvalid) {
                    await this.store!.setItem(key, fallbackResult, {
                        expiredTime: res.expiredTime,
                        maxAge: res.maxAge,
                    });
                }
                // return the default value or the fallback result
                return isFallbackResultInvalid && defaultVal !== undefined ? defaultVal : fallbackResult;
            } else {
                // have not the fallback config then return the default value or the origin result
                return defaultVal === undefined ? result : defaultVal;
            }
        } else {
            // if the result is valid or does not use fallback function,then return the default value or the origin result
            return isResultInvalid && defaultVal !== undefined ? defaultVal : result;
        }
    }
    /**
     * @param {String} key the cache key
     * @param {Object} value the cache value
     * @param {Object} options the cache options
     * @returns {StoreResult}
     */
    setItem(...args: [string, any, SetItemOptions?]) {
        return this.store!.setItem(...args);
    }
    /**
     * @param {String} key the cache key
     * @returns {Null}
     */
    removeItem(...args: [string]) {
        return this.store!.removeItem(...args);
    }
    /**
     * @returns {Null}
     */
    clear() {
        return this.store!.clear();
    }
    /**
     * @returns {Array} the cache keys
     */
    keys() {
        return this.store!.keys();
    }
    /**
     * @returns {Number} the cache keys count
     */
    length() {
        return this.store!.length();
    }
    /**
     * @returns {Array} the cache values
     */
    async getItemList(keys?: string[] | RegExp, opts?: GetItemOptions) {
        let storeKeys: string[] = [];
        const itemListMap: { [key: string]: any } = {};
        if (Array.isArray(keys)) {
            storeKeys = keys;
        } else {
            if (keys instanceof RegExp) {
                storeKeys = (await this.keys()).filter((key) => {
                    return keys.test(key);
                });
            } else {
                storeKeys = [];
            }
        }
        for (const key of storeKeys) {
            const item = await this.getItem(key, opts);
            itemListMap[key] = item;
        }
        return itemListMap;
    }
    /**
     * @returns {Null}
     */
    async removeItemList(keys?: string[] | RegExp) {
        let storeKeys: string[] = [];
        if (Array.isArray(keys)) {
            storeKeys = keys;
        } else {
            if (keys instanceof RegExp) {
                storeKeys = (await this.keys()).filter((key) => {
                    return keys.test(key);
                });
            } else {
                storeKeys = [];
            }
        }
        for (const key of storeKeys) {
            await this.removeItem(key);
        }
        return void 0;
    }
    /**
     *
     * @param {String/Regex} key the extra key or the key pattern
     * @param {Function} fallback the fallback function when the key is not exists
     * @param {Object} options the setItem operation options when the cache is updated
     * @returns
     */
    fallbackKey(
        key: string | RegExp,
        fallback: KeyFallbackConfig['fallback'],
        options: { expiredTime?: number; maxAge?: number } = {}
    ) {
        const { expiredTime, maxAge } = options;
        //the extra key
        if (typeof key === 'string') {
            if (fallback instanceof Function) {
                return this.keyFallbacks.push({ key, expiredTime, maxAge, fallback });
            } else {
                throw new Error('please input the fallback as type [Function]');
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
                throw new Error('please input the fallback as type [Function]');
            }
        }
    }
    /**
     *
     * @param {String} key the cache key
     * @returns {Object} the fallback config object if exists, undefined otherwise.
     */
    __getFallbackByKey(key: string): KeyFallbackConfig | KeyRegexFallbackConfig | undefined {
        let res: KeyFallbackConfig | KeyRegexFallbackConfig | undefined;
        // find the exact key matches the config first
        res = this.keyFallbacks.find((obj) => {
            return obj.key === key;
        });
        // if found the config then return
        if (res) {
            return res;
        } else {
            // else find the regex key matches and return
            res = this.keyRegexFallbacks.find((obj) => {
                return obj.regex.test(key);
            });
            // return the found fallback config and undefined otherwise
            return res;
        }
    }
}
export default PerfectCache;
