import { describe, test, expect, vi } from 'vitest';
import { PerfectCache, IndexedDBStore } from '../src';
import type { IndexedDBStoreOptions } from '../src/types';

describe('indexedDB connection should be correct', () => {
    const appCache = new PerfectCache<IndexedDBStoreOptions, IndexedDBStore>('indexedDB', {
        dbName: 'perfectCache',
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
            dbName: 'perfectCache',
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
            dbName: 'perfectCache',
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
});
