/* eslint-disable @typescript-eslint/no-explicit-any */
type Awaitable<T> = T | Promise<T>;
type Events = { ready: void; cacheExpired: string };
type SupportedDriver = 'memory' | 'localStorage' | 'sessionStorage' | 'cookie' | 'indexedDB';
interface BaseStoreOptions {
    prefix?: string;
}
type CacheOptions = { driver: string; prefix?: string; [key: string]: any; initStoreImmediately?: boolean };
interface IndexedDBStoreOptions extends BaseStoreOptions {
    dbName?: string;
    objectStoreName?: string;
    dbVersion?: number;
    dbConnection?: IDBDatabase;
    connectOptions?: {
        interval?: number;
        timeout?: number;
        readyLog?: boolean;
    };
}
interface IndexedDBStoreObject {
    key: string;
    value: StoreObject;
}
interface StoreObject {
    value: any;
    expiredTimeAt?: number;
    maxAge?: number;
}
interface SetItemOptions {
    // seconds -- Set the specified expire time, in milliseconds.
    expiredTime?: number;
    // timestamp-seconds -- Set the specified Unix time at which the key will expire, in milliseconds.
    expiredTimeAt?: number;
    // exists max age, in milliseconds.
    maxAge?: number;
    // Only set the key if it does not already exist.
    setOnlyNotExist?: boolean;
    // Only set the key if it already exist.
    setOnlyExist?: boolean;
}
interface GetItemOptions {
    // If the key does not exist, return the default value.
    defaultVal?: any;
    // if use fallback when does not get the cache value.
    withFallback?: boolean;
    // if refresh the cache result when use the fallback.
    refreshCache?: boolean;
}
interface KeyFallbackConfig {
    key: string;
    expiredTime?: number;
    maxAge?: number;
    fallback: (key: string) => Awaitable<any>;
}
interface KeyRegexFallbackConfig {
    regex: RegExp;
    expiredTime?: number;
    maxAge?: number;
    fallback: (key: string) => Awaitable<any>;
}
export type {
    Events,
    SupportedDriver,
    BaseStoreOptions,
    CacheOptions,
    IndexedDBStoreOptions,
    IndexedDBStoreObject,
    StoreObject,
    SetItemOptions,
    GetItemOptions,
    KeyFallbackConfig,
    KeyRegexFallbackConfig,
};
