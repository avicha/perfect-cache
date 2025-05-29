import { describe, test, expect, vi } from 'vitest';
import { PerfectCache, IndexedDBStore, createDBAndObjectStores } from '../src';
import type { IndexedDBStoreOptions } from '../src/types';

describe('indexedDB connection should be correct', () => {
    const appCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
        driver: 'indexedDB',
        dbName: 'myapp',
        objectStoreName: 'app-cache',
        dbVersion: 2,
        prefix: 'app:',
        initStoreImmediately: false,
    });
    const appConnectToVersion = vi.spyOn(appCache.store!, 'connectToVersion');
    const appCreateDBAndObjectStore = vi.spyOn(appCache.store!, 'createDBAndObjectStore');
    const appConnectDB = vi.spyOn(appCache.store!, 'connectDB');
    const appCreateObjectStore = vi.spyOn(appCache.store!, 'createObjectStore');
    const appGetReady = vi.spyOn(appCache.store!, 'getReady');
    test('connection upgrade need when first create', async () => {
        appCache.init();
        await appCache.ready();
        expect(appConnectToVersion).toHaveBeenCalledExactlyOnceWith(2);
        expect(appConnectToVersion).toHaveResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledOnce();
        expect(appCreateDBAndObjectStore).toHaveResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledOnce();
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appCreateDBAndObjectStore);
        expect(appCreateObjectStore).toHaveBeenCalledOnce();
        expect(appCreateObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledOnce();
        expect(appGetReady).toHaveBeenCalledAfter(appCreateObjectStore);
    });
    test('connection trigger onversionchange when invalid state error', async () => {
        const dictCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
            driver: 'indexedDB',
            dbName: 'myapp',
            objectStoreName: 'dict-cache',
            dbVersion: 1,
            prefix: 'dict:',
            initStoreImmediately: false,
        });
        const dictConnectToVersion = vi.spyOn(dictCache.store!, 'connectToVersion');
        const dictCreateDBAndObjectStore = vi.spyOn(dictCache.store!, 'createDBAndObjectStore');
        const dictConnectDB = vi.spyOn(dictCache.store!, 'connectDB');
        const dictCreateObjectStore = vi.spyOn(dictCache.store!, 'createObjectStore');
        const dictGetReady = vi.spyOn(dictCache.store!, 'getReady');
        dictCache.init();
        await dictCache.ready();
        await appCache.ready();
        // 第一次按指定版本连接1
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(1, 1);
        // 因为最新版本是2，所以第二次按最新版本连接2
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(2);
        // 因为创建新的store，所以第三次按升级版本连接3
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(3, 3);
        // 所以init函数也会被触发三次
        expect(dictCreateDBAndObjectStore).toHaveBeenCalledTimes(3);
        expect(dictCreateDBAndObjectStore).toHaveBeenCalledAfter(dictConnectToVersion);
        // 连接数据库也会被触发三次
        expect(dictConnectDB).toHaveBeenCalledTimes(3);
        expect(dictConnectDB).toHaveBeenCalledAfter(dictCreateDBAndObjectStore);
        // 第一次连接db已经失败了，所以不会调用创建objectStore，所以被触发两次
        expect(dictCreateObjectStore).toHaveBeenCalledTimes(2);
        expect(dictCreateObjectStore).toHaveBeenCalledAfter(dictConnectDB);
        // 最后触发一次ready
        expect(dictGetReady).toHaveBeenCalledOnce();
        expect(dictGetReady).toHaveBeenCalledAfter(dictCreateObjectStore);
        // appConnection也会多次重新连接
        expect(appConnectToVersion).toHaveBeenNthCalledWith(1, 2);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(2, 3);
        expect(appConnectToVersion).toHaveLastResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledTimes(2);
        expect(appCreateDBAndObjectStore).toHaveLastResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledTimes(2);
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appCreateDBAndObjectStore);
        expect(appCreateObjectStore).toHaveBeenCalledTimes(2);
        expect(appCreateObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledTimes(2);
        expect(appGetReady).toHaveBeenCalledAfter(appCreateObjectStore);
    });
    test('connection not ready and set item ok', async () => {
        const addressCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
            driver: 'indexedDB',
            dbName: 'myapp',
            objectStoreName: 'address-cache',
            dbVersion: 1,
            prefix: 'address:',
            connectOptions: {
                timeout: 1000,
                interval: 100,
                readyLog: true,
            },
            initStoreImmediately: false,
        });
        const addressConnectToVersion = vi.spyOn(addressCache.store!, 'connectToVersion');
        const addressCreateDBAndObjectStore = vi.spyOn(addressCache.store!, 'createDBAndObjectStore');
        const addressConnectDB = vi.spyOn(addressCache.store!, 'connectDB');
        const addressCreateObjectStore = vi.spyOn(addressCache.store!, 'createObjectStore');
        const addressGetReady = vi.spyOn(addressCache.store!, 'getReady');
        const addressSetItem = vi.spyOn(addressCache.store!, 'setItem');
        addressCache.init();
        await addressCache.setItem('key', 'value');
        await appCache.ready();
        expect(addressSetItem).toHaveBeenCalledOnce();
        expect(addressSetItem).toHaveBeenCalledWith('key', 'value');
        // 第一次按指定版本连接1
        expect(addressConnectToVersion).toHaveBeenNthCalledWith(1, 1);
        // 因为最新版本是3，所以第二次按最新版本连接3
        expect(addressConnectToVersion).toHaveBeenNthCalledWith(2);
        // 因为创建新的store，所以第三次按升级版本连接3
        expect(addressConnectToVersion).toHaveBeenNthCalledWith(3, 4);
        // 所以init函数也会被触发三次
        expect(addressCreateDBAndObjectStore).toHaveBeenCalledTimes(3);
        expect(addressCreateDBAndObjectStore).toHaveBeenCalledAfter(addressConnectToVersion);
        // 连接数据库也会被触发三次
        expect(addressConnectDB).toHaveBeenCalledTimes(3);
        expect(addressConnectDB).toHaveBeenCalledAfter(addressCreateDBAndObjectStore);
        // 第一次连接db已经失败了，所以不会调用创建objectStore，所以被触发两次
        expect(addressCreateObjectStore).toHaveBeenCalledTimes(2);
        expect(addressCreateObjectStore).toHaveBeenCalledAfter(addressConnectDB);
        // 最后触发一次ready
        expect(addressGetReady).toHaveBeenCalledOnce();
        expect(addressGetReady).toHaveBeenCalledAfter(addressCreateObjectStore);
        // appConnection也会多次重新连接
        expect(appConnectToVersion).toHaveBeenNthCalledWith(1, 2);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(2, 3);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(3, 4);
        expect(appConnectToVersion).toHaveLastResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledTimes(3);
        expect(appCreateDBAndObjectStore).toHaveLastResolvedWith(appCache.store!);
        expect(appCreateDBAndObjectStore).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledTimes(3);
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appCreateDBAndObjectStore);
        expect(appCreateObjectStore).toHaveBeenCalledTimes(3);
        expect(appCreateObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledTimes(3);
        expect(appGetReady).toHaveBeenCalledAfter(appCreateObjectStore);
    });
    test('createDBAndObjectStores', async () => {
        const dbName = 'test-db';
        const objectStoreNames = ['store1', 'store2', 'store3'];
        const createOptions: IDBObjectStoreParameters = {
            keyPath: 'key',
        };
        const dbConnection1 = await createDBAndObjectStores(dbName, objectStoreNames, createOptions);
        expect(dbConnection1).toBeInstanceOf(IDBDatabase);
        expect(dbConnection1.name).toBe(dbName);
        expect(dbConnection1.objectStoreNames.length).toBe(objectStoreNames.length);
        for (const storeName of objectStoreNames) {
            expect(dbConnection1.objectStoreNames.contains(storeName)).toBe(true);
        }
        // store1不用重新初始化，直接ready
        const store1Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
            driver: 'indexedDB',
            dbName: dbName,
            objectStoreName: 'store1',
            dbConnection: dbConnection1,
            prefix: 'store1:',
            initStoreImmediately: false,
        });
        const store1ConnectToVersion = vi.spyOn(store1Cache.store!, 'connectToVersion');
        const store1CreateDBAndObjectStore = vi.spyOn(store1Cache.store!, 'createDBAndObjectStore');
        const store1ConnectDB = vi.spyOn(store1Cache.store!, 'connectDB');
        const store1CreateObjectStore = vi.spyOn(store1Cache.store!, 'createObjectStore');
        const store1GetReady = vi.spyOn(store1Cache.store!, 'getReady');
        store1Cache.init();
        await store1Cache.ready();
        expect(store1ConnectToVersion).toHaveBeenCalledTimes(1);
        expect(store1CreateDBAndObjectStore).toHaveBeenCalledTimes(1);
        expect(store1ConnectDB).toHaveBeenCalledTimes(1);
        expect(store1CreateObjectStore).toHaveBeenCalledTimes(1);
        expect(store1GetReady).toHaveBeenCalledTimes(1);
        // store2不用重新初始化，直接ready
        const store2Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
            driver: 'indexedDB',
            dbName: dbName,
            objectStoreName: 'store2',
            dbConnection: dbConnection1,
            prefix: 'store2:',
            initStoreImmediately: false,
        });
        const store2ConnectToVersion = vi.spyOn(store2Cache.store!, 'connectToVersion');
        const store2CreateDBAndObjectStore = vi.spyOn(store2Cache.store!, 'createDBAndObjectStore');
        const store2ConnectDB = vi.spyOn(store2Cache.store!, 'connectDB');
        const store2CreateObjectStore = vi.spyOn(store2Cache.store!, 'createObjectStore');
        const store2GetReady = vi.spyOn(store2Cache.store!, 'getReady');
        store2Cache.init();
        await store2Cache.ready();
        expect(store2ConnectToVersion).toHaveBeenCalledTimes(1);
        expect(store2CreateDBAndObjectStore).toHaveBeenCalledTimes(1);
        expect(store2ConnectDB).toHaveBeenCalledTimes(1);
        expect(store2CreateObjectStore).toHaveBeenCalledTimes(1);
        expect(store2GetReady).toHaveBeenCalledTimes(1);
        // store3不用重新初始化，直接ready
        const store3Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>({
            driver: 'indexedDB',
            dbName: dbName,
            objectStoreName: 'store3',
            dbConnection: dbConnection1,
            prefix: 'store3:',
            initStoreImmediately: false,
        });
        const store3ConnectToVersion = vi.spyOn(store3Cache.store!, 'connectToVersion');
        const store3CreateDBAndObjectStore = vi.spyOn(store3Cache.store!, 'createDBAndObjectStore');
        const store3ConnectDB = vi.spyOn(store3Cache.store!, 'connectDB');
        const store3CreateObjectStore = vi.spyOn(store3Cache.store!, 'createObjectStore');
        const store3GetReady = vi.spyOn(store3Cache.store!, 'getReady');
        store3Cache.init();
        await store3Cache.ready();
        expect(store3ConnectToVersion).toHaveBeenCalledTimes(1);
        expect(store3CreateDBAndObjectStore).toHaveBeenCalledTimes(1);
        expect(store3ConnectDB).toHaveBeenCalledTimes(1);
        expect(store3CreateObjectStore).toHaveBeenCalledTimes(1);
        expect(store3GetReady).toHaveBeenCalledTimes(1);
        objectStoreNames.push('store4');
        // 再次创建一个新的store4
        const dbConnection2 = await createDBAndObjectStores(dbName, objectStoreNames);
        expect(dbConnection2).toBeInstanceOf(IDBDatabase);
        expect(dbConnection2.name).toBe(dbName);
        expect(dbConnection2.objectStoreNames.length).toBe(objectStoreNames.length);
        for (const storeName of objectStoreNames) {
            expect(dbConnection2.objectStoreNames.contains(storeName)).toBe(true);
        }
    });
});
