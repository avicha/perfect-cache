import { describe, test, expect, vi } from 'vitest';
import { PerfectCache, IndexedDBStore, createDBAndObjectStores } from '../src';
import type { IndexedDBStoreOptions } from '../src/types';

describe('indexedDB connection should be correct', () => {
    const appCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
        dbName: 'myapp',
        objectStoreName: 'app-cache',
        dbVersion: 2,
        prefix: 'app:',
    });
    const appConnectToVersion = vi.spyOn(appCache.store!, 'connectToVersion');
    const appInit = vi.spyOn(appCache.store!, 'init');
    const appConnectDB = vi.spyOn(appCache.store!, 'connectDB');
    const appInitObjectStore = vi.spyOn(appCache.store!, 'initObjectStore');
    const appGetReady = vi.spyOn(appCache.store!, 'getReady');
    test('connection upgrade need when first create', async () => {
        await appCache.ready();
        expect(appConnectToVersion).toHaveBeenCalledExactlyOnceWith(2);
        expect(appConnectToVersion).toHaveResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledOnce();
        expect(appInit).toHaveResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledOnce();
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appInit);
        expect(appInitObjectStore).toHaveBeenCalledOnce();
        expect(appInitObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledOnce();
        expect(appGetReady).toHaveBeenCalledAfter(appInitObjectStore);
    });
    test('connection trigger onversionchange when invalid state error', async () => {
        const dictCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: 'myapp',
            objectStoreName: 'dict-cache',
            dbVersion: 1,
            prefix: 'dict:',
        });
        const dictConnectToVersion = vi.spyOn(dictCache.store!, 'connectToVersion');
        const dictInit = vi.spyOn(dictCache.store!, 'init');
        const dictConnectDB = vi.spyOn(dictCache.store!, 'connectDB');
        const dictInitObjectStore = vi.spyOn(dictCache.store!, 'initObjectStore');
        const dictGetReady = vi.spyOn(dictCache.store!, 'getReady');
        await dictCache.ready();
        await appCache.ready();
        // 第一次按指定版本连接1
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(1, 1);
        // 因为最新版本是2，所以第二次按最新版本连接2
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(2);
        // 因为创建新的store，所以第三次按升级版本连接3
        expect(dictConnectToVersion).toHaveBeenNthCalledWith(3, 3);
        // 所以init函数也会被触发三次
        expect(dictInit).toHaveBeenCalledTimes(3);
        expect(dictInit).toHaveBeenCalledAfter(dictConnectToVersion);
        // 连接数据库也会被触发三次
        expect(dictConnectDB).toHaveBeenCalledTimes(3);
        expect(dictConnectDB).toHaveBeenCalledAfter(dictInit);
        // 第一次连接db已经失败了，所以不会调用创建objectStore，所以被触发两次
        expect(dictInitObjectStore).toHaveBeenCalledTimes(2);
        expect(dictInitObjectStore).toHaveBeenCalledAfter(dictConnectDB);
        // 最后触发一次ready
        expect(dictGetReady).toHaveBeenCalledOnce();
        expect(dictGetReady).toHaveBeenCalledAfter(dictInitObjectStore);
        // appConnection也会多次重新连接
        expect(appConnectToVersion).toHaveBeenNthCalledWith(1, 2);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(2, 3);
        expect(appConnectToVersion).toHaveLastResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledTimes(2);
        expect(appInit).toHaveLastResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledTimes(2);
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appInit);
        expect(appInitObjectStore).toHaveBeenCalledTimes(2);
        expect(appInitObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledTimes(2);
        expect(appGetReady).toHaveBeenCalledAfter(appInitObjectStore);
    });
    test('connection not ready and set item ok', async () => {
        const addressCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: 'myapp',
            objectStoreName: 'address-cache',
            dbVersion: 1,
            prefix: 'address:',
            connectOptions: {
                timeout: 1000,
                interval: 100,
                readyLog: true,
            },
        });
        const addressConnectToVersion = vi.spyOn(addressCache.store!, 'connectToVersion');
        const addressInit = vi.spyOn(addressCache.store!, 'init');
        const addressConnectDB = vi.spyOn(addressCache.store!, 'connectDB');
        const addressInitObjectStore = vi.spyOn(addressCache.store!, 'initObjectStore');
        const addressGetReady = vi.spyOn(addressCache.store!, 'getReady');
        const addressSetItem = vi.spyOn(addressCache.store!, 'setItem');
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
        expect(addressInit).toHaveBeenCalledTimes(3);
        expect(addressInit).toHaveBeenCalledAfter(addressConnectToVersion);
        // 连接数据库也会被触发三次
        expect(addressConnectDB).toHaveBeenCalledTimes(3);
        expect(addressConnectDB).toHaveBeenCalledAfter(addressInit);
        // 第一次连接db已经失败了，所以不会调用创建objectStore，所以被触发两次
        expect(addressInitObjectStore).toHaveBeenCalledTimes(2);
        expect(addressInitObjectStore).toHaveBeenCalledAfter(addressConnectDB);
        // 最后触发一次ready
        expect(addressGetReady).toHaveBeenCalledOnce();
        expect(addressGetReady).toHaveBeenCalledAfter(addressInitObjectStore);
        // appConnection也会多次重新连接
        expect(appConnectToVersion).toHaveBeenNthCalledWith(1, 2);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(2, 3);
        expect(appConnectToVersion).toHaveBeenNthCalledWith(3, 4);
        expect(appConnectToVersion).toHaveLastResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledTimes(3);
        expect(appInit).toHaveLastResolvedWith(appCache.store!);
        expect(appInit).toHaveBeenCalledAfter(appConnectToVersion);
        expect(appConnectDB).toHaveBeenCalledTimes(3);
        expect(appConnectDB).toHaveResolvedWith(appCache.store!.dbConnection);
        expect(appConnectDB).toHaveBeenCalledAfter(appInit);
        expect(appInitObjectStore).toHaveBeenCalledTimes(3);
        expect(appInitObjectStore).toHaveBeenCalledAfter(appConnectDB);
        expect(appGetReady).toHaveBeenCalledTimes(3);
        expect(appGetReady).toHaveBeenCalledAfter(appInitObjectStore);
    });
    test('createDBAndObjectStores', async () => {
        const dbName = 'test-db';
        const objectStoreNames = ['store1', 'store2', 'store3'];
        const createOptions: IDBObjectStoreParameters = {
            keyPath: 'key',
        };
        const dbConnection = await createDBAndObjectStores(dbName, objectStoreNames, createOptions);
        expect(dbConnection).toBeInstanceOf(IDBDatabase);
        expect(dbConnection.name).toBe(dbName);
        expect(dbConnection.objectStoreNames.length).toBe(objectStoreNames.length);
        for (const storeName of objectStoreNames) {
            expect(dbConnection.objectStoreNames.contains(storeName)).toBe(true);
        }
        // store1不用重新初始化，直接ready
        const store1Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: dbName,
            objectStoreName: 'store1',
            dbConnection: dbConnection,
            prefix: 'store1:',
        });
        const store1ConnectToVersion = vi.spyOn(store1Cache.store!, 'connectToVersion');
        const store1Init = vi.spyOn(store1Cache.store!, 'init');
        const store1ConnectDB = vi.spyOn(store1Cache.store!, 'connectDB');
        const store1InitObjectStore = vi.spyOn(store1Cache.store!, 'initObjectStore');
        const store1GetReady = vi.spyOn(store1Cache.store!, 'getReady');
        await store1Cache.ready();
        expect(store1ConnectToVersion).toHaveBeenCalledTimes(0);
        expect(store1Init).toHaveBeenCalledTimes(0);
        expect(store1ConnectDB).toHaveBeenCalledTimes(0);
        expect(store1InitObjectStore).toHaveBeenCalledTimes(0);
        expect(store1GetReady).toHaveBeenCalledTimes(1);
        // store2不用重新初始化，直接ready
        const store2Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: dbName,
            objectStoreName: 'store2',
            dbConnection: dbConnection,
            prefix: 'store2:',
        });
        const store2ConnectToVersion = vi.spyOn(store2Cache.store!, 'connectToVersion');
        const store2Init = vi.spyOn(store2Cache.store!, 'init');
        const store2ConnectDB = vi.spyOn(store2Cache.store!, 'connectDB');
        const store2InitObjectStore = vi.spyOn(store2Cache.store!, 'initObjectStore');
        const store2GetReady = vi.spyOn(store2Cache.store!, 'getReady');
        await store2Cache.ready();
        expect(store2ConnectToVersion).toHaveBeenCalledTimes(0);
        expect(store2Init).toHaveBeenCalledTimes(0);
        expect(store2ConnectDB).toHaveBeenCalledTimes(0);
        expect(store2InitObjectStore).toHaveBeenCalledTimes(0);
        expect(store2GetReady).toHaveBeenCalledTimes(1);
        // store3不用重新初始化，直接ready
        const store3Cache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
            dbName: dbName,
            objectStoreName: 'store3',
            dbConnection: dbConnection,
            prefix: 'store3:',
        });
        const store3ConnectToVersion = vi.spyOn(store3Cache.store!, 'connectToVersion');
        const store3Init = vi.spyOn(store3Cache.store!, 'init');
        const store3ConnectDB = vi.spyOn(store3Cache.store!, 'connectDB');
        const store3InitObjectStore = vi.spyOn(store3Cache.store!, 'initObjectStore');
        const store3GetReady = vi.spyOn(store3Cache.store!, 'getReady');
        await store3Cache.ready();
        expect(store3ConnectToVersion).toHaveBeenCalledTimes(0);
        expect(store3Init).toHaveBeenCalledTimes(0);
        expect(store3ConnectDB).toHaveBeenCalledTimes(0);
        expect(store3InitObjectStore).toHaveBeenCalledTimes(0);
        expect(store3GetReady).toHaveBeenCalledTimes(1);
    });
});
