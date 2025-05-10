import BaseStore from './BaseStore';
import LocalStorageStore from './LocalStorageStore';
import MemoryStore from './MemoryStore';
import SessionStorageStore from './SessionStorageStore';
import CookieStore from './CookieStore';
import IndexedDBStore from './IndexedDBStore';
import { StoreResult } from './enum';
import type { BaseStoreOptions } from '../types';

const systemStores: {
    memory?: typeof MemoryStore;
    localStorage?: typeof LocalStorageStore;
    sessionStorage?: typeof SessionStorageStore;
    cookie?: typeof CookieStore;
    indexedDB?: typeof IndexedDBStore;
} = {};
for (const store of [MemoryStore, LocalStorageStore, SessionStorageStore, CookieStore, IndexedDBStore]) {
    Object.assign(systemStores, { [store.driver]: store });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const externalStores: { [key: string]: any } = {};
function registerStore<StoreOptions extends BaseStoreOptions, T extends { driver: string }>(
    store: T & { new (opts: StoreOptions): BaseStore<StoreOptions> }
) {
    if (store instanceof BaseStore.constructor) {
        if (store.driver && typeof store.driver === 'string') {
            externalStores[store.driver] = store;
        } else {
            throw new Error('please input the driver name.');
        }
    } else {
        throw new Error('the store driver class must be subclass of BaseStore.');
    }
}
export {
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
};
