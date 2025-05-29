import PerfectCache from './main';
import EventListener from './EventListener';
import {
    systemStores,
    externalStores,
    BaseStore,
    LocalStorageStore,
    MemoryStore,
    SessionStorageStore,
    CookieStore,
    IndexedDBStore,
    StoreResult,
    registerStore,
} from './stores';
import {
    getSupportedDriverList,
    connectToIndexedDB,
    createDBAndObjectStores,
    cacheLogger,
    indexedDBLogger,
} from './utils';
import type {
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
} from './types';

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
export {
    PerfectCache,
    BaseStore,
    EventListener,
    systemStores,
    externalStores,
    LocalStorageStore,
    MemoryStore,
    SessionStorageStore,
    CookieStore,
    IndexedDBStore,
    StoreResult,
    registerStore,
    getSupportedDriverList,
    connectToIndexedDB,
    createDBAndObjectStores,
    cacheLogger,
    indexedDBLogger,
};
