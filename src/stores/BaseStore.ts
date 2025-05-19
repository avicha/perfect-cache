/* eslint-disable @typescript-eslint/no-explicit-any */
import EventListener from '../EventListener';
import { StoreResult } from './enum';
import type { BaseStoreOptions, StoreObject, GetItemOptions, SetItemOptions, SupportedDriver } from '../types';

export default abstract class BaseStore<StoreOption extends BaseStoreOptions> extends EventListener {
    static driver: SupportedDriver | string;
    opts: StoreOption;
    isReady = false;
    prefix = 'cache:';
    getItemList?(keys?: string[] | RegExp, opts?: GetItemOptions): Promise<{ [key: string]: any }>;
    removeItemList?(keys?: string[] | RegExp): Promise<void>;
    constructor(opts: StoreOption) {
        super();
        this.opts = opts;
        if (this.opts.prefix) {
            this.prefix = this.opts.prefix;
        }
        this.isReady = false;
    }
    protected __getRealKey(key: string) {
        return `${this.prefix}${key}`;
    }
    getReady() {
        this.isReady = true;
        this.$emit('ready');
    }
    init() {
        this.getReady();
        return this;
    }
    abstract keyValueGet(_key: string): Promise<StoreObject | undefined>;
    abstract keyValueSet(_key: string, _valueObj: StoreObject): Promise<void>;
    abstract existsKey(_key: string): Promise<boolean>;
    abstract removeItem(_key: string): Promise<void>;
    abstract keys(): Promise<string[]>;
    async clear(): Promise<void> {
        const keys = await this.keys();
        for (const key of keys) {
            await this.removeItem(key);
        }
        return Promise.resolve();
    }
    length(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.keys()
                .then((keys) => {
                    resolve(keys.length);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    getItem(key: string): Promise<any> {
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
                                this.$emit('cacheExpired', key);
                                resolve(undefined);
                            }
                        } else {
                            // not set the expiredAt then return the value directly
                            resolve(valueObj.value);
                        }
                    } else {
                        resolve(undefined);
                    }
                })
                .catch((e) => {
                    reject(e);
                });
        });
    }
    setItem(key: string, value: any, options: SetItemOptions = {}): Promise<symbol> {
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
        let localExpiredTimeAt: number | undefined, localMaxAge: number | undefined;
        if (expiredTime && typeof expiredTime === 'number' && expiredTime > 0) {
            localExpiredTimeAt = Date.now() + expiredTime;
        }
        if (expiredTimeAt && typeof expiredTimeAt === 'number' && expiredTimeAt > 0) {
            localExpiredTimeAt = expiredTimeAt;
        }
        if (localExpiredTimeAt) {
            localExpiredTimeAt = Math.max(localExpiredTimeAt, Date.now());
        } else {
            if (maxAge && typeof maxAge === 'number' && maxAge > 0) {
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
